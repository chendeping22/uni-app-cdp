<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pullDownRefresh="handleOnMount"
  >
    <view class="circleProgress">
      <c-circle-progress
        :percent="data.percent"
        in-active-color="#91caff"
        active-color="#1677ff"
        :height="300"
        :width="300"
        :border-width="16"
      >
        <view class="flex-column extend-info">
          <view class="font-xxt color-base"
            >{{ data.arrivedPersonNum }}/{{ data.totalPersonNum }}</view
          >
          <view class="font-secondary no-bold color-secondary">出勤人数/应到人数</view>
        </view>
      </c-circle-progress>
    </view>
    <view class="attendance-container w100 u-m-t-32">
      <view class="attendance-details">
        <view class="color-secondary font-content no-bold flex"
          ><view class="roll roll-error"></view>缺勤（人次）</view
        >
        <view class="color-base font-xt">{{ isNil(data.absentNum) ? '/' : data.absentNum }}</view>
      </view>
      <view class="attendance-details">
        <view class="color-secondary font-content no-bold flex"
          ><view class="roll roll-warnning"></view>迟到（人次）</view
        >
        <view class="color-base font-xt">{{ isNil(data.lateNum) ? '/' : data.lateNum }}</view>
      </view>
      <view class="attendance-details">
        <view class="color-secondary font-content no-bold flex"
          ><view class="roll roll-primary"></view>请假（人次）</view
        >
        <view class="color-base font-xt">{{ isNil(data.leaveNum) ? '/' : data.leaveNum }}</view>
      </view>
      <view class="attendance-details">
        <view class="color-secondary font-content no-bold flex"
          ><view class="roll roll-success"></view>早退（人次）</view
        >
        <view class="color-base font-xt">{{ isNil(data.earlyNum) ? '/' : data.earlyNum }}</view>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { AttendData, fetchStaffAttendanceStatisticsApi } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { isNil } from '@/utils/lodash-es';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, onUnmounted, ref } from 'vue';

interface StateDate extends AttendData {
  percent: number;
}
const data = ref<StateDate>({
  totalNum: 0,
  arrivedNum: 0,
  absentNum: 0,
  lateNum: 0,
  earlyNum: 0,
  leaveNum: 0,
  averageRate: '',
  attendanceDimensionResultVOList: [],
  cycleType: 0,
  totalPersonNum: 0,
  arrivedPersonNum: 0,
  absentPersonNum: 0,
  percent: 0,
});

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);
const fetchData = async () => {
  const nowDate = new Date();
  const dateBegin = new Date(nowDate.toDateString()).getTime();
  const nextDay = dateBegin + 24 * 60 * 60 * 1000 - 1;
  const res: AttendData = await fetchStaffAttendanceStatisticsApi({
    scopeType: 1,
    dimensionType: 1,
    dateBegin: dateBegin,
    dateEnd: nextDay,
    cycleType: 1,
  });
  return res;
};
let timer: any = null;

async function handleOnMount() {
  let res = await fetchData();
  data.value = {
    ...res,
    percent: (res.arrivedPersonNum / res.totalPersonNum) * 100,
  };
  isLoad.value = true;
}
function loopUpdate() {
  handleOnMount();
  clearInterval(timer);
  // timer = setInterval(() => {
  //   loopUpdate();
  // }, 5000);
}
onMounted(() => {
  // 添加5秒自动刷新逻辑
  loopUpdate();
});
onUnmounted(() => {
  clearInterval(timer);
});

const handleClickNavigator = () => {
  uni.navigateTo({
    url: `/app-school-affairs/staff-attendance/home/index?pageId=attendance`,
  });
};
</script>

<style lang="scss" scoped>
.circleProgress {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flex {
  display: flex;
  align-items: center;
}

.w100 {
  width: 100%;
}

.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.font-xxt {
  font-size: 40rpx;
}

.color-base {
  color: #1d2129;
}

.font-secondary {
  font-size: 0.75rem;
}

.no-bold {
  font-weight: 400;
}

.color-secondary {
  color: #4e5969;
}

.font-content {
  font-size: 26rpx;
}

.font-xt {
  font-size: 34rpx;
  margin-left: 24rpx;
}

.flex-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.attendance-details {
  width: 300rpx;
  background-color: #fafafa;
  padding: 16rpx 32rpx;
  border-radius: 16rpx;
  margin-right: 16rpx;
  margin-bottom: 24rpx;
}
.roll {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}
.roll-error {
  background-color: #ff4d4f;
}
.roll-warnning {
  background-color: #faad14;
}
.roll-primary {
  background-color: #1677ff;
}
.roll-success {
  background-color: #52c41a;
}
.details-top {
  display: flex;
  align-items: center;
}
.attendance-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>
