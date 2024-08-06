<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <Home v-if="!isGuardian" />
  </mt-page>
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import Home from '@/app-preprimary-education/observation-record/home.vue';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { computed, onBeforeMount } from 'vue';
const title = computed(() => '观察记录');
const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
onBeforeMount(() => {
  if (isGuardian) {
    uni.redirectTo({
      url: `/app-preprimary-education/observation-record/view-picture?id=${loginSt?.currentOrganization?.childId}`,
    });
  }
});
</script>
