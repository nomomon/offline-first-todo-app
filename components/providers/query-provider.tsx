"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	type PersistQueryClientOptions,
	PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import type { AxiosError } from "axios";
import { del, get, set } from "idb-keyval";
import { useEffect, useMemo, useState } from "react";
import {
	createTodoCall,
	deleteTodoCall,
	updateTodoCall,
} from "@/lib/backend/todos";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

// Helper function to detect network errors
const isNetworkError = (error: unknown): boolean => {
	if (!error) return false;
	const axiosError = error as AxiosError;
	return (
		!axiosError.response &&
		(axiosError.code === "ERR_NETWORK" ||
			axiosError.code === "ECONNABORTED" ||
			axiosError.message === "Network Error")
	);
};

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
							// Retry network errors indefinitely (up to a reasonable limit)
							if (isNetworkError(error)) {
								return failureCount < 50; // Keep trying for network errors
							}
							// For other errors, only retry 3 times
							return failureCount < 3;
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
