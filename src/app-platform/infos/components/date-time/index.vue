<script setup lang="ts">
import { formValueStyle } from '@/app-platform/infos/util';
import { color_text, color_text_placeholder } from '@/styles/get-variables';
import { keys, reduce } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { computed, ref, useAttrs, watch } from 'vue';

interface DateRangeProps {
  modelValue: string | number;
  placeholder?: string;
  params?: Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', boolean>;
  step?: number | string;
}

interface DateRangeEmits {
  (e: 'update:modelValue', val?: string): void;
  (e: 'onPopupChange', visible: boolean): void;
}

const props = withDefaults(defineProps<DateRangeProps>(), {
  placeholder: '请选择',
  params: () => ({
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    second: false,
  }),
});
const emits = defineEmits<DateRangeEmits>();

const $attrs = useAttrs();

const show = ref(false);

const format = computed(() => {
  const {
    year = false,
    month = false,
    day = false,
    hour = false,
    minute = false,
    second = false,
  } = props.params;

  let formatStr = '';
  if (year) {
    formatStr += 'YYYY';
  }
  if (month) {
    formatStr += '-MM';
  }
  if (day) {
    formatStr += '-DD';
  }
  if (hour) {
    formatStr += ' HH';
  }
  if (minute) {
    formatStr += ':mm';
  }
  if (second) {
    formatStr += ':ss';
  }

  return formatStr || 'YYYY-MM-DD';
});

const latestValue = computed(() => {
  const value = props.modelValue;
  const date = dayjs(value);

  return date.isValid() ? date.format(format.value) : undefined;
});

const defaultTime = computed(() =>
  latestValue.value ? latestValue.value : dayjs().format(format.value),
);

const handleConfirm = (val: string[]) => {
  const dateKeys = keys(val);
  const dateStr = reduce(dateKeys, (str, k) => (str += val[k]), '');
  const date = dayjs(dateStr).format(format.value);
  emits('update:modelValue', date);
};

watch(show, val => {
  emits('onPopupChange', val);
});
</script>

<template>
  <u-cell-item
    :value="latestValue || placeholder"
    hover-class="none"
    :custom-style="{ padding: 0 }"
    :value-style="{ ...formValueStyle, color: latestValue ? color_text : color_text_placeholder }"
    :border-bottom="false"
    @click="show = true"
  />
  <u-picker
    v-model="show"
    mode="time"
    safe-area-inset-bottom
    :default-time="defaultTime"
    :params="params"
    :step="step"
    v-bind="$attrs"
    @confirm="handleConfirm"
  />
</template>
