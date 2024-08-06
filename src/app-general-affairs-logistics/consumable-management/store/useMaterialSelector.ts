import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Material, SelectorTypeEnum } from '../types/material';

export const useMaterialSelector = defineStore('materialSelector', () => {
  // 缓存信息
  const selected = ref<Record<string, Material>>({});
  const disabledIds = ref<string[]>([]);
  const excludeIds = ref<string[]>([]);
  const apiQuery = ref<Record<string, any>>({});
  const limitCount = ref<number>();
  const type = ref(SelectorTypeEnum.base);

  const $set = (data: {
    value?: Record<string, Material>;
    disabledIds?: string[];
    excludeIds?: string[];
    apiQuery?: Record<string, any>;
    limitCount?: number;
    type?: SelectorTypeEnum;
  }) => {
    selected.value = data.value || {};
    disabledIds.value = data.disabledIds || [];
    excludeIds.value = data.excludeIds || [];
    apiQuery.value = data.apiQuery || {};
    limitCount.value = data.limitCount;
    type.value = data.type || SelectorTypeEnum.base;
  };

  const $setValue = (value: Record<string, Material>) => {
    selected.value = value;
  };

  // 提交
  const $reset = () => {
    selected.value = {};
    disabledIds.value = [];
    excludeIds.value = [];
    apiQuery.value = {};
    limitCount.value = undefined;
    type.value = SelectorTypeEnum.base;
  };

  return {
    selected,
    disabledIds,
    excludeIds,
    apiQuery,
    limitCount,
    type,
    $set,
    $setValue,
    $reset,
  };
});
