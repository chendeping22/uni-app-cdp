<template>
  <view class="ps-input-wrapper" :class="{ border }">
    <view style="flex: 1">
      <u-input
        v-model="innerValue"
        :type="currentType"
        :password-icon="false"
        :border="false"
        :custom-style="{ fontSize: '32rpx' }"
        v-bind="$attrs"
      />
    </view>

    <image v-show="currentType === 'text'" :src="eyeOnSvg" class="eye-svg" @click="clickEye">
    </image>
    <image v-show="currentType === 'password'" :src="eyeOffSvg" class="eye-svg" @click="clickEye">
    </image>
  </view>
</template>

<script setup lang="ts">
import eyeOffSvg from '@/app-teacher-personnel/static/payslip/eye-off.svg';
import eyeOnSvg from '@/app-teacher-personnel/static/payslip/eye-on.svg';
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: String,
  border: Boolean,
});

const emits = defineEmits(['update:modelValue']);

const innerValue = ref(props.modelValue);
const currentType = ref('password');

function clickEye() {
  currentType.value = currentType.value === 'password' ? 'text' : 'password';
}

watch(
  () => props.modelValue,
  val => {
    innerValue.value = val;
  },
  { immediate: true },
);

watch(
  () => innerValue.value,
  val => {
    emits('update:modelValue', val);
  },
);
</script>

<style scoped lang="scss">
.ps-input-wrapper {
  /* padding: 0 px2rpx(16); */
  /* height: px2rpx(48); */
  &.border {
    border: 1px solid #dcdfe6;
    border-radius: px2rpx(8);
    padding: 0 px2rpx(16);
  }
  display: flex;
  align-items: center;
  .eye-svg {
    width: px2rpx(24);
    height: px2rpx(24);
    margin-left: px2rpx(24);
  }
}
</style>
