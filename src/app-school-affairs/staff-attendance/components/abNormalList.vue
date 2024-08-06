<template>
  <view class="normal-container">
    <view class="attendance-tips">
      <view class="attendance-tips-con">
        <view
          v-for="(item, index) in exceptionTabList"
          :key="index"
          :class="`tag ${attendCurrent === index ? 'tag-select' : ''}`"
          @click="handleActionChange(item, index)"
          >{{ `${item.label}(${exceptionDataMap[item.value].length || 0})` }}</view
        >
      </view>
    </view>
    <empty v-if="!renderDatas.length" :content="`无${selectedAction?.label}记录`" />
    <template v-else>
      <view v-for="(item, index) in renderDatas" :key="index" class="normal-list">
        <view class="list-item">
          <view>
            <!-- 缺勤 | 迟到 | 早退 -->
            <template v-if="selectedAction?.value !== exceptionCode.COUNTERSIGN">
              <view class="item-flex font-12">
                <view class="mr-s item-text">考勤时间</view
                ><view class="item-text">{{ `${item.attendanceDay} ${item.attendanceTime}` }}</view>
              </view>
              <view
                v-if="item.clockType === clockTypeCode.SIGNIN"
                class="item-flex color-placeholder font-12"
              >
                <view class="mr-s item-text">上班时间</view>
                <view class="item-text">{{ item.signInTime || '/' }}</view>
              </view>

              <view
                v-if="item.clockType === clockTypeCode.SIGNOUT"
                class="item-flex color-placeholder font-12"
              >
                <view class="mr-s item-text">下班时间</view>
                <view class="item-text">{{ item.signOutTime || '/' }}</view>
              </view>

              <view
                v-if="item.dataType === exceptionCode.LATE"
                class="item-flex color-placeholder font-12"
              >
                <view class="mr-s item-text">迟到时间</view>
                <view class="item-text">{{ item.lateTime }}分钟</view>
              </view>
              <view
                v-if="item.dataType === exceptionCode.EARLY"
                class="item-flex color-placeholder font-12"
              >
                <view class="mr-s item-text">早退时间</view>
                <view class="item-text">{{ item.earlyTime }}分钟</view>
              </view>
            </template>
            <!-- 补签 -->
            <template v-else>
              <view class="item-flex color-placeholder font-12">
                <view class="mr-s item-text">补签时间</view>
                <view class="item-text">{{
                  formatDate(item.counterSignTime, 'YYYY-MM-DD HH:mm')
                }}</view>
              </view>
              <view class="item-flex color-placeholder font-12">
                <view class="mr-s item-text">创建时间</view>
                <view class="item-text">{{ formatDate(item.counterSignCreateTime) }}</view>
              </view>
            </template>
            <view
              v-if="
                item.dataType === exceptionCode.ABSENCE &&
                (item.signInApplicationFlag || item.signOutApplicationFlag)
              "
            >
              <u-button size="mini" disabled type="default" :plain="true" :border-thick="false"
                >已申请补签</u-button
              >
            </view>
            <view v-if="item.dataType === exceptionCode.ABSENCE">
              <u-button
                v-if="
                  dayjs(item.attendanceDay, 'YYYY-MM-DD') >=
                    dayjs().startOf('day').subtract(30, 'day') &&
                  ((item.clockType === clockTypeCode.SIGNIN &&
                    item.signInApplicationFlag === counterSignCode.NONE) ||
                    (item.clockType === clockTypeCode.SIGNOUT &&
                      item.signOutApplicationFlag === counterSignCode.NONE))
                "
                type="primary"
                size="mini"
                @click="itemClick()"
                >申请补签
              </u-button>
            </view>
          </view>
          <view class="flex-grow flex flex-right">
            <u-tag
              v-if="selectedAction?.value === exceptionCode.COUNTERSIGN"
              text="已完结"
              type="success"
            />
          </view>
        </view>
      </view>
    </template>
  </view>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs';
import { ref, watchEffect } from 'vue';
import { clockTypeCode } from '../constants/clockTypeEnum';
import { counterSignCode } from '../constants/counterSignEnum';
import { ExceptionItem, exceptionCode, exceptionEnum } from '../constants/exceptionTypeEnum';
import empty from './empty.vue';

import type { TExceptionStudent } from '../services/employeeAttendance';
interface Props {
  exceptionDataMap: any;
}
const emit = defineEmits(['applyCounterSign']);

const renderDatas = ref<TExceptionStudent[]>([
  {
    personId: '001', // 学生标识
    personName: '', // 姓名
    gender: 1, // 性别：2、女；1、男
    personHeadImg: 'xxx', // 学生头像url
    dataType: 3, // 数据类型：1、迟到，2、早退，3、缺勤，4、请假，5、正常
    attendanceDay: '2024-01-20', // 考勤日期
    attendanceTime: '08:30-11:00', // 考勤时间
    earlyTime: 2, // 早退时间(分钟)
    lateTime: 2, // 迟到时间(分钟)
    leaveTime: 2, // 请假时间(分钟)
    signInTime: '08:29', // 签到时间
    signOutTime: '18:00', // 签退时间
    clockType: 1, // 签到类型 1签到 2签退
    statusUpdateFlag: 0, // 是否修改过的数据1是，0否
    hostelDataId: '123123123', // 数据id
    counterSignTime: '08:30-11:00',
    counterSignCreateTime: '08:30',
    signInApplicationFlag: 1,
    signOutApplicationFlag: 0,
  },
]); // 渲染的数据

const attendCurrent = ref(0);
const props = withDefaults(defineProps<Props>(), {
  exceptionDataMap: [],
});
const selectedAction = ref<ExceptionItem | undefined>(
  exceptionEnum.find(item => item.value === exceptionCode.ABSENCE),
); // 默认展示缺勤

const itemClick = () => {
  // 缺勤异常数据可补签
  emit('applyCounterSign');
};

const handleActionChange = (
  actionItem: { value: number; label: string; colorType: string },
  index: number,
) => {
  selectedAction.value = actionItem;
  attendCurrent.value = index;
};
const exceptionTabList = exceptionEnum.filter(item => ![0, 4].includes(item.value));
watchEffect(() => {
  renderDatas.value = props.exceptionDataMap[selectedAction.value.value];
});
const formatDate = (date: any, format: string = 'YYYY-MM-DD HH:mm:ss', placeholder = '/') => {
  if (!date) {
    return placeholder;
  }
  return dayjs(Number(date)).format(format);
};
</script>
<style lang="scss" scoped>
.extend-info {
  margin-top: 90rpx;
}
.normal-container {
}
.list-item {
  padding: 16rpx 0;
  border-bottom: 2rpx solid #e8e8e8;
}
.count {
  height: 52rpx;
  text-align: center;
  font-weight: bold;
  font-size: 40rpx;
  color: #1d2129;
}
.item-flex {
  display: flex;
  height: 36rpx;
  align-items: center;
  margin-bottom: 10rpx;
}
.item-text {
  height: 36rpx;
  line-height: 36rpx;
}
.color-placeholder {
  color: #86909c;
  margin-right: 10rpx;
}
.mr-s {
  margin-right: 10rpx;
}
.font-12 {
  font-size: 24rpx;
}
.attendance-tips {
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}
.tag {
  flex: 1;
  margin-right: 20rpx;
  background: #f8f8f8;
  color: #4e5969;
  border: 2rpx solid #f5f5f5;
  padding: 0 16rpx;
  height: 48rpx;
  font-size: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10rpx;
}
.tag-select {
  background-color: #176bfb;
  color: #fff;
  border: 2rpx solid #176bfb;
}
.attendance-tips-con {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
}
</style>
