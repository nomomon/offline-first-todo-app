import axios from "axios";

// Configure axios to use the fetch adapter for better service worker integration
// This ensures axios requests go through the service worker and can be cached
const axiosInstance = axios.create({
	adapter: "fetch",
	headers: {
		"Content-Type": "application/json",
	},
});

export default axiosInstance;
