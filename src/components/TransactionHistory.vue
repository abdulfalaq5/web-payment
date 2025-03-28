<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const transactions = ref([]);
const loading = ref(false);
const error = ref('');
const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0
});

const fetchTransactions = async (page = 1) => {
    loading.value = true;
    error.value = '';
    
    try {
        const response = await api.get(`/transaction`, {
            params: {
                per_page: pagination.value.perPage,
                page: page
            }
        });

        transactions.value = response.data.data.data;
        pagination.value = {
            currentPage: response.data.data.current_page,
            lastPage: response.data.data.last_page,
            perPage: response.data.data.per_page,
            total: response.data.data.total
        };
    } catch (err) {
        error.value = 'Gagal memuat data transaksi';
        console.error('Error fetching transactions:', err);
    } finally {
        loading.value = false;
    }
};

const changePage = (page) => {
    if (page >= 1 && page <= pagination.value.lastPage) {
        fetchTransactions(page);
    }
};

onMounted(() => {
    fetchTransactions();
});
</script>

<template>
    <div class="transaction-history">
        <h2>Riwayat Transaksi</h2>

        <div v-if="loading" class="loading">
            Memuat data...
        </div>

        <div v-else-if="error" class="error">
            {{ error }}
        </div>

        <div v-else>
            <div class="transaction-table">
                <table>
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Tipe</th>
                            <th>Jumlah</th>
                            <th>Status</th>
                            <th>Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="transaction in transactions" :key="transaction.transaction_date">
                            <td>{{ new Date(transaction.transaction_date).toLocaleString() }}</td>
                            <td>
                                <span :class="['type-badge', transaction.type.toLowerCase()]">
                                    {{ transaction.type }}
                                </span>
                            </td>
                            <td>Rp {{ Number(transaction.amount).toLocaleString() }}</td>
                            <td>
                                <span :class="['status-badge', transaction.status.toLowerCase()]">
                                    {{ transaction.status }}
                                </span>
                            </td>
                            <td>{{ transaction.description }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="pagination">
                <button 
                    :disabled="pagination.currentPage === 1"
                    @click="changePage(pagination.currentPage - 1)"
                >
                    Sebelumnya
                </button>
                
                <span class="page-info">
                    Halaman {{ pagination.currentPage }} dari {{ pagination.lastPage }}
                </span>
                
                <button 
                    :disabled="pagination.currentPage === pagination.lastPage"
                    @click="changePage(pagination.currentPage + 1)"
                >
                    Selanjutnya
                </button>
            </div>

            <div class="total-info">
                Total {{ pagination.total }} transaksi
            </div>
        </div>
    </div>
</template>

<style scoped>
.transaction-history {
    padding: 20px;
}

.transaction-table {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f5f5f5;
    font-weight: bold;
}

.type-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
}

.type-badge.deposit {
    background-color: #e3f2fd;
    color: #1976d2;
}

.type-badge.withdrawal {
    background-color: #fce4ec;
    color: #c2185b;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
}

.status-badge.success {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.status-badge.pending {
    background-color: #fff3e0;
    color: #f57c00;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.pagination button {
    padding: 8px 16px;
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
    font-size: 14px;
}

.total-info {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
    color: #666;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.error {
    text-align: center;
    padding: 20px;
    color: red;
}
</style>