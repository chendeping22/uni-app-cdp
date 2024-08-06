<template>
  <alarm-dispose
    v-model:selected-way="selectedWay"
    v-model:dispose-description="disposeDescription"
    @confirm="confirm"
  >
    <view v-if="isSupport" class="mt-xl">
      <c-checkbox-group class-name="flex-center" @change="changeSmokeAlarm">
        <c-checkbox
          v-for="item in smokeOtherType"
          :key="item.value"
          :name="item.value"
          :value="false"
          :shape="'shape'"
        >
          {{ item.label }}
        </c-checkbox>
      </c-checkbox-group>
    </view>
  </alarm-dispose>
</template>

<script lang="ts" setup>
import { getPageParams, showInfo } from '@/utils/tools';
import { computed, onBeforeMount, ref } from 'vue';

import AlarmDispose from '@/app-school-safe/components/alarm-dispose/index.vue';
import { handleAlarm } from '@/app-school-safe/services/fire-safety';

const selectedWay = ref('0');
const disposeDescription = ref('');
const alarmType = ref('');
const recordIds = ref([] as string[]);
const deviceModel = ref('');
// 烟感消音
const checkedName = ref<string[]>([]);

const smokeOtherType = [
  { label: '消音', value: '1' },
  { label: '复位', value: '0' },
];

// 四信烟感报警器
const isSupport = computed(() => {
  return ['Fourfaith.smokeAlarm.FSDM300'].includes(deviceModel.value);
});

const changeSmokeAlarm = (value: string[]) => {
  checkedName.value = value;
};

// 确定
const confirm = async () => {
  try {
    await handleAlarm({
      recordIds: recordIds.value,
      handleResult: Number(selectedWay.value),
      handleDescription: disposeDescription.value,
      control: isSupport.value
        ? {
            commands: checkedName.value,
          }
        : undefined,
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
  alarmType.value = paramJson.alarmType;
  recordIds.value = paramJson.recordIds;
  deviceModel.value = paramJson.deviceModel;
});
</script>

<style lang="scss" scoped></style>
