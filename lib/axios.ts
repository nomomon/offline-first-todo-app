import axios from "axios";

// Configure axios instance; the default adapter (XMLHttpRequest in browsers)
// works with service workers and allows requests to be cached.
const axiosInstance = axios.create({
	headers: {
		"Content-Type": "application/json",
	},
});

export default axiosInstance;
