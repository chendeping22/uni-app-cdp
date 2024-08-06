<template>
  <view style="display: flex">
    <u-input
      v-model="selectOjbName"
      type="select"
      input-align="right"
      placeholder="请选择内容"
      :disabled="disabled"
      :class="{ dictDisabled: disabled }"
      :clearable="false"
      @click="!disabled && (show = true)"
    />
    <u-icon
      v-if="clearable && modelValue"
      name="close-circle-fill"
      :size="32"
      style="margin-left: 10rpx"
      color="rgb(192, 196, 204)"
      @click="toClear"
    ></u-icon>
  </view>
  <!-- <u-select v-model="show" :list="options" @confirm="onSelect"></u-select> -->
  <u-picker
    v-model="show"
    mode="time"
    :params="_format"
    :default-time="selectOjbName1"
    @confirm="handleConfirm"
  ></u-picker>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { PropType, computed, ref, watch } from 'vue';
import type { DateType } from './SchemaForm/types/schema';

interface ISelectObj {
  month?: string;
  year: string;
  day?: string;
}

const props = defineProps({
  format: { type: String as PropType<DateType>, default: 'YYYY-MM-DD' },
  modelValue: {},
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  field: { type: Object as PropType<any> },
});
const emit = defineEmits(['update:modelValue', 'change']);

const show = ref(false);

const _format = computed(() => {
  // const _base = {
  //   // year: true,
  //   // month: true,
  //   // day: false,
  //   hour: false,
  //   minute: false,
  //   second: false,
  // };
  const base = {
    timestamp: true,
  };
  if (props.format === 'YYYY-MM-DD') {
    return {
      ...base,
      year: true,
      month: true,
      day: true,
    };
  }
  if (props.format === 'YYYY-MM') {
    return {
      ...base,
      year: true,
      month: true,
    };
  }
  return {
    ...base,
    year: true,
  };
});

const defaultPickerValue = computed(() => {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
});

function transformToName(val: ISelectObj) {
  const month = val?.month ? '-' + val?.month : '';
  const day = val?.day ? '-' + val?.day : '';
  const year = val?.year || '';
  return year + month + day;
}

// 页面展示用
const selectOjbName = ref('');
// 给u-picker组件用，如果selectOjbName给组件，选择年的会有问题
const selectOjbName1 = ref('');

function handleConfirm(e: ISelectObj) {
  const str = transformToName(e);
  selectOjbName.value = str;
  const _dayjs = dayjs(str)?.format('YYYY-MM-DD HH:mm:ss');
  selectOjbName1.value = _dayjs;

  console.log('🚀ccc ~ datePicker confirm', e, props.field?.name, dayjs(_dayjs));

  emit('update:modelValue', dayjs(_dayjs));
  emit('change', dayjs(_dayjs));
}

function toClear() {
  emit('update:modelValue', null);
  emit('change', null);
  selectOjbName.value = '';
  selectOjbName1.value = defaultPickerValue.value;
}

watch(
  () => props.modelValue,
  newValue => {
    if (isNil(newValue)) {
      toClear();
      return;
    }
    if (!newValue?.isValid?.()) {
      selectOjbName1.value = defaultPickerValue.value;
      return;
    }
    const _dayjsObj = dayjs(newValue);
    selectOjbName.value = _dayjsObj?.format(props.format);
    selectOjbName1.value = _dayjsObj?.format('YYYY-MM-DD HH:mm:ss');
  },
  { immediate: true },
);
</script>

<style scoped lang="scss"></style>
