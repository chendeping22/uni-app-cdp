<template>
  <view class="common-card components-user-info">
    <text class="common-title">通行信息</text>
    <view class="common-item">
      <text class="common-label">姓名</text>
      <text class="common-value">{{ detail?.personName || '/' }}</text>
    </view>
    <view class="common-item">
      <text class="common-label">班级名称</text>
      <text class="common-value">{{ detail?.clazzName || '/' }}</text>
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
      <text class="common-value">{{ detail?.throughStatus ? '成功' : '失败' }} </text>
    </view>
    <view v-if="!detail?.throughStatus" class="common-item">
      <text class="common-label">失败原因</text>
      <text class="common-value">{{ detail?.failedReason || '/' }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { IAccessItemDetail } from '@/app-school-safe/services/access-management';
import { reactive, ref, watchEffect } from 'vue';
import { EntryAndExitTypeEnum } from '../../constants/EntryAndExitTypeEnum';

interface IProps {
  detail: IAccessItemDetail;
}

const props = withDefaults(defineProps<IProps>(), {});

const { detail } = reactive(props);
const accessType = ref('');

watchEffect(() => {
  accessType.value = EntryAndExitTypeEnum[detail?.accessType]?.label || '/';
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.components-user-info {
  margin-top: $ui-gap-default;
}
</style>
