<script setup lang="ts">
import { useStore } from 'vuex';

const store = useStore();
</script>

<template>
  <main class="app">
    <h1>Checkout</h1>
    <p>Checkout step: {{ store.state.checkoutStep }}</p>
  </main>
</template>