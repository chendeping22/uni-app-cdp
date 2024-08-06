<script setup lang="ts">
const props = defineProps<{ list: any[] }>();
</script>

<template>
  <view>
    <view class="list-th">
      <view style="text-align: left">班级/班主任</view>
      <view>周总分</view>
      <view>称号</view>
    </view>
    <view class="list-tr" v-for="item in list">
      <view>
        <view style="font-size: 30rpx; text-align: left">{{ item?.abbreviation || '/' }}</view>
        <view style="text-align: left" class="head-name">{{ item?.clazzTeacherName || '/' }}</view>
      </view>
      <view>{{ item.totalScore || '/' }}</view>
      <view class="honor-box">
        <view class="honor-icon">
          <u-image width="80rpx" height="80rpx" :src="item.iconFileInfo.url"></u-image>
        </view>
        <view class="honor-name">{{ item?.honoraryTitle || '/' }}</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.list-th {
  height: 68rpx;
  color: #00000073;
  font-family: 'PingFang SC';
  font-size: 26rpx;
  font-style: normal;
  font-weight: 500;
  text-align: left;
}
.list-tr {
  height: 160rpx;
  color: #000000e0;
  font-family: 'PingFang SC';
  font-size: 32rpx;
  font-style: normal;
  font-weight: 400;
  text-align: left;
  .head-name {
    margin-top: 8rpx;
    color: #00000073;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
  }
}
.list-th,
.list-tr {
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  view {
    flex: 1;
    text-align: center;
  }
}
.honor-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  .honor-icon {
    width: 80rpx;
    height: 80rpx;
  }
  .honor-name {
    color: #00000073;
    font-family: 'PingFang SC';
    font-size: 22rpx;
    font-style: normal;
    font-weight: 400;
  }
}
</style>
