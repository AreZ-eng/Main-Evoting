<template>
  <div class="tallying-container">
    <h2>Halaman Penghitungan Suara</h2>
    
    <div class="controls">
      <button @click="getAllBallots" :disabled="isLoading">
        🗳️ Ambil Data Ballot Setiap TPS
      </button>

      <button @click="showResults" :disabled="isLoading">
        📰 Hasil Pemilihan Umum
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Nomor TPS</th>
          <th>Status Ballot</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tps in tpsData" :key="tps.id">
          <td>{{ tps.id }}</td>
          <td>
            <span :class="{ 'status-available': tps.status === 'exists', 'status-unavailable': tps.status === 'missing' }">
              {{ tps.status === 'exists' ? 'Tersedia' : 'Tidak Tersedia' }}
            </span>
          </td>
          <td class="action-cell">
            <button 
              v-if="tps.status === 'missing'"
              @click="getBallotForTps(tps.id)"
              :disabled="isLoading"
              class="action-button"
            >
              📥 Ambil Ballot
            </button>
            <button
              v-if="tps.status === 'exists'"
              @click="showTpsResults(tps.id)"
              :disabled="isLoading"
              class="action-button view-results"
            >
              📊 Lihat Hasil
            </button>

            <button
              v-if="tps.status === 'exists'"
              @click="getBallotForTps(tps.id)"
              :disabled="isLoading"
              class="action-button view-results"
            >
              🔄 Update Data
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isLoading" class="loading-overlay">
      <Spinner />
    </div>

    <div v-if="showPasswordDialog" class="password-dialog">
      <div class="dialog-content">
        <h3>Masukkan Password</h3>
        <input 
          type="password" 
          v-model="password" 
          placeholder="Masukkan password"
          @keyup.enter="confirmPassword"
        />
        <div class="dialog-buttons">
          <button @click="confirmPassword">Konfirmasi</button>
          <button @click="cancelPassword">Batal</button>
        </div>
      </div>
    </div>

    <!-- Modal Hasil Suara TPS -->
    <div v-if="showResultsModal" class="results-modal" @click.self="closeResultsModal">
      <div class="results-content">
        <div class="results-header">
          <h3>Hasil Perhitungan Suara TPS {{ selectedTps }}</h3>
          <button class="close-button" @click="closeResultsModal">×</button>
        </div>
        
        <div v-if="tpsResults.length" class="results-body">
          <div class="results-summary">
            <div v-for="(result, index) in tpsResults" :key="result.candidate" class="result-row">
              <div class="candidate-info">
                <div class="candidate-number">{{ index + 1 }}</div>
                <div class="candidate-details">
                  <h4>{{ result.candidate }}</h4>
                </div>
              </div>
              <div class="vote-info">
                <div class="vote-count">
                  <span class="number">{{ result.totalVotes }}</span>
                  <span class="label">Suara</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-results">
          Belum ada data hasil suara
        </div>
      </div>
    </div>

    <!-- Modal Hasil Pemilihan Umum -->
    <ElectionResultsModal 
      :show="showElectionResults"
      :results="electionResults"
      :processed-tps-count="processedTpsCount"
      @close="closeElectionResults"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/api.js'
import Spinner from './Spinner.vue'
import ElectionResultsModal from './ElectionResultsModal.vue'

const tpsData = ref([])
const isLoading = ref(false)
const showPasswordDialog = ref(false)
const password = ref('')
const pendingAction = ref(null)

// State untuk modal hasil TPS
const showResultsModal = ref(false)
const selectedTps = ref(null)
const tpsResults = ref([])

// State untuk modal hasil pemilihan umum
const showElectionResults = ref(false)
const electionResults = ref([])
const processedTpsCount = ref(0)

const checkTpsStatus = async () => {
  try {
    isLoading.value = true
    const token = sessionStorage.getItem('token')
    const response = await api.get('/api/election/checktpsStatus', {
      headers: { Authorization: `Bearer ${token}` }
    })
    tpsData.value = response.data.results
  } catch (error) {
    console.error('Error checking TPS status:', error)
    alert('Gagal mengambil status TPS')
  } finally {
    isLoading.value = false
  }
}

