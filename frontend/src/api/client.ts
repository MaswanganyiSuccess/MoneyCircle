import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, 
})


api.interceptors.request.use(
    (config) => {
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


api.interceptors.response.use(
    (response) => response,
    (error) => {
   
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
        }
        
        const errorMessage = error.response?.data?.message || 'Something went wrong'
        return Promise.reject(new Error(errorMessage))
    }
)

export default api;
