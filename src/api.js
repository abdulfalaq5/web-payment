import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:9191/api', // Sesuaikan dengan Laravel API
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;
