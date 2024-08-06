<template>
  <view class="container">
    <view class="header">
      <text class="details">打卡详情</text>
    </view>
    <Empty v-if="!attendanceDataList.length" :content="'暂无打卡记录'" />
    <template v-else>
      <view
        v-for="(item, idx) in attendanceDataList"
        :key="`${item.attendanceDay}-${item.attendanceTime}`"
        class="list-item"
      >
        <view class="item-header item-flex">
          <view class="title font-15">第{{ idx + 1 }}次考勤</view>
          <view class="color-placeholder font-15">{{ item.attendanceTime }}</view>
        </view>

        <u-time-line class="ml-xxs mt-s">
          <u-time-line-item v-if="item.attendanceStatusIn !== exceptionCode.WAIT">
            <template #node>
              <view class="round-box"></view>
            </template>
            <template #content>
              <view
                class="font-15"
                :class="{ 'last-item': item.attendanceStatusOut === exceptionCode.WAIT }"
              >
                <view class="item-flex">
                  <view class="color-placeholder font-15">上班打卡</view>
                  <!-- 非必须签到 -->
                  <view v-if="isNil(item.attendanceStatusIn)" class="color-secondary ml-s">/</view>
                  <template v-else>
                    <view class="font-15 color-secondary">{{
                      item.attendanceStatusIn === exceptionCode.ABSENCE
                        ? '未打卡'
                        : item.signInTime || '/'
                    }}</view>
                    <view
                      :class="`font-15 mlr-s color-${getExceptionItem({
                        key: 'colorType',
                        type: item.attendanceStatusIn,
                      })}`"
                    >
                      {{ getExceptionItem({ key: 'label', type: item.attendanceStatusIn }) }}
                    </view>
                    <u-tag v-if="item.signInFlag === 1" type="success" size="mini" text="补卡" />
                  </template>
                </view>

                <template v-if="item.attendanceStatusIn === exceptionCode.ABSENCE">
                  <u-button
                    v-if="item.signInApplicationFlag === 1"
                    size="mini"
                    disabled
                    type="default"
                    :plain="true"
                  >
                    <view class="bold">已申请补签</view>
                  </u-button>
                  <u-button v-else type="primary" size="mini" @click="applyCounterSign()"
                    >申请补签</u-button
                  >
                </template>
              </view>
            </template>
          </u-time-line-item>
          <u-time-line-item v-if="item.attendanceStatusIn !== exceptionCode.WAIT">
            <template #node>
              <view class="round-box"></view>
            </template>
            <template #content>
              <view
                class="font-15"
                :class="{ 'last-item': item.attendanceStatusOut === exceptionCode.WAIT }"
              >
                <view class="item-flex">
                  <view class="color-placeholder font-15">下班打卡</view>
                  <!-- 非必须签到 -->
                  <view v-if="isNil(item.attendanceStatusOut)" class="color-secondary ml-s">/</view>
                  <template v-else>
                    <view class="color-secondary font-15">{{
                      item.attendanceStatusOut === exceptionCode.ABSENCE
                        ? '未打卡'
                        : item.signOutTime || '/'
                    }}</view>
                    <view
                      :class="`mlr-s color-${getExceptionItem({
                        key: 'colorType',
                        type: item.attendanceStatusOut,
                      })}`"
                    >
                      {{ getExceptionItem({ key: 'label', type: item.attendanceStatusOut }) }}
                    </view>
                    <u-tag v-if="item.signInFlag === 1" type="success" size="mini" text="补卡" />
                  </template>
                </view>

                <template v-if="item.attendanceStatusOut === exceptionCode.ABSENCE">
                  <u-button
                    v-if="item.signOutApplicationFlag === 1"
                    size="mini"
                    disabled
                    type="default"
                    :plain="true"
                  >
                    <view class="bold">已申请补签</view>
                  </u-button>
                  <u-button v-else type="primary" size="mini" @click="applyCounterSign()"
                    >申请补签</u-button
                  >
                </template>
              </view>
            </template>
          </u-time-line-item>
        </u-time-line>
      </view>
    </template>
  </view>
</template>
<script lang="ts" setup>
import { isNil } from '@/utils/lodash-es';
import Empty from '../components/empty.vue';
import { DataParams, exceptionCode, exceptionEnum } from '../constants/exceptionTypeEnum';
import type { TAttendanceData } from '../services/employeeAttendance';

interface Props {
  attendanceDataList: TAttendanceData[];
}

withDefaults(defineProps<Props>(), {
  attendanceDataList: (): TAttendanceData[] => [],
});
const emit = defineEmits(['applyCounterSign']);

const getExceptionItem = (params: DataParams) => {
  const item = exceptionEnum.find(item => {
    return item.value === params.type;
  });
  if (item) {
    return item[params.key];
  }
  return '';
};

const applyCounterSign = () => {
  emit('applyCounterSign');
};
</script>
<style lang="scss" scoped>
.container {
  padding: 0 30rpx 20rpx;
  background: #fff;
}
.header {
  margin-bottom: 30rpx;
}
.details {
  font-size: 34rpx;
  color: #000;
  font-weight: 500;
}
.last-item:before {
  content: ' ';
  position: absolute;
  left: -40rpx;
  top: 20rpx;
  width: 1px;
  height: calc(100% + 32rpx);
  background-color: rgb(221, 221, 221);
}
.list-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.item-flex {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}
.title {
  margin-right: 32rpx;
  color: #1d2129;
  font-weight: 500;
}
.color-placeholder {
  color: #86909c;
  margin-right: 10rpx;
}
.round-box {
  width: 16rpx;
  height: 16rpx;
  border-radius: 16px;
  background-color: #1677ff;
}
.font-15 {
  font-size: 30rpx;
}
.font-12 {
  font-size: 24rpx;
}
.color-secondary {
  color: #1d2129;
  margin-right: 10rpx;
}
.time-line-item {
  margin-bottom: 20rpx;
}
.color-success {
  color: #00b42a;
}
.color-error {
  color: #f53f3f;
}
.color-warnning {
  color: #fe7c00;
}
.color-primary {
  color: #1677ff;
}
.ml-xxs {
  margin-left: 20rpx;
}
</style>
