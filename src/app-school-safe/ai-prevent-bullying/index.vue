<template>
  <t-bar-page :list="list" @before-switch="beforeSwitch">
    <template #default="{ current }">
      <event-list v-if="current === 0" />
      <device-monitor v-if="current === 1" ref="deviceMonitorRef" />
    </template>
  </t-bar-page>
</template>
<script lang="ts" setup>
import TBarPage from '@/app-school-safe/components/tbar-page/index.vue';
import bar_icon_alarm_record_default from '@/app-school-safe/static/image/bar_icon_alarm_record_default.png';
import bar_icon_alarm_record_pitch from '@/app-school-safe/static/image/bar_icon_alarm_record_pitch.png';
import bar_icon_statistics_default from '@/app-school-safe/static/image/bar_icon_statistics_default.png';
import bar_icon_statistics_pitch from '@/app-school-safe/static/image/bar_icon_statistics_pitch.png';
import { ref } from 'vue';
import DeviceMonitor from './components/device-monitor/index.vue';
import EventList from './components/event-list/index.vue';

const list = ref([
  {
    iconPath: bar_icon_alarm_record_default,
    selectedIconPath: bar_icon_alarm_record_pitch,
    text: '事件记录',
  },
  {
    iconPath: bar_icon_statistics_default,
    selectedIconPath: bar_icon_statistics_pitch,
    text: '设备监测',
  },
]);

const deviceMonitorRef = ref();

const beforeSwitch = (index: number) => {
  if (index === 0) deviceMonitorRef.value?.destroyVideo();
};
</script>

<!-- <style scoped lang="scss" /> -->
