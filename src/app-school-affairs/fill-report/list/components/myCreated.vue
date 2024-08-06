<template>
  <view
    v-for="(item, index) in currentList"
    :key="index"
    class="content-box mt20"
    @click="toDetail(item)"
  >
    <view class="flex-space-between">
      <view class="mr20 name-style flex-1">{{ item?.fillName }}</view>
      <view class="line-progress">
        <u-line-progress
          :active-color="fillColor(item.progressBarColor)"
          :percent="item?.fillReportProgress"
          :show-percent="false"
          height="15"
        />
      </view>
      <view v-if="item?.progressBarTag == 0" class="font-size26 width70">
        {{ item?.fillReportProgress }}%
      </view>
      <view v-else-if="item?.progressBarTag == 3" class="font-size26 width70 red">
        {{ item?.fillReportProgress }}%
      </view>
      <view v-else-if="item?.progressBarTag == 1" class="width70">
        <u-icon name="checkmark-circle-fill" color="#52C41A" size="35"></u-icon>
      </view>
      <view v-else class="width70">
        <u-icon name="close-circle-fill" color="#FF4D4F" size="35"></u-icon>
      </view>
    </view>
    <view class="flex-space-between mt18">
      <view v-if="item?.delayTime" class="align-items">
        <view class="mr10"><u-icon name="clock" size="32" class="icon-style"></u-icon></view>
        <view class="name-style2 color-gray font-size26">
          {{ dayjs(item?.delayTime).format('YYYY-MM-DD HH:mm') }} 截止
        </view>
      </view>
      <view v-else class="align-items">
        <view class="mr10"><u-icon name="clock" size="30" class="icon-style"></u-icon></view>
        <view class="name-style2 color-gray font-size26">无截止时间</view>
      </view>
      <view :class="['color-gray', 'font-size26', 'time-style', item?.costTimeColor]">
        耗时：{{ item?.costTimeDesc }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, ref, watch } from 'vue';
const props = defineProps({
  list: {
    type: Array,
    default: [],
  },
});
const currentList = ref<any>([]);
const colorEvent = computed(() => (data: any) => {
  return data.residenceTimeColour;
});
const fillColor = computed(() => (data: string) => {
  switch (data) {
    case 'red':
      return '#ff4d4f';
    case 'orange':
      return '#ffa500';
    case 'green':
      return '#52c41a';
    case 'blue':
      return '#1677ff';
    default:
      return '#8c8c8c';
  }
});
watch(
  () => props.list,
  newVal => {
    currentList.value = newVal;
  },
  { immediate: true },
);
const toDetail = (data: any) => {
  uni.navigateTo({
    url: `/app-school-affairs/fill-report/detail/index?fillReportId=${data.fillReportId}&flowBeforeId=${data.flowBeforeId}&fromType=1`,
  });
};
</script>
<style lang="scss" scoped>
.align-items {
  display: flex;
  align-items: center;
}
.flex-1 {
  flex: 1;
  overflow: hidden;
}
.flex-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.content-box {
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
}
.pic {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ddd;
  border-radius: 50%;
  padding: 10rpx;
  width: 40rpx;
  height: 40rpx;
}
.company {
  color: #1677ff;
  background: #e6f4ff;
  padding: 10rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  white-space: nowrap;
}
.person {
  color: #52c41a;
  background: #f6ffed;
  padding: 15rpx;
  border-radius: 10rpx;
  font-size: 20rpx;
  white-space: nowrap;
}
.mr20 {
  margin-right: 20rpx;
}
.mr10 {
  margin-right: 10rpx;
}
.mt20 {
  margin-top: 20rpx;
}
.name-style {
  font-size: 30rpx;
  max-width: 59.5%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.name-style2 {
  font-size: 28rpx;
  white-space: nowrap;
}
.color-gray {
  color: #999;
}
.font-size26 {
  font-size: 26rpx;
}
.time-style {
  white-space: nowrap;
}
.line-progress {
  width: 18%;
}
.mt18 {
  margin-top: 18rpx;
}
.width70 {
  width: 70rpx;
  display: flex;
  justify-content: center;
}
.icon-style {
  color: #999;
  padding-top: 10rpx;
}
.red {
  color: red;
  background-color: #fff;
}
.orange {
  color: orange;
  background-color: #fff;
}
.grey {
  color: #8c8c8c;
  background-color: #fff;
}
.green {
  color: #52c41a;
  background-color: #fff;
}
</style>
