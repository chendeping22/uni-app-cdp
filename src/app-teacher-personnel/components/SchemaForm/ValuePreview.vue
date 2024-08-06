<script setup lang="ts">
import type dayjs from 'dayjs';
import { castArray, forEach, isNil, map } from 'lodash-es';
import { computed, type PropType } from 'vue';
import type { Field, SelectField } from './types/schema';

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
  value: {
    type: [Number, String, Object] as PropType<any>,
  },
  field: {
    type: Object as PropType<Field>,
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
});

const getLabel = (value: string, list: any[]) => {
  let result = '';
  const traverse = (arr: any[]) => {
    forEach(arr, i => {
      if (i.value === value) {
        result = i.label;
      } else {
        traverse(i.children);
      }
      return !result;
    });
  };
  traverse(list);
  return result;
};

const text = computed(() => {
  if (isNil(props.value)) {
    return '';
  }
  switch (props.field?.type) {
    case 'DatePicker':
      return (props.value as dayjs.Dayjs)?.format?.(props.field?.format || 'YYYY-MM-DD');
    case 'Select':
      return map(
        castArray(props.value),
        v => getLabel(v, props.dictionaries[(props.field as SelectField).dictionary || '']) || v,
      ).join(',');
    case 'ImageUpload':
      return props.formData[`${props.field.name}Url`];
  }
  return props.value;
});

const format = (text: any) => {
  return isNil(text) || text === '' ? '-' : text;
};
</script>
<template>
  <view class="value-preview">{{ format(text) }}</view>
</template>
<style scoped lang="scss">
.value-preview {
  word-break: break-word;
}
</style>
