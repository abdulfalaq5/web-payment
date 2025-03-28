<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const balance = ref(0);
const loading = ref(false);
const errorMessage = ref('');

const fetchBalance = async () => {
    loading.value = true;
    errorMessage.value = '';
    
    try {
        const response = await api.get('/deposit');
        balance.value = response.data.data.amount;
    } catch (error) {
        console.error('Error fetching balance:', error);
        errorMessage.value = 'Gagal mengambil data saldo';
    } finally {
        loading.value = false;
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

onMounted(() => {
    fetchBalance();
});
</script>

<template>
    <div class="balance-container">
        <h1>Saldo Anda</h1>
        
        <div class="balance-card">
            <div v-if="loading" class="loading-text">
                Memuat saldo...
            </div>
            
            <div v-else-if="errorMessage" class="error-message">
                {{ errorMessage }}
                <button @click="fetchBalance" class="refresh-button">
                    Coba Lagi
                </button>
            </div>
            
            <div v-else class="balance-info">
                <div class="balance-label">Total Saldo:</div>
                <div class="balance-amount">{{ formatCurrency(balance) }}</div>
                <button @click="fetchBalance" class="refresh-button">
                    <span class="refresh-icon">↻</span> Refresh
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.balance-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.balance-card {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
    text-align: center;
}

.loading-text {
    color: #666;
    font-size: 16px;
    padding: 20px;
}

.balance-info {
    padding: 20px;
}

.balance-label {
    font-size: 18px;
    color: #666;
    margin-bottom: 10px;
}

.balance-amount {
    font-size: 36px;
    font-weight: bold;
    color: #4CAF50;
    margin-bottom: 20px;
}

.refresh-button {
    background-color: #fff;
    color: #4CAF50;
    border: 1px solid #4CAF50;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.refresh-button:hover {
    background-color: #4CAF50;
    color: white;
}

.refresh-icon {
    display: inline-block;
    margin-right: 5px;
}

.error-message {
    color: red;
    margin: 20px 0;
}
</style> 