const getAllBallots = async () => {
  pendingAction.value = async () => {
    try {
      isLoading.value = true
      const token = sessionStorage.getItem('token')
      await api.post('/api/election/getballots', {
        epassword: password.value,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await checkTpsStatus()
      alert('Berhasil mengambil data ballot semua TPS')
    } catch (error) {
      console.error('Error getting ballot sums:', error)
      alert('Gagal mengambil data ballot TPS')
    } finally {
      isLoading.value = false
      showPasswordDialog.value = false
      password.value = ''
    }
  }
  showPasswordDialog.value = true
}

const getBallotForTps = (tpsId) => {
  pendingAction.value = async () => {
    try {
      isLoading.value = true
      const token = sessionStorage.getItem('token')
      const response = await api.post('/api/election/getballotstps', {
        epassword: password.value,
        tps: tpsId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data && response.data.message) {
        alert(response.data.message)
      }
      
      await checkTpsStatus()
    } catch (error) {
      console.error('Error getting ballot for TPS:', error)
      const errorMessage = error.response?.data?.message || 'Gagal mengambil data ballot TPS'
      alert(errorMessage)
    } finally {
      isLoading.value = false
      showPasswordDialog.value = false
      password.value = ''
    }
  }
  showPasswordDialog.value = true
}

const showResults = async () => {
  pendingAction.value = async () => {
    try {
      isLoading.value = true
      const token = sessionStorage.getItem('token')
      const response = await api.post('/api/election/getsumballots', {
        epassword: password.value,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      electionResults.value = response.data.data || []
      processedTpsCount.value = response.data.processedTpsCount || 0
      showElectionResults.value = true
    } catch (error) {
      console.error('Error getting election results:', error)
      alert('Gagal menampilkan hasil pemilihan umum')
    } finally {
      isLoading.value = false
      showPasswordDialog.value = false
      password.value = ''
    }
  }
  showPasswordDialog.value = true
}

const showTpsResults = async (tpsId) => {
  pendingAction.value = async () => {
    try {
      isLoading.value = true
      const token = sessionStorage.getItem('token')
      const response = await api.post('/api/election/getsumballotsontps', {
        epassword: password.value,
        tps: tpsId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      selectedTps.value = tpsId
      tpsResults.value = response.data.result || []
      showResultsModal.value = true
    } catch (error) {
      console.error('Error getting TPS results:', error)
      alert('Gagal menampilkan hasil suara TPS')
    } finally {
      isLoading.value = false
      showPasswordDialog.value = false
      password.value = ''
    }
  }
  showPasswordDialog.value = true
}

const closeResultsModal = () => {
  showResultsModal.value = false
  selectedTps.value = null
  tpsResults.value = []
}

const confirmPassword = async () => {
  if (password.value && pendingAction.value) {
    await pendingAction.value()
  }
}

const cancelPassword = () => {
  showPasswordDialog.value = false
  password.value = ''
  pendingAction.value = null
}

const closeElectionResults = () => {
  showElectionResults.value = false
  electionResults.value = []
  processedTpsCount.value = 0
}

onMounted(checkTpsStatus)
</script>

<style scoped>
.tallying-container {
  padding: 20px;
  margin-top: 60px;
  position: relative;
}

.controls {
  margin: 20px 0;
}

.status-available {
  color: #22c55e;
  font-weight: bold;
}

.status-unavailable {
  color: #ef4444;
  font-weight: bold;
}

table {
  width: 100%;
  margin-top: 20px;
}

th {
  text-align: left;
}

.action-cell {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 6px 12px;
  font-size: 0.875rem;
  min-width: auto;
  margin: auto;
}

.view-results {
  background-color: #0ea5e9;
}

.view-results:hover {
  background-color: #0284c7;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.password-dialog, .results-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content, .results-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
}

.results-content {
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  min-width: auto;
  margin: 0;
}

.close-button:hover {
  color: #000;
}

.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.candidate-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.candidate-image {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  border-radius: 60px;
  overflow: hidden;
  background: #e5e7eb;
}

.candidate-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.candidate-card h4 {
  margin: 10px 0;
  color: #1e293b;
}

.vote-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.vote-count .number {
  font-size: 24px;
  font-weight: bold;
  color: #0ea5e9;
}

.vote-count .label {
  font-size: 14px;
  color: #64748b;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.dialog-content h3 {
  margin-bottom: 15px;
}

.dialog-content input {
  width: 100%;
  margin-bottom: 15px;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.dialog-buttons button {
  flex: 1;
}

.results-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.results-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
}

.results-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  min-width: auto;
  margin: 0;
  transition: color 0.2s;
}

.close-button:hover {
  color: #1e293b;
}

.results-body {
  padding: 20px;
}

.results-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.candidate-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.candidate-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0ea5e9;
  color: white;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.25rem;
}

.candidate-details {
  display: flex;
  flex-direction: column;
}

.candidate-details h4 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.vote-info {
  text-align: right;
}

.vote-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.vote-count .number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #0ea5e9;
}

.vote-count .label {
  font-size: 0.875rem;
  color: #64748b;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.1rem;
}
</style>
