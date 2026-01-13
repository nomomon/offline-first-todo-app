"use client";

import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import localforage from "localforage";
import { useEffect, useState } from "react";

import {
	createTodoCall,
	deleteTodoCall,
	updateTodoCall,
} from "@/lib/backend/todos";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const persister = createAsyncStoragePersister({
	storage: localforage.createInstance({
		name: "offline-first-todo-app",
		storeName: "react-query",
	}),
});

const getHttpStatus = (error: unknown): number | undefined => {
	if (typeof error !== "object" || error === null) return undefined;
	if (!("response" in error)) return undefined;
	const response = (error as Record<string, unknown>).response;
	if (typeof response !== "object" || response === null) return undefined;
	const status = (response as Record<string, unknown>).status;
	return typeof status === "number" ? status : undefined;
};

function registerOfflineMutationDefaults(queryClient: QueryClient) {
	// Persisted mutations don't persist their mutationFn.
	// Register defaults so paused mutations can resume after a reload.
	queryClient.setMutationDefaults(["createTodo"], {
		mutationFn: createTodoCall,
	});

	queryClient.setMutationDefaults(["updateTodo"], {
		mutationFn: updateTodoCall,
	});

	queryClient.setMutationDefaults(["deleteTodo"], {
		mutationFn: deleteTodoCall,
	});
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						networkMode: "offlineFirst",
						gcTime: DAY_IN_MS,
						staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh for this long
						refetchOnMount: false, // Don't refetch on mount if we have cached data
						refetchOnWindowFocus: false, // Don't refetch when window regains focus
						refetchOnReconnect: true, // Do refetch when coming back online
						retry: 1, // Retry failed requests once
					},
					mutations: {
						networkMode: "offlineFirst",
						gcTime: DAY_IN_MS,
						retry: (failureCount, error: unknown) => {
							if (failureCount >= 3) {
								return false;
							}
							// Don't retry 4xx errors (client fault), only network/5xx
							const status = getHttpStatus(error);
							if (status !== undefined && status >= 400 && status < 500) {
								return false;
							}
							return true;
						},
						retryDelay: (attemptIndex) =>
							Math.min(1000 * 2 ** attemptIndex, 30000),
					},
				},
			}),
	);

	useEffect(() => {
		registerOfflineMutationDefaults(queryClient);
	}, [queryClient]);

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
				maxAge: DAY_IN_MS,
			}}
			onSuccess={() => {
				// Resume any paused mutations after state is restored from async storage.
				queryClient.resumePausedMutations().then(() => {
					queryClient.invalidateQueries();
				});
			}}
		>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</PersistQueryClientProvider>
	);
}
