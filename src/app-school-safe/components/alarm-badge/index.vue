<template>
  <view class="alarm-badge-container" :class="code">
    {{ name }}
  </view>
</template>
<script lang="ts" setup>
interface IProps {
  code: string;
  name: string;
}

withDefaults(defineProps<IProps>(), {});
</script>

<style scoped lang="scss">
.alarm-badge-container {
  /* height: 40rpx; */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 $ui-gap-xs;
  color: $ui-color-white;
  font-size: $ui-font-size-secondary;
  border-radius: $ui-radius-default;
}

.default {
  background-color: #0000000a;
  color: #000000a6;
}

.emergency {
  background-color: $ui-color-error-light-3;
  color: $ui-color-error;
}
.important {
  background-color: $ui-color-warnning-light-3;
  color: $ui-color-warnning;
}
.normal {
  background-color: $ui-color-primary-light-3;
  color: $ui-color-blue;
}
</style>
