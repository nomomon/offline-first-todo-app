# Offline First Todo App

Recently, I had to build an application for a warehouse. It's task was to scan products and label their addresses in the warehouse, so that this information could be used for optimal planning. Goal-wise, a standard CRUD app. However, the main challenge came from the requirements: it had to work even with no internet.

The warehouse is located in a remote area in Kazakhstan, where internet connections are bad. Moreover, some areas of the warehouse are far from the router, making the internet not accessible everywhere. This meant that, the app, had to:

1. Work offline, even on reload,
2. Cache data from the server,
3. Cache requests made to the server.

I've had experiences with all of these separelty, for example using service workers in Progressive Web Apps (PWA) to cache the website, and Tanstack Query persister feature, but I've never combined them. Moreover, I didn't really find a tutorial online which does this, so I here I am writting this one. :)

The stack I chose here is:
- Next.JS – for frontend and backend, but backend could have been anything else.
- Serwist – swiss army knife for service workers, using it was so much better than doing it by hand
- Tanstack Query – manages server state, works well with react hooks. It has a persist query plugin, which allows for seam-less caching queries from server and requests to it.

***

I suppose it's already apparent, that the requirement (1) is fully handled by Serwist, while requirements (2) and (3) by Tanstack Query. Meaning, they are not intertwined, which is nice. This allows me to structure the guide in three steps, making the app

It's good to mention that service workers interception of fetch events, and through that you could cache the server state, but that would require you to build the caching yourself. And using it with tanstack would be annoying cause, you basically manage the server state using both of them. A benefit from using a serwice work though is that you _could_ replay the requests when the device is back online, even if the webapp is closed. This is a nice feature, but IMHO not worth the hastle.

One also might ask, why not a mobile app? Which is a valid question, considering the circumstances. Mainly, 3 reasons:
- Skill issues. I can't find the time to learn a new mobile app development framework (like Flutter)
- React Native sucks. There are development quirks around components, which are different from HTML, and writing UI doesn't translate 1:1 from HTML to Native. Also, the UX while using it doesn't feel native IMHO. In that regard, the PWA is extremely smooth, if made well.
- I'm really well versed with React, and not bound to make native, so why not just stick to what I'm good at? 

While making the app, I saw that the TanstackQuery example for query persistance actually had a service worker which is kinda similar. However, they did a barebone SW setup, while I used Serwist.

## Part 0. Building the App

Won't go too much in depth. This will be a standard setup. If you are using this as a guide, I assume you already have the app built, and are looking for the offline part.

My stack:
- Frontend:
    - Next.JS
    - Tailwind css
    - Shadcn UI
    - TanStack Query
- Backend: 
    - Next.JS api routes
    - Postgres 
    - Drizzle
    - Next Auth
- Misc:
    - Biome (linting, formatting)
    - pnpm 
    - typescript

Structurally, I tried to keep things very “Next-ish” and boring:

- `app/` is just routing + layouts (route groups for auth vs app)
- `components/` is the UI building blocks (thin pages, most logic in components)
- `app/api/*` exposes the CRUD routes
- `lib/db/*` is where the DB + repo-ish functions live
- `components/providers/*` wires auth + theme + query persistence

From the "building the UI" perspective, this app is basically just assembling a bunch of small components and wiring them together. I used Shadcn UI as the base (buttons, dialogs, inputs, etc) and then built the todo-specific pieces on top (create/edit dialogs, date picker, priority select, list item skeletons). Next’s `app/` router made it pretty clean to split layouts (auth vs app) and keep the page components thin — most of the real work sits in `components/` and `lib/`.

==The communication with the backend is handled with TanStack Query. Apart from the basic setup, I made sure that the queries have proper optimistic updates and cache invalidations, so the UI feels snappy and always in sync with the server state. This allows for a smooth UX even when offline, as the app can rely on the cached data.==

On the backend side I tried to keep it boring: define the schema in Drizzle, write the small repository functions for users/todos, and expose them through Next.JS route handlers. Since it’s a CRUD app, the API is basically `GET/POST` for the collection and `PATCH/DELETE` for individual todos, plus a tiny counts route for the UI. Auth is handled with NextAuth, so the main job is just getting the session into the server routes and making sure every request is scoped to the current user.

## Part 1. PWA, Service Worker with Serwist

Before the “how”, here’s the main idea of how this app is put together:

- The service worker (Serwist) caches the **app shell**: HTML/RSC, JS/CSS, fonts, images. That’s what makes reloads work offline.
- TanStack Query caches the **server state** and **requests** (mutations). That’s what keeps the UI usable when offline without me reinventing caching.

Important detail: the SW in this repo intentionally **doesn’t cache** `/api/*`. If you cache API responses in the SW *and* you persist TanStack Query, you now have 2 different caches that can disagree, and you’ll chase ghosts.

### 1) Install Serwist + wire it into Next

First, install the packages:

- `pnpm add @serwist/next`
- `pnpm add -D serwist`

