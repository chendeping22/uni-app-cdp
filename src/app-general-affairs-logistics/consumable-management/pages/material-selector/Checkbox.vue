<script setup lang="ts">
const props = defineProps<{
  disabled: boolean;
  selected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const onClick = () => {
  if (props.disabled) {
    return;
  }
  emit('click');
};
</script>

<template>
  <view
    class="item-checkbox"
    :style="{
      backgroundColor: selected ? '#176bfb' : '#fff',
      borderColor: selected ? '#176bfb' : '#c8c9cc',
      opacity: disabled ? 0.5 : 1,
    }"
    @click.stop="onClick"
  >
    <u-icon name="checkbox-mark" color="#fff" size="20"></u-icon>
  </view>
</template>

<style lang="scss" scoped>
.item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 24rpx;
  border: 1px solid #c8c9cc;
  border-radius: 50%;
}
</style>
