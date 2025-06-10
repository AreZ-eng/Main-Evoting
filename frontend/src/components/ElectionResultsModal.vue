<template>
  <div v-if="show" class="election-results-modal" @click.self="$emit('close')">
    <div class="results-content">
      <div class="results-header">
        <h3>Hasil Pemilihan Umum</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <div v-if="results.length" class="results-body">
        <div class="results-info">
          <p class="processed-tps">
            Jumlah TPS yang telah diproses: <span>{{ processedTpsCount }}</span>
          </p>
        </div>

        <div class="results-summary">
          <div
            v-for="(result, index) in results"
            :key="result.candidate"
            class="candidate-card"
          >
            <img
              :src="getCandidateImage(index + 1)"
              :alt="result.candidate"
              class="candidate-image"
            />
            <div class="candidate-number">{{ index + 1 }}</div>
            <h4 class="candidate-name">{{ result.candidate }}</h4>
            <div class="vote-count">
              <span class="number">{{ result.decryptedTotalVotes }}</span>
              <span class="label">Suara</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-results">
        Belum ada data hasil suara
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  results: {
    type: Array,
    default: () => []
  },
  processedTpsCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['close'])

const getCandidateImage = (candidateNumber) => {
  return `/assets/calon-${candidateNumber}.jpg`
}
</script>

<style scoped>
.election-results-modal {
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
  max-width: 1500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  font-size: 1.8rem; /* Ukuran teks diperbesar */
  font-weight: bold;
}

.close-button {
  background: none;
  border: none;
  font-size: 30px; /* Ukuran tombol diperbesar */
  color: #64748b;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.close-button:hover {
  color: #1e293b;
}

.results-body {
  padding: 30px;
}

.results-info {
  margin-bottom: 30px;
  padding: 20px;
  background: #f0f9ff;
  border-radius: 13px;
}

.processed-tps {
  margin: 0;
  color: #0369a1;
  font-size: 1.3rem; /* Ukuran teks diperbesar */
}

.processed-tps span {
  font-weight: bold;
}

.results-summary {
  display: flex;
  flex-wrap: wrap; /* Memungkinkan kartu untuk wrap ke baris berikutnya */
  gap: 30px; /* Jarak antar kartu diperbesar */
  justify-content: center;
  align-items: flex-start; /* Merapikan bagian atas kartu */
}

.candidate-card {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  width: 300px; /* Lebar kartu disesuaikan */
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex; /* Menggunakan flexbox untuk layout di dalam kartu */
  flex-direction: column; /* Konten di dalam kartu vertikal */
  align-items: center; /* Konten di dalam kartu di tengah secara horizontal */
  justify-content: flex-start; /* Konten di dalam kartu mulai dari atas */
  height: auto; /* Tinggi kartu akan menyesuaikan konten */
}

.candidate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.05);
}

.candidate-image {
  width: 100%; /* Gambar mengisi lebar kartu */
  max-width: 200px; /* Batasan lebar maksimum gambar */
  height: 250px; /* Tinggi gambar agar jadi persegi panjang */
  border-radius: 8px; /* Sedikit lengkungan untuk bingkai persegi panjang */
  object-fit: cover;
  border: 4px solid #e5e7eb;
  margin-bottom: 15px; /* Jarak bawah gambar */
}

.candidate-number {
  background: #0ea5e9;
  color: white;
  border-radius: 50%; /* Kembali ke bentuk bulat untuk nomor */
  width: 50px; /* Ukuran lebih besar */
  height: 50px; /* Ukuran lebih besar */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px; /* Jarak bawah nomor */
  font-weight: bold;
  font-size: 1.5rem; /* Ukuran teks nomor diperbesar */
}

.candidate-name {
  font-size: 1.8rem; /* Ukuran teks nama diperbesar */
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 15px;
}

.vote-count {
  font-size: 1.2rem; /* Ukuran teks 'Suara' diperbesar */
  color: #64748b;
  display: flex; /* Menggunakan flexbox untuk angka dan label suara */
  flex-direction: column; /* Angka di atas label */
  align-items: center; /* Tengah secara horizontal */
}

.vote-count .number {
  font-size: 3rem; /* Ukuran angka suara diperbesar */
  font-weight: bold;
  color: #0ea5e9;
  margin-bottom: 5px; /* Jarak antara angka dan label */
}

.vote-count .label {
  font-size: 1.2rem; /* Ukuran teks 'Suara' diperbesar */
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 1.2rem; /* Ukuran teks diperbesar */
}
</style>
