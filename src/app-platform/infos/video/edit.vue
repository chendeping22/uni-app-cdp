<script setup lang="ts">
import VideoForm from '@/app-platform/infos/components/form/video-form.vue';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

const id = ref<string>();

onLoad(query => {
  if (query && query.id) {
    id.value = query.id;
  }
});
</script>

<template>
  <VideoForm :id="id" action="edit"></VideoForm>
</template>
