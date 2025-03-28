<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const transactions = ref([]);
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);
const loading = ref(false);
const errorMessage = ref('');

const fetchTransactions = async (page = 1) => {
    loading.value = true;
    errorMessage.value = '';

    try {
        const response = await api.get(`/admin/dashboard/transactions?page=${page}&per_page=10`);
        transactions.value = response.data.data.transactions.data;
        currentPage.value = response.data.data.transactions.current_page;
        lastPage.value = response.data.data.transactions.last_page;
        total.value = response.data.data.transactions.total;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        errorMessage.value = 'Gagal mengambil data transaksi';
    } finally {
        loading.value = false;
    }
};

const handleLogout = () => {
    localStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    router.push('/admin/login');
};

const changePage = (page) => {
    if (page >= 1 && page <= lastPage.value) {
        fetchTransactions(page);
    }
};

onMounted(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        router.push('/admin/login');
        return;
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchTransactions();
});
</script>

<template>
    <div class="admin-dashboard">
        <header class="dashboard-header">
            <h1>Admin Dashboard</h1>
            <button @click="handleLogout" class="logout-button">Logout</button>
        </header>

        <div class="dashboard-content">
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Transaksi</h3>
                    <p>{{ total }}</p>
                </div>
            </div>

            <div class="transactions-table">
                <h2>Daftar Transaksi</h2>
                
                <div v-if="loading" class="loading">
                    Memuat data...
                </div>

                <div v-else-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <table v-else>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipe</th>
                            <th>Jumlah</th>
                            <th>Deskripsi</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="transaction in transactions" :key="transaction.id">
                            <td>{{ transaction.id }}</td>
                            <td>{{ transaction.type }}</td>
                            <td>Rp {{ transaction.amount }}</td>
                            <td>{{ transaction.description }}</td>
                            <td>
                                <span :class="['status-badge', transaction.status]">
                                    {{ transaction.status }}
                                </span>
                            </td>
                            <td>{{ transaction.date }}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="pagination" v-if="lastPage > 1">
                    <button 
                        @click="changePage(currentPage - 1)"
                        :disabled="currentPage === 1"
                    >
                        Previous
                    </button>
                    
                    <span class="page-info">
                        Halaman {{ currentPage }} dari {{ lastPage }}
                    </span>

                    <button 
                        @click="changePage(currentPage + 1)"
                        :disabled="currentPage === lastPage"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-dashboard {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logout-button {
    padding: 0.5rem 1rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.logout-button:hover {
    background-color: #c82333;
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
    margin: 0;
    color: #666;
    font-size: 1rem;
}

.stat-card p {
    margin: 0.5rem 0 0;
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
}

.transactions-table {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
}

th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #eee;
}

th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-badge.success {
    background-color: #d4edda;
    color: #155724;
}

.status-badge.pending {
    background-color: #fff3cd;
    color: #856404;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}

.pagination button {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.page-info {
    color: #666;
}

.loading {
    text-align: center;
    padding: 2rem;
    color: #666;
}

.error-message {
    color: #dc3545;
    text-align: center;
    padding: 1rem;
    background-color: #f8d7da;
    border-radius: 4px;
    margin: 1rem 0;
}
</style> 