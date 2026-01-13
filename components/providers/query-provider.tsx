"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						gcTime: DAY_IN_MS,
						staleTime: 5 * 60 * 1000, // 5 minutes - consider data fresh for this long
						refetchOnMount: false, // Don't refetch on mount if we have cached data
						refetchOnWindowFocus: false, // Don't refetch when window regains focus
						refetchOnReconnect: true, // Do refetch when coming back online
						retry: 1, // Retry failed requests once
					},
					mutations: {
						gcTime: DAY_IN_MS,
						retry: (failureCount, error: any) => {
							if (failureCount >= 3) {
								return false;
							}
							// Don't retry 4xx errors (client fault), only network/5xx
							if (
								error?.response?.status >= 400 &&
								error?.response?.status < 500
							) {
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

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
