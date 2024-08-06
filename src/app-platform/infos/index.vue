<script setup lang="ts">
import Publish from '@/app-platform/infos/publish.vue';
import Review from '@/app-platform/infos/review.vue';
import { computed, ref, watch } from 'vue';
import Footer from './components/footer/index.vue';
import Header from './components/header/index.vue';
import PublishBtn from './components/pub-btn/index.vue';

const headCurrent = ref<any>(0);
const footCurrent = ref(0);

const isPublishList = computed(() => footCurrent.value === 0);

watch(footCurrent, () => (headCurrent.value = 0));
</script>

<template>
  <page>
    <Header v-model="headCurrent" v-model:depValue="footCurrent" />
    <!-- 发布管理 -->
    <Publish v-if="isPublishList" v-model="headCurrent" />
    <!-- 信息审核 -->
    <Review v-else v-model="headCurrent" />
    <!-- 仅发布管理下才显示发布按钮 -->
    <PublishBtn v-if="isPublishList" v-model="headCurrent" />
    <Footer v-model="footCurrent" />
  </page>
</template>
