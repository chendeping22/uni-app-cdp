<script lang="ts" setup>
import { ref } from 'vue';
import TabDevice from './tab-device.vue';
import TabGroup from './tab-group.vue';
const curTabIndex = ref(0);
</script>

<template>
  <page>
    <view class="k-f-c k-h-100p">
      <u-tabs
        v-model="curTabIndex"
        :list="[{ name: '空调设备' }, { name: '分组' }]"
        :is-scroll="false"
      />
      <view class="k-f-1 k-h-0 k-f-c">
        <TabDevice v-show="curTabIndex == 0" class="k-f-1 k-h-0 k-f-c" />
        <TabGroup v-show="curTabIndex == 1" class="k-f-1 k-h-0 k-f-c" />
      </view>
    </view>
  </page>
</template>

<style lang="scss" scoped>
@import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
</style>
