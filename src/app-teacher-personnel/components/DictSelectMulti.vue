<template>
  <view style="display: flex">
    <view style="display: flex">
      <u-input
        v-model="inputValue"
        input-align="right"
        placeholder="请选择内容"
        :disabled="disabled"
        :class="{ dictDisabled: disabled }"
        :clearable="false"
        @click="goSelect" />

      <u-icon
        name="arrow-right"
        :size="26"
        style="margin-left: 10rpx"
        color="rgb(192, 196, 204)"
        @click="!disabled && goSelect()"
      ></u-icon
    ></view>

    <u-icon
      v-if="clearable && modelValue?.length > 0"
      name="close-circle-fill"
      :size="32"
      style="margin-left: 10rpx"
      color="rgb(192, 196, 204)"
      @click="toClear"
    ></u-icon>
  </view>
</template>

<script setup lang="ts">
import { castArray, forEach, map } from 'lodash-es';
import { PropType, computed } from 'vue';

const props = defineProps({
  modelValue: {},
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  field: { type: Object as PropType<any> },
  options: {
    type: Array as PropType<any>,
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
});
const emit = defineEmits(['update:modelValue', 'change']);

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

const inputValue = computed(() => {
  return map(
    castArray(props.modelValue),
    v => getLabel(v, props.dictionaries[props.field.dictionary || '']) || v,
  ).join(',');
});

function toClear() {
  emit('update:modelValue', []);
  emit('change', []);
  // current.value = { label: '', value: '' };
}

function goSelect() {
  uni.navigateTo({
    url: `/app-school-affairs/teacher-archive/edit/select`,
    events: {
      dataToParent: function (data) {
        console.log('🚀ccc ~ dataToParent :', data);
        emit('update:modelValue', data?.data);
        emit('change', data?.data);
      },
    },
    success: function (res) {
      // console.log('🚀ccc ~ dataToChild', props.modelValue);
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('dataToChild', {
        data: props.modelValue,
        title: props.field.title,
        options: props.options,
      });
    },
  });
}
</script>

<style scoped lang="scss">
:deep(.u-input__right-icon--select) {
  display: none;
}
</style>
