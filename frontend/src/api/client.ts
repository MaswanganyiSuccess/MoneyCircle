import axios from 'axios'

// Create centralized axios instance using Vite env variable
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
})

// Request Interceptor: Inject JWT auth token into headers dynamically
apiClient.interceptors.request.use(
    (config) => {
        // Assuming token is stored in localStorage by your auth slice
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is due to an expired or invalid token
        if (error.response && error.response.status === 401) {
            // Clear local storage and force redirect to login
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
        }

        // Normalize error message for use in frontend alerts/toasts
        const errorMessage = error.response?.data?.message || 'Something went wrong'
        return Promise.reject(new Error(errorMessage))
    }
)

export default apiClient
