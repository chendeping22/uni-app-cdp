<template>
  <alarm-dispose
    v-model:selected-way="selectedWay"
    v-model:dispose-description="disposeDescription"
    @confirm="confirm"
  />
</template>

<script lang="ts" setup>
import { HandleWayEnum } from '@/app-school-safe/constants/HandleWayEnum';
import { getPageParams, showInfo } from '@/utils/tools';
import { onBeforeMount, ref } from 'vue';

import AlarmDispose from '@/app-school-safe/components/alarm-dispose/index.vue';
import { handleAccessRecordsAlarm } from '@/app-school-safe/services/access-management';

const selectedWay = ref('0');
const disposeDescription = ref('');
const recordIds = ref([] as string[]);

// 确定
const confirm = async () => {
  try {
    await handleAccessRecordsAlarm({
      ids: recordIds.value,
      handleCode: selectedWay.value,
      handleContent: HandleWayEnum.find(item => item.value === selectedWay.value)?.label,
      handleDescription: disposeDescription.value,
    });
    uni.navigateBack({
      success() {
        uni.showToast({ title: '处理完成' });
        uni.$emit('alarmDisposeCallBack', {});
      },
    });
  } catch (error) {
    showInfo('处理失败');
  }
};

onBeforeMount(() => {
  const { params } = getPageParams();
  const paramJson = JSON.parse(params);
  recordIds.value = paramJson.recordIds;
});
</script>

<style lang="scss" scoped></style>
