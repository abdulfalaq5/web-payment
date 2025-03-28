<script setup>
import { ref } from 'vue';
import api from '../api';

const amount = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const createWithdrawal = async () => {
    if (!amount.value) {
        errorMessage.value = 'Silakan masukkan jumlah penarikan';
        return;
    }

    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    try {
        const response = await api.post('/withdrawal', {
            amount: parseInt(amount.value)
        });
        
        successMessage.value = 'Penarikan berhasil diproses';
        amount.value = ''; // Reset form
    } catch (error) {
        console.error('Error creating withdrawal:', error);
        errorMessage.value = error.response?.data?.message || 'Gagal memproses penarikan';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="withdrawal-container">
        <h1>Penarikan Dana</h1>
        
        <div class="withdrawal-form">
            <div class="form-group">
                <label>Jumlah Penarikan (Rp):</label>
                <input 
                    type="number" 
                    v-model="amount" 
                    placeholder="Masukkan jumlah penarikan"
                    min="10000"
                    :disabled="loading"
                />
            </div>

            <p class="success-message" v-if="successMessage">{{ successMessage }}</p>
            <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

            <button 
                @click="createWithdrawal" 
                :disabled="loading || !amount"
            >
                {{ loading ? 'Memproses...' : 'Tarik Dana' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.withdrawal-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.withdrawal-form {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.form-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

input:disabled {
    background-color: #eee;
}

button {
    width: 100%;
    padding: 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.error-message {
    color: red;
    margin-bottom: 10px;
}

.success-message {
    color: green;
    margin-bottom: 10px;
}
</style> 