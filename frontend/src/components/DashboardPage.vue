<template>
  <div>
    <h2>Dashboard Admin</h2>

    <div class="controls">
      <button @click="refreshTable">🔄 Refresh</button>
      <button v-if="selectedCount === 0" @click="selectAll">☑️ Pilih Semua</button>
      <button v-else @click="unselectAll">❌ Batalkan Pilihan</button>
      <button :disabled="!canReset" @click="resetVote">🗑️ Reset Suara</button>
      <button @click="autoInsertVotes">✨ Auto Insert Votes</button>
    </div>

    <VoterTable ref="voterTable" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import VoterTable from './VoterTable.vue'

const voterTable = ref(null)

const refreshTable = () => {
  voterTable.value.loadVoters()
}

const selectedCount = computed(() => voterTable.value?.selectedVoters.length || 0)

const selectAll = () => {
  voterTable.value.selectAll()
}

const unselectAll = () => {
  voterTable.value.selectedVoters = []
}

import api from '@/api/api.js'

const resetVote = async () => {
  const voters = voterTable.value.selectedVoters
  if (!voters.length) return

  const confirmReset = confirm(`Yakin reset suara untuk ${voters.length} pemilih?`)
  if (!confirmReset) return

  const token = sessionStorage.getItem('token')

  await api.post('/api/election/resetvotes', { ids: voters.map(v => v.id) }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  alert(`Suara ${voters.length} pemilih telah direset.`)
  refreshTable()
}

const autoInsertVotes = async () => {
  try {
    await api.post('/api/election/insertvoter',
      {},
      {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      }
    )
    alert('Auto insert votes berhasil!')
    refreshTable()
  } catch (error) {
    alert('Auto insert votes gagal!')
    console.error(error)
  }
}

const canReset = computed(() => voterTable.value?.selectedVoters?.length > 0)
</script>
