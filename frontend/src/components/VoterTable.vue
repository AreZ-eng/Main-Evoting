<template>
  <div>
    <h3>Daftar Pemilih</h3>
    <table class="voter-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Hash</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="voter in voters"
          :key="voter.id"
          :class="{ selected: isSelected(voter) }"
          @click="toggleSelect(voter)"
        >
          <td>{{ voter.id }}</td>
          <td>{{ 
              voter.proses === 'sudah memilih' ? 'Sudah Memilih' :
              voter.proses === 'sedang memilih' ? 'Sedang Memilih' :
              'Belum Memilih'
              }}
          </td>
          <td>{{ voter.hash }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const voters = ref([])
const selectedVoters = ref([])

const isSelected = (voter) => selectedVoters.value.some(v => v.id === voter.id)

const toggleSelect = (voter) => {
  if (isSelected(voter)) {
    selectedVoters.value = selectedVoters.value.filter(v => v.id !== voter.id)
  } else {
    selectedVoters.value.push(voter)
  }
}

const selectAll = () => {
  selectedVoters.value = [...voters.value]
}

import api from '@/api/api.js'

const loadVoters = async () => {
  try {
    const token = sessionStorage.getItem('token')
    const response = await api.get('/api/election/getallvoters', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    voters.value = response.data.map(voter => ({
      id: voter.userId,
      proses: voter.proses,
      hash: voter.hash
    }))
  } catch (error) {
    console.error('Gagal memuat data pemilih:', error)
  }
}

defineExpose({
  loadVoters,
  selectedVoters,
  selectAll
})

onMounted(loadVoters)
</script>

<style scoped>
.voter-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

.voter-table th,
.voter-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.voter-table tr:hover {
  background-color: #f3f4f6;
  cursor: pointer;
}

.selected {
  background-color: #dbeafe !important;
}
</style>
