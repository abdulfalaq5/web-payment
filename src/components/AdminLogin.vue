<script setup>
import { ref } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = 'Silakan isi semua field yang diperlukan';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        const response = await api.post('/admin/login', {
            email: email.value,
            password: password.value
        });

        // Store the token
        const token = response.data.access_token;
        localStorage.setItem('admin_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect to dashboard
        router.push('/admin/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = error.response?.data?.message || 'Gagal melakukan login';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="admin-login-container">
        <div class="login-form">
            <h2>Admin Login</h2>
            
            <div class="form-group">
                <label>Email:</label>
                <input 
                    type="email" 
                    v-model="email" 
                    placeholder="Masukkan email admin"
                    required
                />
            </div>

            <div class="form-group">
                <label>Password:</label>
                <input 
                    type="password" 
                    v-model="password" 
                    placeholder="Masukkan password"
                    required
                />
            </div>

            <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

            <button 
                @click="handleLogin" 
                :disabled="loading"
                class="submit-button"
            >
                {{ loading ? 'Memproses...' : 'Login' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.admin-login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

.login-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #666;
}

input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

input:focus {
    outline: none;
    border-color: #4CAF50;
}

.error-message {
    color: #dc3545;
    margin-bottom: 1rem;
    text-align: center;
}

.submit-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #45a049;
}

.submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style> 