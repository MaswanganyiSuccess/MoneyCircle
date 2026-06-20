import api from './client.ts'

 const authService = {
    /**
     * Authenticate an existing user
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);

            // If success, store data securely in localStorage
            if (response.success && response.data) {
                localStorage.setItem('accessToken', response.data.tokens.accessToken);
                localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response;
        } catch (error) {
            throw error; 
        }
    },

    /**
     * Register a new borrower or lender profile
     * @param {Object} profileData - Matches your NCR/South African validation rule requirements
     */
    register: async (profileData) => {
        try {
            return await api.post('/auth/register', profileData);
        } catch (error) {
            throw error;
        }
    },
    
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};
export default authService;