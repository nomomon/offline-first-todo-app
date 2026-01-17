<a id="readme-top"></a>

<br />
<div align="center">
  <a href="https://github.com/nomomon/offline-first-todo-app">
    <img src="public/icons/icon-192x192.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Offline First Todo App</h3>

  <p align="center">
    🧪 <strong>A learning experiment in building offline-first PWAs</strong>
    <br />
    <em>A hands-on tutorial project exploring how to combine Service Workers and State Management for true offline capability</em>
    <br />
    <br />
    <a href="https://nomomon.xyz/posts/offline-first-pwa-tutorial"><strong>📖 Read the Full Tutorial »</strong></a>
    <br />
    <br />
    <a href="https://todo.nomomon.xyz">View Live Demo</a>
    ·
    <a href="https://github.com/nomomon/offline-first-todo-app/issues">Report Bug</a>
    ·
    <a href="https://github.com/nomomon/offline-first-todo-app/issues">Request Feature</a>
  </p>
</div>

> **Note:** This is a personal learning project documenting my journey building a warehouse management system for remote areas with unreliable internet. It serves as both a tutorial and reference implementation for anyone looking to understand offline-first architecture.

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

## About The Project

This project was born out of necessity while building a warehouse management system in a remote area of Kazakhstan. The internet there was unreliable or nonexistent, yet the app needed to be fully functional—allowing workers to scan products and tag locations without interruption.

I found plenty of resources on PWAs (Service Workers) and separate resources on State Management (TanStack Query), but very few on how to combine them effectively for a true "Offline First" experience.

This repository serves as that missing link: a reference implementation demonstrating how to merge **Serwist** (for app shell caching) and **TanStack Query** (for data persistence and mutation queueing).

**Core Capabilities:**
* **App Shell Caching:** Loads instantly even after a hard refresh without network (via Serwist).
* **Data Persistence:** Reads cached data immediately when offline (via TanStack Query Persister).
* **Mutation Queueing:** Queues actions (Create/Update/Delete) while offline and replays them automatically when connectivity is restored.
* **Optimistic UI:** Updates the interface immediately, treating offline actions as "success" until proven otherwise.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **PWA/Service Worker:** [Serwist](https://serwist.dev/)
* **State Management:** [TanStack Query](https://tanstack.com/query/latest) (with Persister)
* **Storage:** [LocalForage](https://github.com/localforage/localforage) (IndexedDB wrapper)
* **Database:** PostgreSQL (via Drizzle ORM)
* **Styling:** Tailwind CSS & Shadcn UI

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

* Node.js (v18+)
* pnpm
    ```sh
    npm install -g pnpm
    ```
* Docker (Optional, for running PostgreSQL)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/nomomon/offline-first-todo-app.git
    cd offline-first-todo-app
    ```
2.  Install packages
    ```sh
    pnpm install
    ```
3.  Set up environment variables. Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_app"
    NEXTAUTH_SECRET="your_super_secret_key"
    NEXTAUTH_URL="http://localhost:3000"
    GITHUB_ID=""
    GITHUB_SECRET=""
    ```
4.  Start the database (using Docker Compose)
    ```sh
    docker-compose up -d db
    ```
5.  Run database migrations
    ```sh
    pnpm db:migrate
    ```
6.  Start the development server
    ```sh
    pnpm dev
    ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Once running, the application acts as a fully offline-capable PWA.

1.  **Offline Simulation:** Open the browser DevTools, go to the Network tab, and set it to "Offline".
2.  **CRUD Actions:** Create, edit, or delete todos. Notice the UI updates immediately.
3.  **Sync:** Re-enable the network. You will see the pending requests fire automatically to sync with the server.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Mansur Nurmukhambetov - [@nomomon](https://github.com/nomomon)

Project Link: https://github.com/nomomon/offline-first-todo-app
