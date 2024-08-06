<template>
  <u-cell-item
    :value="label || '请选择'"
    hover-class="none"
    :arrow="!readonly"
    :custom-style="{ padding: 0 }"
    :value-style="{
      ...formValueStyle,
      color: label ? color_text : color_text_placeholder,
    }"
    :border-bottom="false"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import { formValueStyle } from '@/app-platform/infos/util';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { color_text, color_text_placeholder } from '@/styles/get-variables';
import { ref, watch } from 'vue';

interface IProps {
  modelValue?: string;
  selectedText?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {});
const emit = defineEmits(['update:modelValue']);
const label = ref<string>('');

const handleClick = () => {
  if (props.readonly) return;

  showSelector<false>({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: props.modelValue,
    callback: (value, data) => {
      if (data) {
        label.value = data.name || '';
        emit('update:modelValue', value);
      }
    },
  });
};

watch(
  () => props.selectedText,
  text => {
    if (text && props.modelValue) {
      label.value = text;
    }
  },
  { immediate: true },
);
</script>
