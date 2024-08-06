<template>
  <view
    v-for="(item, index) in currentList"
    :key="index"
    class="content-box mt20"
    @click="toDetail(item)"
  >
    <view class="flex-space-between">
      <view class="flex-align-items flex-1">
        <view class="mr16 company">{{ item?.type == 1 ? '单位' : '个人' }}</view>
        <view class="mr16 name-style flex-1">{{ item?.name }}</view>
      </view>
      <view :class="['status', colorEvent(item, currentType)]">
        {{ currentType == 0 ? item?.remainTime : item.residenceTime }}
      </view>
    </view>
    <view class="flex-space-between mt16">
      <view class="align-items width60">
        <view class="pic mr16">
          <u-icon name="account-fill" size="25" style="color: #a7d8ff"></u-icon>
        </view>
        <view class="name-style2 color-gray font-size26 flex-1">{{ item?.dispatchUser }}</view>
      </view>
      <view>
        <u-icon class="mr4" name="clock" size="32" style="color: #8c8c8c"></u-icon>
      </view>
      <view class="color-gray font-size26 time-style">
        {{ dayjs(item?.dispatchTime).format('YYYY-MM-DD HH:mm') }}
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
  type: {
    type: String || Number,
    default: '0',
  },
});
const currentList = ref([]);
const currentType = ref('0');

const colorEvent = computed(() => (data: any, type: string) => {
  return type == '0' ? data.remainTimeColour : data.residenceTimeColour;
});

const toDetail = (data: any) => {
  uni.navigateTo({
    url: `/app-school-affairs/fill-report/detail/index?fillReportId=${data.fillReportId}&flowBeforeId=${data.flowBeforeId}`,
  });
};

watch(
  () => props.list,
  newVal => {
    currentList.value = newVal;
  },
  { immediate: true },
);
watch(
  () => props.type,
  newVal => {
    currentType.value = newVal;
  },
  { immediate: true },
);
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
.content-box {
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 16rpx;
}
.width60 {
  width: 60%;
}
.pic {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f2f4fa;
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
  font-size: 22rpx;
  white-space: nowrap;
}
.mr20 {
  margin-right: 20rpx;
}
.mr16 {
  margin-right: 16rpx;
}
.mr4 {
  margin-right: 4rpx;
}
.mt20 {
  margin-top: 20rpx;
}
.mt10 {
  margin-top: 10rpx;
}
.mt16 {
  margin-top: 16rpx;
}
.name-style {
  font-size: 30rpx;
  max-width: 370rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.name-style2 {
  font-size: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  padding-right: 12rpx;
}
.status {
  font-size: 24rpx;
  text-align: right;
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
  line-height: 32rpx;
}
.flex-1 {
  flex: 1;
  overflow: hidden;
}
.flex-align-items {
  display: flex;
  align-items: center;
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
  font-size: 35rpx;
  background-color: #fff;
}
.green {
  color: #52c41a;
  background-color: #fff;
}
</style>
