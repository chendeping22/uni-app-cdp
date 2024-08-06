<template>
  <view v-for="(item, index) in list" :key="index" class="content-box mt20">
    <view class="flex-space-between">
      <view class="flex-align-items">
        <view class="mr16 company">{{ item?.type == 1 ? '单位' : '个人' }}</view>
        <view class="mr16 name-style font-size30">{{ item?.name }}</view>
      </view>
    </view>
    <view class="flex-space-between">
      <view>
        <view class="flex-align-items mt8 status font-size26">
          <view class="color-gray">耗时：</view>
          <view :class="[item.costTimeDesc ? getCostTimeColor(item) : 'grey']">
            {{ item.costTimeDesc || '/' }}</view
          >
        </view>
        <view class="flex-align-items mt8 status">
          <view class="color-gray font-size26">
            分发：{{ dayjs(item?.dispatchTime).format('YYYY-MM-DD HH:mm') }}</view
          >
        </view>
        <view v-if="type == 1" class="flex-align-items mt8 status">
          <view class="color-gray font-size26">
            提交：{{ dayjs(item?.commitTime).format('YYYY-MM-DD HH:mm') }}</view
          >
        </view>
      </view>
      <view v-if="type == 0" class="mt30">
        <u-button type="primary" size="mini" plain @click="press(item)">催办</u-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { urgeHandle } from '@/app-school-affairs/services/fill-report';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { PropType } from 'vue';

const props = defineProps({
  list: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  type: {
    type: Number,
    default: 0,
  },
  delayTime: {
    type: Number,
    default: undefined,
  },
  reportId: {
    type: String,
    default: '',
  },
});

const press = (item: any) => {
  const list = {
    items: item.urgeHandleItems,
    remindWay: 1,
    urgeMsg: '',
    urgeWay: 1,
  };
  urgeHandle(list, props.reportId).then(() => {
    showInfo('已提醒用户尽快填报');
  });
};
const getCostTimeColor = (data: any) => {
  // 有截止时间先判断是否超期，超期显示红色否则按照耗时长度展示
  if (props.delayTime && (data.commitTime || Date.now()) > props.delayTime) {
    return 'red';
  }
  if (data.costTime <= 24 * 60) {
    return 'green';
  }
  if (data.costTime <= 72 * 60) {
    return 'orange';
  }

  return 'red';
};
</script>
<style lang="scss" scoped>
.align-items {
  display: flex;
  align-items: center;
}
.flex-space-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.flex-align-items {
  display: flex;
  align-items: center;
}
.content-box {
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 10rpx;
}
.width70 {
  width: 70%;
}
.pic {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #2979ff;
  border-radius: 50%;
  padding: 10rpx;
  width: 40rpx;
  height: 40rpx;
}
.company {
  color: #1677ff;
  background: #e6f4ff;
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  white-space: nowrap;
}

.mr20 {
  margin-right: 20rpx;
}
.mr16 {
  margin-right: 16rpx;
}
.mt8 {
  margin-top: 8rpx;
}
.mt20 {
  margin-top: 20rpx;
}
.mt30 {
  margin-top: 30rpx;
}
.name-style {
  font-size: 28rpx;
  width: 600rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.name-style2 {
  font-size: 28rpx;
  width: 380rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.status {
  text-align: left;
}
.color-gray {
  color: #8c8c8c;
}
.font-size26 {
  font-size: 26rpx;
}
.font-size30 {
  font-size: 30rpx;
}
.time-style {
  white-space: nowrap;
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
