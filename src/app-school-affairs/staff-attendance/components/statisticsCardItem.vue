<template>
  <view class="card-item">
    <u-avatar
      :size="84"
      :src="item?.personHeadImg || icon_avatar"
      :sex="item?.gender === 1 ? 'man' : 'woman'"
    />
    <view class="card-item-container">
      <view class="font-xt">{{ item.personName }}</view>
      <view class="card-details">
        <text class="mr-s color-placeholder">考勤时间</text>
        <text>{{ item.attendanceTime }}</text>
      </view>
      <view class="card-details">
        <text class="mr-s color-placeholder">上班时间</text>
        <text class="color-placeholder">{{ item.signInTime || '/' }}</text>
        <text
          v-if="selectedAction.value === -1"
          class="font-desc plr-xs ml-s"
          :class="{
            'color-error': item.attendanceStatusIn === exceptionCode.ABSENCE,
            'color-warnning': [exceptionCode.LATE, exceptionCode.EARLY].includes(
              item.attendanceStatusIn,
            ),
            'color-primary': item.attendanceStatusIn === exceptionCode.LEAVE,
          }"
          >{{ statisticsEnum.find(t => t.value === item?.attendanceStatusIn)?.label }}</text
        >
      </view>
      <view class="card-details">
        <text class="mr-s color-placeholder">下班时间</text>
        <text class="color-placeholder">{{ item.signOutTime || '/' }}</text>
        <text
          v-if="selectedAction.value === -1"
          class="font-desc plr-xs ml-s"
          :class="{
            'color-error': item.attendanceStatusOut === exceptionCode.ABSENCE,
            'color-warnning': [exceptionCode.LATE, exceptionCode.EARLY].includes(
              item.attendanceStatusOut,
            ),
            'color-primary': item.attendanceStatusOut === exceptionCode.LEAVE,
          }"
          >{{ statisticsEnum.find(t => t.value === item?.attendanceStatusOut)?.label }}</text
        >
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { exceptionCode, statisticsEnum } from '../constants/exceptionTypeEnum';
import type { IDataListItem } from '../services/employeeAttendance';
import icon_avatar from '/static/avatar.png';

interface Props {
  item: IDataListItem;
  selectedAction: any;
}
withDefaults(defineProps<Props>(), {
  item: (): IDataListItem => ({
    attendanceTime: '',
    signInTime: '',
    signOutTime: '',
    personHeadImg: '',
    gender: 0,
    attendanceStatusIn: -1,
    attendanceStatusOut: -1,
    personName: '',
    personId: '',
  }),
});
</script>
<style scoped lang="scss">
.card-item {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border-bottom: 2rpx solid #f5f5f5;
}
.card-item-container {
  margin-left: 20rpx;
}
.font-xt {
  font-size: 30rpx;
}
.card-details {
  margin: 8rpx 0;
}
.mr-s {
  margin-right: 16rpx;
}
.ml-s {
  margin-left: 16rpx;
}
.color-placeholder {
  color: #86909c;
  font-size: 24rpx;
}
.color-error {
  color: #f53f3f;
}
.color-warnning {
  color: #fe7c00;
}
.color-primary {
  color: #176bfb;
}
.font-desc {
  font-size: 20rpx;
}
</style>
