"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	type PersistQueryClientOptions,
	PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";
import { useEffect, useMemo, useState } from "react";
import {
	createTodoCall,
	deleteTodoCall,
	updateTodoCall,
} from "@/lib/backend/todos";
import {
	isNetworkError,
	MAX_NETWORK_ERROR_RETRIES,
	MAX_REGULAR_ERROR_RETRIES,
} from "@/lib/error-utils";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

type PersistOptions = Omit<PersistQueryClientOptions, "queryClient">;
type PersistedStorage = NonNullable<PersistOptions["persister"]>;

const createNoopPersister = (): PersistedStorage => ({
	persistClient: async () => undefined,
	restoreClient: async () => undefined,
	removeClient: async () => undefined,
});

const createIDBPersister = (key = "offline-first-react-query-cache") =>
	createAsyncStoragePersister({
		storage: {
			getItem: async (storageKey) => {
				const value = await get<string | null>(storageKey);
				return value ?? null;
			},
			setItem: async (storageKey, value) => {
				await set(storageKey, value);
			},
			removeItem: async (storageKey) => {
				await del(storageKey);
			},
		},
		key,
		throttleTime: 100,
	});

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						gcTime: DAY_IN_MS,
						staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh for this long
						networkMode: "offlineFirst",
						refetchOnMount: false, // Don't refetch on mount if we have cached data
						refetchOnWindowFocus: false, // Don't refetch when window regains focus
						refetchOnReconnect: true, // Do refetch when coming back online
						retry: 1, // Retry failed requests once
					},
					mutations: {
						gcTime: DAY_IN_MS,
						networkMode: "offlineFirst",
						retry: (failureCount, error) => {
							// Retry network errors more times to handle temporary connectivity issues
							if (isNetworkError(error)) {
								return failureCount < MAX_NETWORK_ERROR_RETRIES;
							}
							// For other errors, only retry a few times
							return failureCount < MAX_REGULAR_ERROR_RETRIES;
						},
						retryDelay: (attemptIndex) =>
							Math.min(1000 * 2 ** attemptIndex, 30000),
					},
				},
			}),
	);

	const [persister, setPersister] = useState<PersistedStorage>(() =>
		createNoopPersister(),
	);

	useEffect(() => {
		if (typeof window === "undefined") return;

		setPersister(createIDBPersister());

		// Set mutation defaults for offline persistence
		// This ensures mutations can be retried after app restart
		queryClient.setMutationDefaults(["createTodo"], {
			mutationFn: createTodoCall,
		});

		queryClient.setMutationDefaults(["updateTodo"], {
			mutationFn: updateTodoCall,
		});

		queryClient.setMutationDefaults(["deleteTodo"], {
			mutationFn: deleteTodoCall,
		});

		// Resume paused mutations when coming back online
		const handleOnline = () => {
			queryClient.resumePausedMutations();
		};

		window.addEventListener("online", handleOnline);
		return () => window.removeEventListener("online", handleOnline);
	}, [queryClient]);

	const persistOptions = useMemo<PersistOptions>(
		() => ({
			persister,
			maxAge: DAY_IN_MS,
			buster: "offline-first-cache-v1",
			dehydrateOptions: {
				// Persist every query and mutation so we survive offline restarts.
				shouldDehydrateQuery: () => true,
				shouldDehydrateMutation: () => true,
			},
		}),
		[persister],
	);

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={persistOptions}
			onSuccess={() => queryClient.resumePausedMutations()}
			onError={() => queryClient.clear()}
		>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</PersistQueryClientProvider>
	);
}
