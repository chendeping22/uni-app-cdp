<template>
  <view
    v-if="item.level == 6"
    class=""
    style="padding: 20rpx 10rpx 20rpx 20rpx"
    hover-class="hover-bg--gray"
    @click="onSelect(item)"
  >
    <view class="zy-flex zy-flex-row-between zy-flex-col-center">
      <view class="">
        {{ item.name }}
      </view>
      <view class="zy-flex zy-flex-col-center">
        <!-- <text class="text-color4">{{item.number || 0}}人</text> -->
        <zy-icons type="arrow_right" color="#86909C" :size="48" />
      </view>
    </view>
  </view>
  <view v-else class="class-tree--item">
    <view v-if="showBorder" class="class-tree--item-border" />
    <view class="zy-flex zy-flex-col-center" @click="openTree(item)">
      <zy-icons v-if="item.isOpen" type="forbid_down" color="#86909C" :size="48" />
      <zy-icons v-else type="forbid_right" color="#86909C" :size="48" />
      <text>{{ item.name }}</text>
    </view>
    <view
      v-if="item.isOpen && item.children && item.children.length"
      class=""
      style="margin-left: 20rpx"
    >
      <tree-item
        v-for="(child, childIndex) in item.children"
        :key="childIndex"
        :detect-option="detectOption"
        :item="child"
        :show-border="childIndex < item.children.length - 1"
      />
    </view>
  </view>
</template>

<script setup>
import $http from '@/app-intelligent-iot/vision-health/api';
import treeItem from './item.vue';
import { getPublicFuncProxy } from '@/app-intelligent-iot/vision-health/utils';

const { proxy } = getPublicFuncProxy();
const props = defineProps({
  item: {
    type: Object,
    default: () => {},
  },
  showBorder: {
    type: Boolean,
    default: true,
  },
  detectOption: {
    type: Object,
    default: () => {},
  },
});
const getGradeClassTree = data => {
  proxy.$publicFunc.showLoading();
  $http.check
    .getGradeClassTree({
      locationId: data.code,
    })
    .then(res => {
      data.children = res;
      proxy.$publicFunc.hideLoading();
    })
    .catch(err => {
      proxy.$publicFunc.hideLoading();
    });
};
const openTree = data => {
  data.isOpen = !data.isOpen;
  if (data.level == 4 && data.children.length == 0) {
    getGradeClassTree(data);
  }
};

const onSelect = e => {
  let url = `/app-intelligent-iot/vision-health/pages/class/student?locationId=${e.id}&classId=${e.code}`;
  if (props.detectOption.type && props.detectOption.status) {
    url = `/app-intelligent-iot/vision-health/pages/check/detect/list?type=${props.detectOption.type}&status=${props.detectOption.status}&locationId=${e.id}&classId=${e.code}`;
  }
  uni.navigateTo({
    url: url,
  });
};
</script>

<style lang="scss" scoped>
.class-tree {
  &--item {
    position: relative;
    margin: 20rpx 0 20rpx 20rpx;

    &-border {
      position: absolute;
      top: 42rpx;
      left: 22rpx;
      content: '';
      height: calc(100% - 20rpx);
      border-left: 1px solid $zy-middle-color8;
    }
  }
}
</style>
