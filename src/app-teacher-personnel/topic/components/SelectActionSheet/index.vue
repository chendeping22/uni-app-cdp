<script setup lang="ts">
import arrowDownFill from '@/app-teacher-personnel/static/topic/arrow_down_filed.png';
import { computed, ref } from 'vue';

export type LabelValue = { label: string; value: any };

const props = withDefaults(
  defineProps<{
    options?: LabelValue[];
    disabled?: boolean;
    modelValue?: any;
    placeholder?: string;
  }>(),
  {
    options: () => [],
    disabled: false,
    modelValue: null,
    placeholder: '请选择',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
}>();

const showActionSheet = ref(false);

const list = computed(() =>
  props.options.map(o => ({
    text: o.label,
  })),
);
const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue));

const changeValue = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const handleClickButton = () => {
  if (props.disabled) {
    return;
  }
  showActionSheet.value = true;
};

const handleClickActionSheet = (index: number) => {
  console.log('...... > handleClickActionSheet > index:', index);
  const value = props.options[index]?.value;
  if (value !== props.modelValue) {
    changeValue(value);
  }
};
</script>
<template>
  <slot
    name="button"
    :handleClickButton="handleClickButton"
    :selectedOption="selectedOption"
    :scope="{
      handleClickButton,
      selectedOption,
      props,
    }"
  >
    <view class="btn-wrap" @click="handleClickButton">
      <text class="text">{{ selectedOption?.label || placeholder }}</text>
      <u-icon
        :size="32"
        :class="['icon', { open: showActionSheet }]"
        :name="arrowDownFill"
      ></u-icon>
    </view>
  </slot>
  <u-action-sheet
    v-model="showActionSheet"
    :list="list"
    safe-area-inset-bottom
    @click="handleClickActionSheet"
  ></u-action-sheet>
</template>
<style lang="scss" scoped>
.btn-wrap {
  display: flex;
  align-items: center;
}
.icon {
  transition: all 0.2s;
  margin-left: 8rpx;
  &.open {
    transform: rotate(180deg);
  }
}
.text {
  color: #000000e0;
  font-size: 26rpx;
  line-height: 36rpx;
}
</style>
