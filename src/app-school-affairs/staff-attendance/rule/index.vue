<template>
  <page custom-overflow="scroll">
    <view v-if="isLoading" class="loading-container">
      <u-loading :show="isLoading" :size="100">加载中，请稍后</u-loading>
    </view>
    <view v-else class="rule-container">
      <view class="rule-card">
        <view class="card-title">考勤时间</view>
        <view class="card-subTitle">上下班时间</view>
        <view class="card-table">
          <view v-for="(item, index) in weekArr" :key="index" class="table-item">
            <view class="item-name">{{ item.name }}</view>
            <view class="item-info">
              <view v-if="item.className">{{ item.className }}</view>
              <view v-if="item.timeGap">{{ item.timeGap }}</view>
            </view>
          </view>
        </view>
      </view>
      <view class="rule-card">
        <view class="card-title">考勤范围</view>
        <view v-if="ruleData.addrWays.length > 0" class="card-item">
          <view class="card-subTitle">办公地点</view>
          <view v-for="(item, index) in ruleData.addrWays" :key="index" class="address-container">
            <u-cell-group>
              <u-cell-item
                style="margin-bottom: 16rpx"
                icon="map"
                bg-color="#f5f5f5"
                :title-style="{ fontSize: '34rpx', color: '#1f1f1f' }"
                :title="item.addrName"
                @click="handToDetailsMap(item)"
              />
            </u-cell-group>
          </view>
        </view>
        <!--  -->
        <view v-if="ruleData.wifiWays.length > 0" class="card-item">
          <view class="card-subTitle">Wi-Fi名称</view>
          <view class="wifi-container">{{ wifiName }}</view>
        </view>
        <view v-if="ruleData.devWays.length > 0" class="card-item">
          <view class="card-subTitle">考勤设备</view>
          <view class="dev-container">
            <view v-for="(item, index) in ruleData.devWays" :key="index" class="dev-item">
              <view class="dev-item-left">{{ wayTypeTransform(item.type) }}</view>
              <view class="dev-item-right">{{ item.name }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from 'vue';
import { DevWaysTypeTextMap, weekCycleEnum, weekItem } from '../constants/weekCycleEnum';
import {
  RuleAddrWaysItem,
  RuleData,
  RuleTimeItem,
  RuleWifiWays,
  fetchStaffAttendanceRule,
} from '../services/employeeAttendance';

const isLoading = ref(true);
let ruleData: RuleData = reactive({
  times: [],
  wifiWays: [],
  addrWays: [],
  devWays: [],
});
const wifiName = ref('');
let weekArr: weekItem[] = reactive([]);

function wayTypeTransform(key: DevWaysTypeTextMap) {
  let wayText = '';
  switch (key) {
    case DevWaysTypeTextMap.UP:
      wayText = '上班';
      break;
    case DevWaysTypeTextMap.DOWN:
      wayText = '下班';
      break;
    case DevWaysTypeTextMap.UPDOWN:
      wayText = '上下班';
      break;
  }
  return wayText;
}

const getWifiName = (arr: RuleWifiWays[]) => {
  let wifiNameStr = '';
  if (arr.length) {
    arr.forEach(item => {
      if (wifiNameStr) {
        wifiNameStr = wifiNameStr + ',' + item.name;
      } else {
        wifiNameStr = item.name;
      }
    });
  }
  return wifiNameStr;
};
const handToDetailsMap = (address: RuleAddrWaysItem) => {
  console.log('add', address);
  uni.navigateTo({
    url: `/app-school-affairs/staff-attendance/map/index?lat=${address.lat}&lng=${address.lng}&radius=${address.range}`,
  });
};

const weekArrTransform = (timesArr: RuleTimeItem[]) => {
  const arr = weekCycleEnum;
  if (timesArr.length) {
    timesArr.forEach(item => {
      const idx = arr.findIndex(ele => ele.weekday === item.weekday);
      if (idx >= 0) {
        arr[idx].timeGap = item.timeGap;
        arr[idx].className = item.className;
      }
    });
  }
  return arr;
};
const fetchStaffAttendanceRuleData = async () => {
  try {
    const res = await fetchStaffAttendanceRule();
    isLoading.value = false;
    wifiName.value = getWifiName(res.wifiWays);
    weekArr = weekArrTransform(res.times);
    ruleData = res;
  } catch {
    isLoading.value = false;
  }
};
onBeforeMount(() => {
  fetchStaffAttendanceRuleData();
});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}
.rule-container {
  padding: 24rpx 32rpx;
}
.rule-card {
  padding: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
}
.card-title {
  height: 48rpx;
  font-size: 34rpx;
  color: #1f1f1f;
  line-height: 48rpx;
  font-weight: 500;
  margin-bottom: 12rpx;
}
.card-subTitle {
  font-size: 30rpx;
  font-weight: 500;
  height: 40rpx;
  line-height: 40rpx;
  color: #1f1f1f;
  margin: 16rpx 0;
}
.card-table {
  border-radius: 16rpx;
  border: 2rpx solid #dfdfdf;
  overflow: hidden;
}
.table-item {
  display: flex;
  border-bottom: 2rpx solid #dfdfdf;
  justify-content: center;
  background-color: #f5f5f5;
}
.table-item:last-child {
  border: none;
}
.item-name {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108rpx;
  min-height: 104rpx;
  background-color: #f5f5f5;
  color: #5d5d5d;
  font-size: 30rpx;
}
.item-info {
  flex: 1;
  display: flex;
  min-height: 104rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  background-color: #fff;
  color: #5d5d5d;
  justify-content: center;
  flex-direction: column;
  line-height: 36rpx;
  border-left: 2rpx solid #dfdfdf;
}
.wifi-container,
.dev-container {
  padding-bottom: 16rpx;
}
.dev-item {
  display: flex;
  margin-bottom: 16rpx;
}
.dev-item-left {
  width: 120rpx;
  margin-right: 40rpx;
  color: #636363;
  font-size: 30rpx;
}
.dev-item-right {
  flex: 1;
  color: #1f1f1f;
  font-size: 30rpx;
}
.address-container {
  height: 106rpx;
  overflow: hidden;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}
</style>
