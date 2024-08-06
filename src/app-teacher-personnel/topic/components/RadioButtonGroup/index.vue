<script setup lang="ts">
type LabelValue = { value: any; label: string };

const props = withDefaults(
  defineProps<{
    options?: LabelValue[];
    disabled?: boolean;
    allowDeselect?: boolean;
    modelValue?: any;
  }>(),
  {
    options: () => [],
    disabled: false,
    allowDeselect: false,
    modelValue: null,
  },
);
const emit = defineEmits<{
  (e: 'change', value: any): void;
  (e: 'update:modelValue', value: any): void;
}>();

const changeValue = (val: any) => {
  emit('update:modelValue', val);
  emit('change', val);
};

const handleClickOption = (option: LabelValue) => {
  if (props.disabled) {
    return;
  }
  if (props.modelValue !== option.value) {
    changeValue(option.value);
  } else if (props.allowDeselect) {
    changeValue(null);
  }
};
</script>
<template>
  <view class="wrap">
    <view v-for="option in options" :key="option.value" class="option-wrap">
      <view
        :class="['option', { selected: option.value === modelValue }]"
        @click="handleClickOption(option)"
      >
        <text>{{ option.label }}</text>
      </view>
    </view>
  </view>
</template>
<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-wrap: wrap;
  margin: -12rpx;
}
.option-wrap {
  width: 50%;
  padding: 12rpx;
}
.option {
  height: 80rpx;
  border-radius: 8rpx;
  background-color: #0000000a;
  color: #000000a6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.selected {
    color: #1677ff;
    background-color: #e6f4ff;
  }
}
</style>
