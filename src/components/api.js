import { useCallback } from 'react';

// A custom hook to create an authenticated fetch instance.
// This allows us to use the `useNavigate` hook for redirects.
const useApi = () => {
    const apiFetch = useCallback(async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const url = `https://backendqrscan-uhya.vercel.app/api${endpoint}`; // Ensure this is your correct backend URL

        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        return response;
    }, []);

    return apiFetch;
};

export default useApi;