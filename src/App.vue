<script setup>
import { ref, onMounted } from 'vue';
import api from './api';
import Withdrawal from './components/Withdrawal.vue';
import Balance from './components/Balance.vue';

const orderId = ref('');
const amount = ref('');
const snapToken = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const token = ref('');
const isScriptLoaded = ref(false);
const currentPage = ref('deposit');

const setInitialToken = async () => {
    try {
        const response = await api.get('/login');
        token.value = response.data.access_token;
        // Set token to axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
        await generateOrderId();
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.value = 'Gagal melakukan autentikasi';
    }
};

const generateOrderId = async () => {
    if (!token.value) {
        errorMessage.value = 'Token tidak tersedia';
        return;
    }

    try {
        const response = await api.get('/deposit/generate-order-id');
        orderId.value = response.data.data.order_id;
    } catch (error) {
        console.error('Error generating order ID:', error);
        errorMessage.value = 'Gagal mengambil Order ID';
    }
};

const createPayment = async () => {
    if (!token.value) {
        errorMessage.value = 'Token tidak tersedia';
        return;
    }

    if (!orderId.value || !amount.value) {
        errorMessage.value = 'Silakan isi semua field yang diperlukan';
        return;
    }

    loading.value = true;
    try {
        const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const response = await api.post('/deposit', {
            order_id: orderId.value,
            amount: parseInt(amount.value),
            timestamp: currentDateTime
        });
        console.log(response.data.data.snap_token);
        snapToken.value = response.data.data.snap_token;
        await payNow();
    } catch (error) {
        console.error('Error creating payment:', error);
        errorMessage.value = 'Gagal membuat pembayaran';
    } finally {
        loading.value = false;
    }
};

const loadMidtransScript = () => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.snap) {
            isScriptLoaded.value = true;
            return resolve();
        }

        const script = document.createElement('script');
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute('data-client-key', 'SB-Mid-client-BMaFRAY5z87oQ2jt');
        
        script.onload = () => {
            isScriptLoaded.value = true;
            resolve();
        };
        
        script.onerror = () => {
            isScriptLoaded.value = false;
            reject(new Error('Gagal memuat Midtrans script'));
        };

        document.head.appendChild(script);
    });
};

const payNow = async () => {
    if (!isScriptLoaded.value) {
        errorMessage.value = 'Midtrans belum dimuat. Mencoba memuat ulang...';
        try {
            await loadMidtransScript();
        } catch (error) {
            errorMessage.value = 'Gagal memuat Midtrans. Silakan refresh halaman';
            return;
        }
    }

    if (!window.snap) {
        errorMessage.value = 'Midtrans tidak tersedia. Silakan refresh halaman';
        return;
    }
    
    try {
        window.snap.pay(snapToken.value, {
            onSuccess: (result) => {
                console.log('Payment Success:', result);
                amount.value = '';
                generateOrderId();
                errorMessage.value = '';
            },
            onPending: (result) => {
                console.log('Payment Pending:', result);
                errorMessage.value = 'Pembayaran dalam proses';
            },
            onError: (result) => {
                console.log('Payment Failed:', result);
                errorMessage.value = 'Pembayaran gagal';
            },
            onClose: () => {
                // Handle ketika user menutup popup midtrans
                if (!isScriptLoaded.value) {
                    errorMessage.value = 'Popup pembayaran ditutup';
                }
            }
        });
    } catch (error) {
        console.error('Error in payNow:', error);
        errorMessage.value = 'Terjadi kesalahan saat memproses pembayaran';
    }
};

onMounted(async () => {
    try {
        loading.value = true;
        await loadMidtransScript();
        await setInitialToken();
    } catch (error) {
        console.error('Error initializing:', error);
        errorMessage.value = 'Gagal memuat aplikasi. Silakan refresh halaman';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="payment-container">
        <div class="nav-buttons">
            <button 
                :class="{ active: currentPage === 'balance' }" 
                @click="currentPage = 'balance'"
            >
                Cek Saldo
            </button>
            <button 
                :class="{ active: currentPage === 'deposit' }" 
                @click="currentPage = 'deposit'"
            >
                Deposit
            </button>
            <button 
                :class="{ active: currentPage === 'withdrawal' }" 
                @click="currentPage = 'withdrawal'"
            >
                Withdrawal
            </button>
        </div>

        <!-- Balance Component -->
        <Balance v-if="currentPage === 'balance'" />

        <!-- Deposit Form -->
        <div v-if="currentPage === 'deposit'">
            <h1>Pembayaran Deposit Midtrans</h1>
            
            <div v-if="!isScriptLoaded" class="alert warning">
                Memuat komponen pembayaran...
            </div>
            
            <div class="payment-form">
                <div class="form-group">
                    <label>Order ID:</label>
                    <input type="text" v-model="orderId" readonly />
                </div>
                
                <div class="form-group">
                    <label>Jumlah Deposit (Rp):</label>
                    <input 
                        type="number" 
                        v-model="amount" 
                        placeholder="Masukkan jumlah deposit"
                        min="1000"
                    />
                </div>

                <p class="error-message" v-if="errorMessage">{{ errorMessage }}</p>

                <button 
                    @click="createPayment" 
                    :disabled="loading || !orderId || !amount"
                >
                    {{ loading ? 'Memproses...' : 'Bayar Sekarang' }}
                </button>
            </div>
        </div>

        <!-- Withdrawal Form -->
        <Withdrawal v-if="currentPage === 'withdrawal'" />
    </div>
</template>

<style scoped>
.payment-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.payment-form {
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

input[readonly] {
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

.alert {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
}

.warning {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeeba;
}

.nav-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.nav-buttons button {
    flex: 1;
    padding: 10px;
    font-size: 14px;
}

.nav-buttons button.active {
    background-color: #4CAF50;
    color: white;
}

.nav-buttons button:hover {
    background-color: #4CAF50;
    color: white;
}
</style>
