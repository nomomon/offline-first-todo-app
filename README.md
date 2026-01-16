# Building an Offline-First Todo App with Serwist and TanStack Query

I recently built a warehouse app in rural Kazakhstan. The job was simple: scan products, tag their locations, sync to a server. Standard CRUD. The catch: internet was unreliable or nonexistent in parts of the building.

The app had to:
1. Load and function with no network (even after a refresh)
2. Cache data fetched from the server
3. Queue mutations and replay them when back online

I've used service workers and TanStack Query separately before, but combining them for true offline-first was new territory. I couldn't find a tutorial that covered both, so here's mine.

**Stack:**
- **Frontend:** Next.js, TanStack Query, Tailwind, Shadcn UI
- **Backend:** Next.js API routes, Postgres, Drizzle, NextAuth
- **Offline:** Serwist (service worker), TanStack Query Persister

The nice thing: Serwist handles requirement #1 (app shell caching), and TanStack Query handles #2 and #3 (server state + mutation queue). They don't step on each other.

---

## Part 1: Making the App Load Offline (Serwist)

Follow the [Serwist setup guide](https://serwist.dev/docs/getting-started/installation). I used the webpack config, but there's a turbopack option too.

The key is your `runtimeCaching` config in `sw.ts`. Here's mine:

````ts
const serwist = new Serwist({
    // ...
    runtimeCaching: [
        // Never cache API routes—let TanStack Query handle those
        {
            matcher: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.startsWith("/api/"),
            handler: new NetworkOnly(),
        },

        // Cache everything else (HTML, JS, CSS, images)
        {
            matcher: ({ url, sameOrigin }) =>
                sameOrigin && !url.pathname.startsWith("/api/"),
            handler: new StaleWhileRevalidate({
                cacheName: "runtime-cache",
                plugins: [
                    new ExpirationPlugin({
                        maxEntries: 200,
                        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                    }),
                ],
                matchOptions: {
                    ignoreSearch: true,
                    ignoreVary: true,
                },
            }),
        },
    ],
});
````

**Why `StaleWhileRevalidate`?** The app loads instantly from cache, then quietly updates in the background. For an app shell, this feels snappier than `CacheFirst` (which never revalidates) or `NetworkFirst` (which blocks on network).

**Why `ignoreVary: true`?** Next.js sometimes sends `Vary` headers that can cause cache misses on dynamic routes. This sidesteps that.

**The tradeoff:** If someone doesn't open the app for 7+ days and they're offline, the cache expires and the app won't load. Bump `maxAgeSeconds` if your users go longer between visits.

---

## Part 2: Caching Server State (TanStack Query)

All server interactions go through TanStack Query hooks—`useQuery` for reads, `useMutation` for writes. To persist the cache across sessions, you need `@tanstack/query-async-storage-persister`.

Here's the provider setup:

````tsx
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import localforage from "localforage";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const persister = createAsyncStoragePersister({
    storage: localforage.createInstance({
        name: "offline-first-todo-app",
        storeName: "react-query",
    }),
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    networkMode: "offlineFirst",
                    gcTime: DAY_IN_MS,
                    staleTime: 5 * 60 * 1000,
                    retry: 1,
                },
                mutations: {
                    networkMode: "offlineFirst",
                },
            },
        })
    );

    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, maxAge: DAY_IN_MS }}
            onSuccess={() => {
                queryClient.resumePausedMutations().then(() => {
                    queryClient.invalidateQueries();
                });
            }}
        >
            {children}
        </PersistQueryClientProvider>
    );
}
````

**What's different from a normal setup:**

1. **Storage:** `localforage` wraps IndexedDB. This is where your cache lives when the tab closes.
2. **Provider:** `PersistQueryClientProvider` rehydrates the cache on load.
3. **`onSuccess`:** After rehydration, `resumePausedMutations()` replays any mutations that were queued while offline.
4. **`networkMode: "offlineFirst"`:** This is critical. By default, TanStack Query pauses entirely when the browser reports no network. This mode lets it serve cached data anyway.

---

## Important: Mutations Don't Serialize

Here's where I got stuck for a while.

When you queue a mutation offline, TanStack Query persists the *data* (e.g., the new todo object). But it can't persist the *function* that executes it. So if the user reloads while offline, the mutation is stuck—it has the payload but no idea what to do with it.

Fix: re-register mutation functions on startup.

````tsx
function registerOfflineMutationDefaults(queryClient: QueryClient) {
    queryClient.setMutationDefaults(["createTodo"], {
        mutationFn: createTodo,
    });
    queryClient.setMutationDefaults(["updateTodo"], {
        mutationFn: updateTodo,
    });
    queryClient.setMutationDefaults(["deleteTodo"], {
        mutationFn: deleteTodo,
    });
}
````

Call this before rendering. Now when `resumePausedMutations()` runs, it knows which function to call for each mutation key.

---

## Optimistic Updates (Important for Offline)

If you're offline and create a todo, you can't wait for the server. The UI needs to update immediately. This means manually updating the cache in `onMutate`:

````tsx
useMutation({
    mutationKey: ["createTodo"],
    mutationFn: createTodo,
    onMutate: async (newTodo) => {
        await queryClient.cancelQueries({ queryKey: ["todos"] });
        const previous = queryClient.getQueryData(["todos"]);

        queryClient.setQueryData(["todos"], (old: Todo[]) => [
            ...old,
            { ...newTodo, id: crypto.randomUUID(), createdAt: new Date() },
        ]);

        return { previous };
    },
    onError: (_err, _newTodo, context) => {
        queryClient.setQueryData(["todos"], context?.previous);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
});
````

The pattern: snapshot the old data, optimistically insert the new item with a temporary ID, and roll back on error. When the mutation eventually succeeds (maybe hours later), `onSettled` invalidates the query to sync with the real server state.

For more details, see the [TanStack Query docs on optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates).

---

## Wrapping Up

Honestly, this mix qas really nice. It was a while since setting up offline apps by hand—it and it was just too hard, but Serwist made it super simple. And since I already use TanStack Query for data, hooking them up felt really natural.

I love that they just work side-by-side without getting in each other's way. Definitely sticking with this setup!

[Full source on GitHub](https://github.com/nomomon/offline-first-todo-app)
