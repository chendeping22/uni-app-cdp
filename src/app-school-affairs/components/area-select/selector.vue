<template>
  <view class="wrap">
    <u-input
      type="select"
      placeholder="请选择"
      :modelValue="modelValue"
      @click="handleSelectClick"
      :clearable="clearable"
      :input-align="inputAlign"
      :disabled="disabled"
    />
    <u-icon
      v-if="clearable && modelValue"
      name="close-circle-fill"
      :size="32"
      style="margin-left: 10rpx"
      color="rgb(192, 196, 204)"
      @click="clearHandle"
    ></u-icon>
  </view>
</template>
<script lang="ts" setup>
defineProps<{
  modelValue: string;
  clearable?: boolean;
  disabled?: boolean;
  inputAlign?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const changeValue = (val: string) => {
  emit('update:modelValue', val);
  emit('change', val);
};

const handleSelectClick = () => {
  uni.navigateTo({
    url: '/app-school-affairs/components/area-select/index',
    events: {
      acceptDataFromSelectorComponentPage: (data: any) => {
        changeValue((data.namePath || []).join(' / '));
      },
    },
  });
};

const clearHandle = () => {
  changeValue('');
};
</script>
<style lang="scss" scoped>
.wrap {
  display: flex;
  flex: auto;
}
</style>
