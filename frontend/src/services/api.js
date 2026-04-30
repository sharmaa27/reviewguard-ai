import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/api`
        : 'http://localhost:5001/api'
});

export const productAPI = {
    getAll: () => API.get('/products'),
    getById: (id) => API.get(`/products/${id}`),
    seed: () => API.post('/products/seed')
};

export const reviewAPI = {
    submit: (data) => API.post('/reviews', data),
    analyze: (text) => API.post('/reviews/analyze', { text }),
    getStats: () => API.get('/reviews/stats')
};

export default API;
