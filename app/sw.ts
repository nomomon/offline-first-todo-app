/// <reference lib="webworker" />
import { PAGES_CACHE_NAME } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
	CacheFirst,
	ExpirationPlugin,
	NetworkFirst,
	Serwist,
	StaleWhileRevalidate,
} from "serwist";

const SW_CACHE_TIME_ONE_DAY_S = 60 * 60 * 24;
const SW_CACHE_TIME_SEVEN_DAYS_S = SW_CACHE_TIME_ONE_DAY_S * 7;

// ---- Serwist globals ----
declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

// ---- Serwist instance ----
const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	disableDevLogs: true,
	precacheOptions: {
		cleanupOutdatedCaches: true,
	},

	// IMPORTANT: define our own runtimeCaching instead of defaultCache
	// Using StaleWhileRevalidate strategy for offline-first behavior:
	// - Serves from cache immediately if available (instant load)
	// - Updates cache in background when online
	// - Works fully offline after initial page visits cache content
	runtimeCaching: [
		// 1) App Router RSC responses (Next.js 13+ App Router)
		{
			matcher: ({ request, url: { pathname }, sameOrigin }) =>
				request.headers.get("RSC") === "1" &&
				sameOrigin &&
				!pathname.startsWith("/api/"),
			handler: new StaleWhileRevalidate({
				cacheName: PAGES_CACHE_NAME.rsc,
				plugins: [
					new ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: SW_CACHE_TIME_ONE_DAY_S, // 1 day
					}),
				],
				matchOptions: {
					ignoreSearch: true,
					ignoreVary: true,
				},
			}),
		},

		// 2) HTML documents (navigations)
		{
			matcher: ({ request, url: { pathname }, sameOrigin }) =>
				request.destination === "document" &&
				sameOrigin &&
				!pathname.startsWith("/api/"),
			handler: new StaleWhileRevalidate({
				cacheName: PAGES_CACHE_NAME.html,
				plugins: [
					new ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: SW_CACHE_TIME_ONE_DAY_S,
					}),
				],
				matchOptions: {
					ignoreSearch: true,
					ignoreVary: true,
				},
			}),
		},

		// 3) JS + CSS (static resources)
		{
			matcher: ({ request }) =>
				request.destination === "script" || request.destination === "style",
			handler: new StaleWhileRevalidate({
				cacheName: "static-resources",
				matchOptions: {
					ignoreVary: true,
				},
			}),
		},

		// 4) Fonts + images + manifest
		{
			matcher: ({ request }) =>
				request.destination === "image" ||
				request.destination === "font" ||
				request.destination === "manifest",
			handler: new CacheFirst({
				cacheName: "static-media",
				plugins: [
					new ExpirationPlugin({
						maxEntries: 64,
						maxAgeSeconds: SW_CACHE_TIME_SEVEN_DAYS_S, // 7 days
					}),
				],
				matchOptions: {
					ignoreVary: true,
				},
			}),
		},

		// 5) API routes - NetworkFirst for offline-first API caching
		{
			matcher: ({ url }) => url.pathname.startsWith("/api/"),
			handler: new NetworkFirst({
				cacheName: "api",
				plugins: [
					new ExpirationPlugin({
						maxEntries: 32,
						maxAgeSeconds: SW_CACHE_TIME_ONE_DAY_S, // 1 day
					}),
				],
				networkTimeoutSeconds: 10, // Fall back to cache after 10s
			}),
		},
	],
});

// ---- Start Serwist ----
serwist.addEventListeners();
