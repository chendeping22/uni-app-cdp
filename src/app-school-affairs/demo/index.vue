<template>
  <LTabbar ref="tabbar" :tabbar-list="defaultTabbarList">
    <template #pages>
      <ManageList v-if="tabbar?.tabKey === 'home'" />
      <DeclareList v-if="tabbar?.tabKey === 'declare'" />
      <TopicList v-if="tabbar?.tabKey === 'mine'" />
    </template>
  </LTabbar>
</template>

<script setup lang="ts">
import LTabbar from '@/app-school-affairs/demo/components/tabbar/index.vue';
import { ref } from 'vue';

import DeclareList from '@/app-school-affairs/topic/declare/List.vue';
import ManageList from '@/app-school-affairs/demo/list/index.vue';
import TopicList from '@/app-school-affairs/topic/mine/List.vue';
import { defaultTabbarList } from '@/app-school-affairs/demo/constants/tabbarList';

//引用组件tabkey
const tabbar = ref();
</script>
