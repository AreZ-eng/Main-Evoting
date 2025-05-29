<template>
  <div>
    <nav v-if="showNavbar">
      <span class="title">IMPLEMENTATION OF PAILLIER ALGORITHM: ADMIN E-VOTING</span>
      <button @click="confirmLogout">Logout</button>
      <button @click="navigatePage">
        {{ $route.name === 'Dashboard' ? 'Tallying' : 'Dashboard' }}
      </button>
    </nav>

    <router-view />

    <div v-if="showLogoutConfirm" class="confirm-popup">
      <div class="confirm-content">
        <p>Apakah Anda yakin ingin logout?</p>
        <div class="buttons">
          <button @click="logout">Ya</button>
          <button @click="cancelLogout">Tidak</button>
        </div>
      </div>
    </div>

    <Spinner v-if="isLoading" />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Spinner from '@/components/Spinner.vue'

export default {
  components: { Spinner },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const isLoading = ref(false)
    const showLogoutConfirm = ref(false)

    const showNavbar = computed(() => {
      return route.name === 'Dashboard' || route.name === 'Tallying';
    });

    function navigatePage() {
      if (route.name === 'Dashboard') {
        router.push('/tallying');
      } else {
        router.push('/dashboard');
      }
    }

    function confirmLogout() {
      showLogoutConfirm.value = true;
    }

    function cancelLogout() {
      showLogoutConfirm.value = false;
    }

    function logout() {
      sessionStorage.clear();
      showLogoutConfirm.value = false;
      router.push('/').then(() => {
        window.location.reload();
      });
    }

    watch(() => route.fullPath, () => {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    });

    return {
      isLoading,
      showNavbar,
      confirmLogout,
      cancelLogout,
      logout,
      showLogoutConfirm,
      navigatePage,
    };
  }
}
</script>
