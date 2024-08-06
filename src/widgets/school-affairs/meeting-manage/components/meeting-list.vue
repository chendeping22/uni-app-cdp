<template>
  <view v-if="meettingLists && meettingLists.length" class="meeting-list-container">
    <view
      v-for="(item, index) in meettingLists"
      :key="index"
      class="meeting-list"
      @click="onItemClick(item)"
    >
      <view>
        <view class="meeting-title">{{ item?.subject }}</view>
        <view class="meeting-time">{{ item?.dayStr }}</view>
      </view>
      <view class="ul-point"> <u-icon name="arrow-right" color="#8c8c8c"></u-icon> </view>
    </view>
  </view>
  <view v-else class="empty-contain">
    <u-empty-custom card bg-type="fill-light" type="mini" class-name="mt-b ptb-b" text="暂无数据" />
  </view>
</template>

<script lang="ts" setup>
import { ETargetType } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { ref, watch } from 'vue';

const meettingLists = ref<any>([]);
const props = defineProps({
  meettingList: {
    type: Array,
    default: () => [],
  },
});
watch(
  () => props.meettingList,
  val => {
    meettingLists.value = val;
  },
  { immediate: true, deep: true },
);
const onItemClick = item => {
  const baseUrl = 'pages/meeting/meetingManage/meetingDetail';
  const url = baseUrl + '?id=' + item.id;
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};
</script>

<style lang="scss" scoped>
.meeting-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 56rpx;
  padding-left: 16rpx;
}
.meeting-title {
  font-size: 30rpx;
  width: 510rpx;
  line-height: 40rpx;
  word-break: break-all;
  //超出一行省略
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.meeting-time {
  font-size: 26rpx;
  color: #8c8c8c;
  padding-top: 5rpx;
}
.empty-contain {
  margin-top: 48rpx;
}
.meeting-list-container {
  margin-top: 48rpx;
}
</style>
