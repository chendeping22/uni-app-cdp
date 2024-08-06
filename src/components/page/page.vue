<template>
  <view class="page" :style="{ ...customStyle, overflow: customOverflow }">
    <view v-if="empty" class="empty">
      <u-empty-custom
        :mode="emptyIcon"
        :text="typeof empty === 'string' ? empty : '暂无数据'"
      ></u-empty-custom>
    </view>
    <template v-else>
      <slot></slot>
    </template>
    <!--#ifdef APP-PLUS-->
    <console />
    <!--#endif-->
  </view>
</template>

<script lang="ts" setup>
import { CSSProperties } from 'vue';

interface IProps {
  customOverflow?: string;
  customStyle?: CSSProperties;
  empty?: boolean | string;
  emptyIcon?: string;
}

const props = withDefaults(defineProps<IProps>(), { customOverflow: 'hidden', customStyle: {} });
</script>

<style scoped lang="scss">
.empty {
  margin-top: 136rpx;
}
</style>
