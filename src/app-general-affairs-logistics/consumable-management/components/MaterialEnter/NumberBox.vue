<template>
  <view class="number-box">
    <view class="number-box-minus" :class="isMin ? 'disable-bg' : 'normal-bg'" @click="handleMinus">
      <u-icon name="minus"></u-icon>
    </view>
    <u-input
      v-model="count"
      placeholder="请输入"
      class="number-box-input"
      :height="50"
      type="digit"
      input-align="center"
      @blur="handleCount"
    ></u-input>
    <view class="number-box-plus" :class="isMax ? 'disable-bg' : 'normal-bg'" @click="handlePlus">
      <u-icon name="plus"></u-icon>
    </view>
  </view>
</template>

<script setup lang="ts">
import { isNil } from 'lodash-es';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: number | string;
  max?: number | string;
  min?: number | string;
}>();

const emit = defineEmits<{
  (e: 'change', val?: string | number): void;
  (e: 'update:modelValue', value?: string | number): void;
}>();

const count = ref<string | number>('');

const isMin = computed(() => {
  const val = props?.min ? +props?.min : 0;
  return +count.value <= val;
});

const isMax = computed(() => {
  if (props?.max) {
    return +count.value >= +props?.max;
  }
  return false;
});

const isFloat = (val: number | string) => val.toString().indexOf('.') !== -1;

const handleCount = (val: any) => {
  if (Number.isNaN(+val)) {
    count.value = '';
    return;
  }
  if (val !== '' && +val <= 0) {
    count.value = props?.min ?? 0;
    return;
  }
  count.value = isFloat(val) ? (+val ?? 0).toFixed(2) : val;
};

const handlePlus = () => {
  const val = +count.value + 1;
  if (props?.max && +count.value > +props?.max) {
    return;
  }
  count.value = isFloat(val) ? val.toFixed(2) : val;
};

const handleMinus = () => {
  const val = +count.value - 1;
  const num = isFloat(val) ? val.toFixed(2) : val;
  const minNum = props?.min ? +props.min : 0;
  if (+count.value <= minNum) {
    return;
  }
  count.value = val > 0 ? num : minNum;
};

watch(
  () => count.value,
  val => {
    emit('update:modelValue', val);
    emit('change', val);
  },
);

watch(
  () => props.modelValue,
  val => {
    if (!isNil(val)) {
      count.value = val;
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
$normalBg: rgb(242, 243, 245);

.number-box {
  display: flex;
  align-items: center;
  &-input {
    width: 100rpx;
    margin: 0 6rpx;
    background-color: $normalBg;
    height: 50rpx;
    padding: 0 8rpx !important;
    font-size: 26rpx;
  }
  &-minus {
    border-bottom-left-radius: 4rpx;
    border-top-left-radius: 4rpx;
  }
  &-plus {
    border-bottom-right-radius: 4rpx;
    border-top-right-radius: 4rpx;
  }
  &-minus,
  &-plus {
    background-color: $normalBg;
    height: 50rpx;
    width: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: rgb(50, 50, 51);
  }
}
.disable-bg {
  background-color: #f7f8fa;
  color: #c8c9cc;
}
.normal-bg {
  background-color: $normalBg;
  color: rgb(50, 50, 51);
}
</style>
