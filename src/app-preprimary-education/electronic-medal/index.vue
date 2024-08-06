<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <Home />
  </mt-page>
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import Home from '@/app-preprimary-education/electronic-medal/home.vue';
import { computed } from 'vue';
const title = computed(() => '电子勋章');
</script>
