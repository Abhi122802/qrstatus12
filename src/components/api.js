import { useCallback } from 'react';

// A custom hook to create an authenticated fetch instance.
// This allows us to use the `useNavigate` hook for redirects.
const useApi = () => {
    const apiFetch = useCallback(async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        // Use a relative URL for API calls. This works for both local development (with a proxy)
        // and for production on the same domain.
        const url = `/api${endpoint}`;

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