<!-- 接口list属性目前为value，label，children -->
<template>
  <template v-for="item in list" :key="item.value">
    <view
      :class="[
        'item1',
        item.disabled ? 'disabled' : '',
        innerList?.some(one => one == item.value) ? 'item1-active' : '',
      ]"
      @click="!item.disabled && emits('handleSelect', item)"
    >
      <view class="left">
        <view> {{ item.label }}</view>
      </view>
      <view class="right">
        <u-icon
          v-if="innerList?.some(one => one == item.value)"
          name="checkbox-mark"
          size="28"
        ></u-icon>
      </view>
    </view>
    <view style="margin-left: 32rpx">
      <Tree
        v-if="item?.children?.length > 0"
        :list="item.children"
        :inner-list="innerList"
        @handleSelect="(...rest) => emits('handleSelect', ...rest)"
      />
    </view>
  </template>
</template>

<script setup lang="ts">
// #ifdef MP-WEIXIN
import Tree from './Tree.vue';
// #endif
const props = defineProps({
  innerList: Array,
  list: Array,
});

const emits = defineEmits(['handleSelect']);
</script>

<style scoped lang="scss">
$primary: #1677ff;
$error: #ff4d4f;
$warning: #ff7875;
$borderColor: rgba(0, 0, 0, 0.06);
$link: #1890ff;
.item1 {
  padding: 16rpx 0;
  border-bottom: 1px solid $borderColor;
  display: flex;
  align-items: center;
  .left {
    flex: 1;
  }
  .right {
    flex: none;
    color: $u-type-success;
    margin-left: 10px;
  }
  .desc {
    margin-top: 10rpx;
    color: $u-tips-color;
  }
  &.disabled {
    color: rgba(0, 0, 0, 0.2);
  }
}
</style>
