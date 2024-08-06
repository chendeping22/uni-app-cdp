<template>
  <alarm-dispose
    v-model:selected-handle-type="handleType"
    v-model:selected-way="selectedWay"
    v-model:selected-ids="selectedIds"
    v-model:dispose-description="disposeDescription"
    :handle-types="
      alarmType === AlarmTypeEnum.FACE
        ? [HandleTypeCodeEnum.DISPOSE]
        : [HandleTypeCodeEnum.DISPOSE, HandleTypeCodeEnum.UPGRADE]
    "
    @confirm="confirm"
  >
    <view v-if="showDisturbInfo" class="flex-center">
      <c-checkbox :value="isDisturb" @change="chooseDisturb" />
      <view class="flex color-secondary height-cell-small lh-10 ml-xs" @click="handleSelectShow">
        {{ disturbInfo?.data?.title }}
        <c-icon name="icon_arrow_right" :size="48" />
      </view>
      <c-select
        v-model:show="isSelectShow"
        v-model:list="disturbList"
        :show-check-icon="true"
        title="免打扰时段"
        auto-close-after-select
        @onSelect="handleSelect"
      />
    </view>
  </alarm-dispose>
</template>

<script lang="ts" setup>
import { AlarmTypeEnum } from '@/app-school-safe/constants/AlarmTypeEnum';
import { HandleTypeCodeEnum } from '@/app-school-safe/constants/HandleTypeEnum';
import { HandleWayEnum } from '@/app-school-safe/constants/HandleWayEnum';
import {
  batchBehaviorAlarmHandle,
  batchFaceAlarmHandle,
} from '@/app-school-safe/services/ai-control';
import { getPageParams, showInfo } from '@/utils/tools';
import { onBeforeMount, reactive, ref } from 'vue';

import AlarmDispose from '@/app-school-safe/components/alarm-dispose/index.vue';

const handleType = ref(HandleTypeCodeEnum.DISPOSE);
const selectedWay = ref('0');
const selectedIds = ref<string[]>([]);
const disposeDescription = ref('');
const alarmType = ref('');
const recordIds = ref([] as string[]);
const isDisturb = ref(false);
const isSelectShow = ref(false);
const showDisturbInfo = ref(true);
const disturbInfo = reactive({
  data: { title: '30分钟内不再提醒', value: '30', checked: true },
});

const disturbList = ref([
  { text: '30分钟内不再提醒', value: '30', checked: true },
  { text: '1小时内不再提醒', value: '60', checked: false },
  { text: '3小时内不再提醒', value: '180', checked: false },
  { text: '今天不再提醒', value: 'today', checked: false },
]);

// 确定
const confirm = async () => {
  try {
    if (alarmType.value === AlarmTypeEnum.FACE) {
      await batchFaceAlarmHandle({
        alarmIds: recordIds.value,
        handleCode: selectedWay.value,
        handleContent: HandleWayEnum.find(item => item.value === selectedWay.value)?.label,
        handleDescription: disposeDescription.value,
        disturbTimeInterval: isDisturb.value ? disturbInfo?.data.value : null,
      });
    } else {
      await batchBehaviorAlarmHandle({
        alarmIds: recordIds.value,
        handleType: handleType.value,
        handleCode:
          handleType.value === HandleTypeCodeEnum.DISPOSE ? Number(selectedWay.value) : undefined,
        handleContent:
          handleType.value === HandleTypeCodeEnum.DISPOSE
            ? HandleWayEnum.find(item => item.value === selectedWay.value)?.label
            : undefined,
        objectType:
          handleType.value === HandleTypeCodeEnum.UPGRADE ? Number(selectedWay.value) : undefined,
        objectIds: handleType.value === HandleTypeCodeEnum.UPGRADE ? selectedIds.value : undefined,
        handleDescription: disposeDescription.value,
        disturbTimeInterval: isDisturb.value ? disturbInfo?.data.value : null,
      });
    }
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

// 处理下拉选择·
const handleSelectShow = () => {
  isSelectShow.value = true;
};

const chooseDisturb = () => {
  isDisturb.value = !isDisturb.value;
};

const handleSelect = (idx: number) => {
  disturbInfo.data.title = disturbList.value[idx].text;
  disturbInfo.data.value = disturbList.value[idx].value;
  isSelectShow.value = false;
  if (!isDisturb.value) {
    isDisturb.value = true;
  }
};

onBeforeMount(() => {
  const { params } = getPageParams();
  const paramJson = JSON.parse(params);
  alarmType.value = paramJson.alarmType;
  recordIds.value = paramJson.recordIds;
  showDisturbInfo.value = Boolean(paramJson.showDisturbInfo);
});
</script>

<style lang="scss" scoped></style>
