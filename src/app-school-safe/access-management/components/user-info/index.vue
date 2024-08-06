<template>
  <view v-if="detail?.typeCode === 'Traffic:Failed'" class="common-card components-user-info">
    <text class="common-title">通行信息</text>
    <view class="common-item">
      <text class="common-label">姓名</text>
      <text class="common-value">{{ detail?.personName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">出入口名称</text>
      <text class="common-value">{{ detail?.accessName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">出入类型</text>
      <text class="common-value">{{ accessType }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">通行状态</text>
      <text class="common-value">失败 </text>
    </view>
    <view class="common-item">
      <text class="common-label">失败原因</text>
      <text class="common-value">{{ detail?.desc || '/' }}</text>
    </view>
  </view>
  <view v-else class="common-card components-user-info">
    <text class="common-title">人员信息</text>
    <view class="common-item">
      <text class="common-label">姓名</text>
      <text class="common-value">{{ detail?.personName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">证件号</text>
      <text class="common-value">{{ detail?.certificateNumber || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">体温</text>
      <text class="common-value" :class="temperatureColor">
        {{ temperatureLabel }}
      </text>
    </view>
    <view class="common-item">
      <text class="common-label">健康码</text>
      <text class="common-value" :class="healthColor">{{ healthLabel }} </text>
    </view>
    <view class="common-item">
      <text class="common-label">出入口</text>
      <text class="common-value">{{ detail?.accessName || '/' }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { IAccessAlarmDetail } from '@/app-school-safe/services/access-management';
import { reactive, ref, watchEffect } from 'vue';
import { EntryAndExitTypeEnum } from '../../constants/EntryAndExitTypeEnum';
import { HealthTemperatureEnum } from '../../constants/HealthTemperatureEnum';

import { isNil } from '@/utils/lodash-es';

interface IProps {
  detail: IAccessAlarmDetail;
}

const props = withDefaults(defineProps<IProps>(), {});

const { detail } = reactive(props);

const healthLabel = ref('');
const healthColor = ref('');
const temperatureLabel = ref('');
const temperatureColor = ref('');
const accessType = ref('');

watchEffect(() => {
  const { healthCode, temperature } = detail;

  const instance = HealthTemperatureEnum.find(item => item.value === healthCode);

  healthLabel.value = instance?.label || '/';
  healthColor.value = instance?.color || '';

  temperatureLabel.value = !isNil(temperature) ? `${temperature}℃` : '/';
  temperatureColor.value = !isNil(temperature) && temperature > 37.3 ? 'red' : '';

  accessType.value = EntryAndExitTypeEnum[detail.accessType]?.label || '/';
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.components-user-info {
  margin-top: $ui-gap-default;

  .green {
    color: $ui-color-cyan;
  }

  .yellow {
    color: $uni-color-warning;
  }
  .red {
    color: $uni-color-error;
  }
}
</style>
