<script setup lang="ts">
import { formValueStyle } from '@/app-platform/infos/util';
import { color_text, color_text_placeholder } from '@/styles/get-variables';
import { delay } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { computed, nextTick, ref, useAttrs, watch } from 'vue';

interface DateRangeProps {
  modelValue: string | number;
  placeholder?: string;
  format?: string;
  readonly?: boolean;
  minDate?: string | number;
}

interface DateRangeEmits {
  (e: 'update:modelValue', val?: string): void;
}

const props = withDefaults(defineProps<DateRangeProps>(), {
  format: 'YYYY-M-D',
  placeholder: '请选择',
  readonly: false,
  minDate: dayjs().format('YYYY-M-D'),
});
const emits = defineEmits<DateRangeEmits>();

const show = ref(false);
const calendarRef = ref();

const $attrs = useAttrs();

const latestValue = computed(() => {
  const value = props.modelValue;
  return value ? dayjs(value).format(props.format) : undefined;
});

const minDateTime = computed(() => {
  const value = dayjs(props.minDate || undefined).format(props.format);
  return dayjs(value).format(props.format);
});

watch(
  latestValue,
  newVal => {
    if (newVal) {
      // #ifndef MP-WEIXIN
      nextTick(() => (calendarRef.value.activeDate = newVal));
      // #endif
      // #ifdef MP-WEIXIN
      delay(() => (calendarRef.value.activeDate = newVal), 50);
      // #endif
    }
  },
  { immediate: true },
);

function handleConfirm({ result }: { result: string }) {
  emits('update:modelValue', result);
}
</script>

<template>
  <u-cell-item
    :value="latestValue || placeholder"
    hover-class="none"
    :custom-style="{ padding: 0 }"
    :value-style="{ ...formValueStyle, color: latestValue ? color_text : color_text_placeholder }"
    :border-bottom="false"
    @click="show = !readonly"
  />
  <u-calendar
    v-if="!readonly"
    ref="calendarRef"
    v-model="show"
    mode="date"
    :min-date="minDateTime"
    max-date="2099-12-31"
    safe-area-inset-bottom
    v-bind="$attrs"
    @change="handleConfirm"
  />
</template>
