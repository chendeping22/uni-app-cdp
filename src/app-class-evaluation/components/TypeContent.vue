<template>
  <view class="type-content" v-if="list.length">
    <view
      v-for="(item, index) in list"
      :key="item[filesName.value]"
      :class="`${widthStyle(item, index)} ${colorStyle(item)} ${
        item[filesName.label] ? 'type-content-item' : ''
      }`"
      @click="handleSelect(item)"
    >
      {{ item?.[filesName.label] }}
    </view>
  </view>
  <u-empty-custom v-else text="暂无数据" mode="data"></u-empty-custom>
</template>

<script setup lang="ts">
import { filter, includes } from 'lodash-es';
import { ref, unref, watch } from 'vue';

const emits = defineEmits<{
  (e: 'update:modelValue', data?: string | string[]);
  (e: 'onChange', data?: string | string[]);
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[];
    multiple?: boolean;
    list?: any[];
    /** 标签数据对应的键值名称 */
    filesName?: { label: string; value: string };
  }>(),
  { multiple: false, filesName: () => ({ label: 'label', value: 'value' }) },
);

const selectedData = ref<string | string[]>();

watch(
  () => props.modelValue,
  newVal => {
    selectedData.value = newVal || '';
  },
  { immediate: true },
);

const widthStyle = (item: Record<string, any>, index: number) => {
  const limitNum = 6;
  const { label } = props.filesName;
  const isFull =
    item?.[label]?.length > limitNum ||
    (item?.[label]?.length <= limitNum && props?.list?.[index + 1]?.[label]?.length > limitNum);

  return isFull ? 'type-content-full' : 'type-content-half';
};

const colorStyle = (item: Record<string, any>) => {
  const hasSelected =
    props.multiple && typeof selectedData.value !== 'string'
      ? (selectedData.value || []).findIndex(v => v == item?.[props.filesName.value]) > -1
      : selectedData.value === item?.[props.filesName.value];
  return hasSelected ? 'type-content-selected' : 'type-content-normal';
};

const handleSelect = (item: Record<string, any>) => {
  const itemVal = props.filesName.value;
  // 选中
  if (!includes(selectedData.value, item?.[itemVal])) {
    if (props.multiple && typeof selectedData.value !== 'string' && props?.list) {
      const _isAll =
        filter(selectedData.value, (v: any) => v !== '').length === props?.list.length - 2;
      if (item?.[itemVal] === '' || _isAll) {
        selectedData.value = props.list?.map(i => i?.[itemVal]);
      } else {
        selectedData.value = filter(selectedData.value, (v: any) => v !== '')?.concat(
          item?.[itemVal],
        );
      }
    } else {
      selectedData.value = item?.[itemVal];
    }
    // 取消选中
  } else {
    if (props.multiple) {
      if (item?.[itemVal] !== '') {
        selectedData.value = filter(
          unref(selectedData.value),
          v => v !== item?.[itemVal] && v !== '',
        );
      } else {
        selectedData.value = [];
      }
    } else {
      selectedData.value = '';
    }
  }
  emits('update:modelValue', selectedData.value);
  emits('onChange', selectedData.value);
};
</script>

<style lang="scss" scoped>
.type-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;

  &-item {
    padding: 20rpx 32rpx;
    border-radius: 8rpx;
    margin-bottom: 24rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    word-break: break-all;
  }
  &-normal {
    color: #000000a6;
    background: $color-bg-container-disabled;
  }
  &-selected {
    color: $color-primary;
    background-color: $primary-bg;
  }
  &-half {
    width: calc(50% - 12rpx);
    margin-right: 24rpx;
    &:nth-child(n + 2) {
      margin-right: 0;
    }
  }
  &-full {
    width: 100%;
  }
}
</style>
