import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// A custom hook to create an authenticated fetch instance.
// This allows us to use the `useNavigate` hook for redirects.
export const useApi = () => {
    const navigate = useNavigate();

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

        // Centralized 401 error handling
        if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/create'); // Redirect to login on any unauthorized request
            // Throw an error to stop the original component's logic
            throw new Error('Unauthorized');
        }

        return response;
    }, [navigate]);


    return apiFetch;
};