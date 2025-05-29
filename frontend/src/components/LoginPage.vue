<template>
  <form @submit.prevent="handleLogin">
    <h2>Login</h2>
    <input type="text" v-model="username" placeholder="Username" required />
    <input type="password" v-model="password" placeholder="Password" required />
    <button type="submit">Login</button>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/api.js'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await api.post('/api/auth/signin', {
      username: username.value,
      password: password.value
    })

    const token = response.data.accessToken
    sessionStorage.setItem('token', token)

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Username atau password salah!'
  }
}
</script>
