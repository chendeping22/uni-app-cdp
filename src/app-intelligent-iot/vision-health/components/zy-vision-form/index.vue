<template>
  <view class="form-card zy-shadow">
    <view
      class="zy-flex zy-flex-row-around zy-padding-top-sm zy-padding-bottom-sm zy-border-solid-bottom"
      style="column-gap: 20rpx"
    >
      <view class="zy-flex-1" />
      <view class="zy-flex-1" style="text-align: center"> 左眼 </view>
      <view class="zy-flex-1" style="text-align: center"> 右眼 </view>
    </view>
    <block v-if="data && data.length">
      <view
        v-for="(item, index) in data"
        :key="index"
        :class="[
          'zy-flex zy-flex-row-around zy-padding-top-sm zy-padding-bottom-sm',
          { 'zy-border-solid-bottom': index < data.length - 1 },
        ]"
        style="column-gap: 20rpx"
      >
        <view class="zy-flex-1"> {{ item.title }} </view>
        <view class="zy-flex-1">
          <visionInput
            v-model="item.leftVal"
            :type="item.type"
            :disabled="disabled"
            :auto-dot="item.autoDot"
          />
        </view>
        <view class="zy-flex-1">
          <visionInput
            v-model="item.rightVal"
            :type="item.type"
            :disabled="disabled"
            :auto-dot="item.autoDot"
          />
        </view>
      </view>
    </block>
    <zy-empty v-else />
  </view>
</template>

<script setup>
import visionInput from './vision-input';

// props数据
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.input-disabled {
  background: $zy-middle-color7;
  border: none;
}
</style>