Then follow the official Serwist Next.js guide (it stays up to date, and covers Turbopack quirks too):

- Getting started: https://serwist.pages.dev/docs/next/getting-started
- Configuring: https://serwist.pages.dev/docs/next/configuring
- Turbopack notes: https://serwist.pages.dev/docs/next/turbo

In this repo I run Next with webpack (`--webpack`), because the Serwist integration here is configured via `@serwist/next`.

Now hook Serwist into Next config. This is the part that builds your SW into `public/sw.js`.

```diff
// next.config.ts
+import withSerwistInit from "@serwist/next";
+import type { NextConfig } from "next";
+
+const withSerwist = withSerwistInit({
+  swSrc: "app/sw.ts",
+  swDest: "public/sw.js",
+});
+
+const nextConfig: NextConfig = {
+  output: "standalone",
+};
+
+export default withSerwist(nextConfig);
```

Make sure to keep `swDest` inside `public/`, otherwise the browser won’t be able to fetch the worker.

### 2) Add a basic Service Worker

Then create the SW source file and define what you cache.

```diff
// app/sw.ts
+/// <reference lib="webworker" />
+import { PAGES_CACHE_NAME } from "@serwist/next/worker";
+import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
+import { CacheFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";
+
+declare global {
+  interface WorkerGlobalScope extends SerwistGlobalConfig {
+    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
+  }
+}
+
+declare const self: ServiceWorkerGlobalScope;
+
+const serwist = new Serwist({
+  precacheEntries: self.__SW_MANIFEST,
+  skipWaiting: true,
+  clientsClaim: true,
+
+  runtimeCaching: [
+    // Don’t cache API by default. Let TanStack Query handle that layer.
+    {
+      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith("/api/"),
+      handler: new NetworkOnly(),
+    },
+
+    // Cache app shell so reload works offline.
+    {
+      matcher: ({ request, sameOrigin }) =>
+        request.headers.get("RSC") === "1" && sameOrigin,
+      handler: new StaleWhileRevalidate({ cacheName: PAGES_CACHE_NAME.rsc }),
+    },
+
+    // Icons/manifest/images are safe to cache-first.
+    {
+      matcher: ({ request }) => request.destination === "image" || request.destination === "manifest",
+      handler: new CacheFirst({ cacheName: "static-media" }),
+    },
+  ],
+});
+
+serwist.addEventListeners();
```

Make sure you don’t “over-cache” here. Caching HTML/RSC + static assets is what gives you offline reloads. Caching API is where you can accidentally ship stale data forever.

### 3) Add the manifest

Next, add a web manifest so the app is installable.

```diff
// app/manifest.json
+{
+  "name": "Offline First Todo",
+  "short_name": "Offline Todos",
+  "start_url": "/?source=pwa",
+  "scope": "/",
+  "display": "standalone",
+  "orientation": "portrait",
+  "background_color": "#f7f5f2",
+  "theme_color": "#c55b2e",
+  "icons": [
+    {
+      "src": "/icons/icon-192x192.png",
+      "sizes": "192x192",
+      "type": "image/png",
+      "purpose": "maskable"
+    },
+    {
+      "src": "/icons/icon-512x512.png",
+      "sizes": "512x512",
+      "type": "image/png"
+    }
+  ]
+}
```

After that, make sure the icon files actually exist in `public/icons/`, otherwise install prompts can get weird and Lighthouse will complain.

### 4) Connect the manifest + PWA metadata in the layout

Finally, expose the manifest and set the PWA-ish metadata. This is what makes browsers “see” your app as installable + sets theme colors.

```diff
// app/layout.tsx
+import type { Metadata, Viewport } from "next";
+
+const APP_NAME = "Offline First Todo";
+const APP_DEFAULT_TITLE = "Offline First Todo | Works without internet";
+const APP_TITLE_TEMPLATE = "%s | Offline First Todo";
+const APP_DESCRIPTION = "Offline-capable task manager...";
+
+export const metadata: Metadata = {
+  applicationName: APP_NAME,
+  title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
+  description: APP_DESCRIPTION,
+  manifest: "/manifest.json",
+  appleWebApp: {
+    capable: true,
+    statusBarStyle: "default",
+    title: APP_DEFAULT_TITLE,
+  },
+};
+
+export const viewport: Viewport = {
+  themeColor: [
+    { media: "(prefers-color-scheme: light)", color: "#f7f5f2" },
+    { media: "(prefers-color-scheme: dark)", color: "#1f1a18" },
+  ],
+};
```

Make sure to keep the manifest path as `"/manifest.json"`. In Next, `app/manifest.json` is exposed at that route.

Finally: remember that service workers only work on HTTPS (or `localhost`). If you’re testing caching and things look “stuck”, unregister the SW / clear site data — stale SWs are classic.

That’s it for the “PWA shell”. After this, you can focus on the “real offline part”: persisting queries and mutations with TanStack Query.
