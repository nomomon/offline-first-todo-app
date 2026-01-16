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

The communication with the backend is handled with TanStack Query. Apart from the basic setup, I made sure that the queries have proper optimistic updates and cache invalidations, so the UI feels snappy and always in sync with the server state. This allows for a smooth UX even when offline, as the app can rely on the cached data.

On the backend side I tried to keep it boring: define the schema in Drizzle, write the small repository functions for users/todos, and expose them through Next.JS route handlers. Since it’s a CRUD app, the API is basically `GET/POST` for the collection and `PATCH/DELETE` for individual todos, plus a tiny counts route for the UI. Auth is handled with NextAuth, so the main job is just getting the session into the server routes and making sure every request is scoped to the current user.

## Part 1. Making it work offline (Serwist)

To begin, follow the default [Serwist setup guide](https://serwist.dev/docs/getting-started/installation). I just used the webpack setup, so I needed to add a webpack flag to my dev and build scripts in `package.json`, but you can also do the [turbopack setup](https://serwist.pages.dev/docs/next/turbo) if you want.

Afterwards, setup the `runtimeCaching` in the `sw.ts`. For an offline first app, I recommend to fully cache the app shell (HTML, CSS, JS) and static assets (images, fonts). This way, the app will load even when offline. Here's an example configuration:

```ts
const serwist = new Serwist({
    ...
    runtimeCaching: [
        // Never cache API requests
        {
            matcher: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.startsWith("/api/"),
            handler: new NetworkOnly(),
        },

        // Cache everything else
        {
            matcher: ({ url, sameOrigin }) =>
                sameOrigin && !url.pathname.startsWith("/api/"),
            handler: new StaleWhileRevalidate({
                cacheName: "runtime-cache",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 200,
                        maxAgeSeconds: SW_CACHE_TIME_SEVEN_DAYS_S,
                    }),
                ],
                matchOptions: {
                    ignoreSearch: true, // <-- ignore query params
                    ignoreVary: true, // <-- helps with Next.JS dynamic content
                },
            }),
        },
    ],
});
```

The idea is to never cache API requests, so that Tanstack Query can handle them. Everything else is cached using the `StaleWhileRevalidate` strategy, which means that the app will load from cache first, and then update the cache in the background. 

For this example app, I had a more descriptive caching strategy, where I cached fonts and images separately with longer expiration times, but the above is a good starting point.

Using the `maxAgeSeconds` setting allows you to control the maximum age of an entry before it’s treated as stale and removed. Meaning, if you set it to 7 days, after this time the cached assets will be removed, and the app will fetch them from the network again. 

After a week of not visiting the app, and being offline, the app will not load until you go online once. You can set that config to a higher value if you want, but that depends on your use case.

## Part 2. Caching server state (Tanstack Query)
