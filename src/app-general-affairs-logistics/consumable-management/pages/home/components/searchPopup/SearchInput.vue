<template>
  <view class="search-input">
    <view class="search-content" @click="onClick">
      <text v-if="!isNil(inputValue)">{{ inputValue }}</text>
      <text v-else class="search-content-placeholder">{{ props.placeholder }}</text>
    </view>
    <view class="clear-icon" v-if="inputValue">
      <u-icon
        name="close-circle-fill"
        color="rgb(192, 196, 204)"
        size="32"
        @click="handleClear"
      ></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isNil } from 'lodash-es';
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value?: string): void;
  (e: 'onClear'): void;
  (e: 'onClick'): void;
}>();

const inputValue = ref();

const onClick = () => {
  emit('onClick');
};

const handleClear = () => {
  inputValue.value = undefined;
  emit('update:modelValue', inputValue.value);
  emit('onClear');
};

watch(
  () => props.modelValue,
  val => {
    console.log('🚀 ~ val:', val);
    inputValue.value = val;
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.search-input {
  display: flex;
  align-items: center;
  border: 1px solid #dcdfe6;
  border-radius: 16rpx;
  padding: 0 20rpx;
  width: 100%;
}
.search-content {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  &-placeholder {
    color: $color-text-placeholder;
  }
}
.clear-icon {
  width: 32rpx;
}
</style>
