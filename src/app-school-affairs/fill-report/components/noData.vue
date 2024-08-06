<template>
  <view class="p20">
    <view class="flex">
      <image class="imgSize" :src="props.imgUrl" />
    </view>
    <view class="flex color-gray">{{ props.title }}</view>
  </view>
</template>

<script lang="ts" setup>
import imgUrl from '../static/images/Empty.png';
const props = defineProps({
  title: {
    type: String,
    default: '暂无数据',
  },
  imgUrl: {
    type: String,
    default: imgUrl,
  },
});
</script>

<style lang="scss" scoped>
.flex {
  padding: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  .imgSize {
    width: 100px;
    height: 100px;
    border: 1px solid red;
  }
}
.color-gray {
  color: #999;
}
.p20 {
  padding: 20rpx;
}
</style>
