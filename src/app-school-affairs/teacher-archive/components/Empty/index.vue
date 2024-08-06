<script lang="ts" setup>
// import { Empty } from 'ant-design-vue';
// const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
</script>

<template>
  <!-- <a-empty :image="simpleImage">
    <template #description>
      <slot name="description"></slot>
    </template>
  </a-empty> -->
  <!-- <u-empty text="暂无数据" :margin-top="150"></u-empty> -->
  <view style="margin-top: 136rpx"> <u-empty-custom :icon-size="216" text="暂无数据" /></view>
</template>
