<template>
  <view class="description-wrap">
    <view v-for="item in items" :key="item.field" class="desc-item">
      <text class="label">{{ item.label }}</text>
      <text class="value">{{ getValueText(item) }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { PropType } from 'vue';
import { getLabel } from '../../helper/dicts';

type DescriptionItemBase = {
  field: string;
  label: string;
};

type DescriptionItemDate = DescriptionItemBase & {
  type: 'date';
  format: 'YYYY-MM-DD' | 'YYYY-MM' | 'YYYY' | 'YYYY-MM-DD HH:mm' | 'YYYY-MM-DD HH:mm:ss';
};

type DescriptionItemDict = DescriptionItemBase & {
  type: 'dict';
  code: string;
};

type DescriptionItemText = DescriptionItemBase & {
  type?: 'text';
  format?: (value: any, record: any) => any;
};

export type DescriptionItem = DescriptionItemDate | DescriptionItemDict | DescriptionItemText;

const props = defineProps({
  record: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  items: {
    type: Array as PropType<DescriptionItem[]>,
    default: () => [],
  },
  emptyPlaceholder: {
    type: String,
    default: '',
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
});

const getValueText = (item: DescriptionItem) => {
  const value = props.record[item.field];
  let text = '';
  switch (item.type) {
    case 'date':
      text = value ? dayjs(value).format(item.format) : value;
      break;
    case 'dict':
      text = getLabel(value, props.dictionaries[item.code]);
      break;
    default:
      text = item.format ? item.format(value, props.record) : value;
  }
  if (props.emptyPlaceholder && (isNil(text) || text === '')) {
    text = props.emptyPlaceholder;
  }
  return text;
};
</script>
<style lang="scss" scoped>
.desc-item {
  font-size: 30rpx;
  line-height: 40rpx;
  display: flex;
  margin-top: 16rpx;
  .label {
    color: #000000a6;
    margin-right: 24rpx;
    flex: none;
    min-width: 4em;
  }
  .value {
    color: #000000e0;
    flex: 1 1 1px;
  }
}
</style>
