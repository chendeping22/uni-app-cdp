<template>
  <view style="display: flex">
    <u-input
      v-model="current.label"
      type="select"
      input-align="right"
      placeholder="请选择内容"
      :disabled="disabled"
      :class="{ dictDisabled: disabled }"
      :clearable="false"
      :select-open="show"
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
  <u-select
    v-model="show"
    :list="options"
    :default-value="defaultValue"
    @confirm="onSelect"
  ></u-select>
</template>

<script setup lang="ts">
// import { useDictStore } from '@/app-school-affairs/teacher-archive/store';
import { PropType, ref, watch } from 'vue';

interface IOptionItems {
  label: string;
  value: string;
}

const props = defineProps({
  modelValue: {},
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  field: { type: Object as PropType<any> },
  options: {
    type: Array as PropType<any>,
  },
});
const emit = defineEmits(['update:modelValue', 'change']);

// const dictStore = useDictStore();

// const { allDicts } = storeToRefs(dictStore);
// console.log('🚀ccc ~ allDicts:', allDicts.value);

const show = ref(false);
const defaultValue = ref([0]);
const current = ref<Partial<IOptionItems>>({
  label: '',
  value: '',
});

// const options = computed<IOptionItems[]>(() => {
//   return dictionaries?.[props.code] || [];
// });

function onSelect(arr: any[]) {
  let selectOne = arr[0] || {};
  current.value = selectOne;
  // console.log('🚀ccc ~ dictSelect confirm', props.field?.name, selectOne?.value);
  emit('update:modelValue', selectOne?.value);
  emit('change', selectOne?.value);
}
function toClear() {
  emit('update:modelValue', '');
  emit('change', '');
  current.value = { label: '', value: '' };
}

watch(
  () => props.modelValue,
  newValue => {
    // console.log('🚀ccc ~ newValue:', props.field?.name, newValue);
    current.value = props.options?.find(one => one.value == newValue) || {};
    const _index = props.options?.findIndex(one => one.value == newValue);
    defaultValue.value = [_index >= 0 ? _index : 0];
  },
  { immediate: true },
);
</script>

<style scoped lang="scss"></style>
