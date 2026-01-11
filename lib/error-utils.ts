import type { AxiosError } from "axios";

/**
 * Maximum number of retries for mutations that fail due to network errors.
 * Network errors are retried more times than other errors to handle
 * temporary connectivity issues and allow offline mutations to eventually succeed.
 */
export const MAX_NETWORK_ERROR_RETRIES = 50;

/**
 * Maximum number of retries for mutations that fail due to non-network errors.
 */
export const MAX_REGULAR_ERROR_RETRIES = 3;

/**
 * Checks if an error is a network error (no connection, timeout, etc.)
 * rather than an application error (400, 500, etc.)
 *
 * @param error - The error to check
 * @returns true if the error is a network error, false otherwise
 */
export const isNetworkError = (error: unknown): boolean => {
	if (!error || typeof error !== "object") return false;

	const axiosError = error as AxiosError;

	// Network errors have no response and specific error codes
	return (
		!axiosError.response &&
		(axiosError.code === "ERR_NETWORK" ||
			axiosError.code === "ECONNABORTED" ||
			axiosError.message === "Network Error")
	);
};
