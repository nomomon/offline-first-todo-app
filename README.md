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

## Building the App

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
