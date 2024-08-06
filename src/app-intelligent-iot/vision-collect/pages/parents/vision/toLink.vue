<template>
  <web-view :src="src" />
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const src = ref('');
onLoad(option => {
  src.value = decodeURIComponent(option?.url);
});
</script>
