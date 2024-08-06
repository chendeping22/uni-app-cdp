import { defineStore } from 'pinia';
import { ref } from 'vue';

type ItemType = any;

export const useSelector = defineStore('SelectorStore', () => {
  // 缓存信息
  const selected = ref<Record<string, ItemType>>({});
  const disabledIds = ref<string[]>([]);
  const excludeIds = ref<string[]>([]);
  // const apiQuery = ref<Record<string, any>>({});
  const limitCount = ref<number>();

  const $set = (data: {
    value?: Record<string, ItemType>;
    disabledIds?: string[];
    excludeIds?: string[];
    // apiQuery?: Record<string, any>;
    limitCount?: number;
  }) => {
    selected.value = data.value || {};
    disabledIds.value = data.disabledIds || [];
    excludeIds.value = data.excludeIds || [];
    // apiQuery.value = data.apiQuery || {};
    limitCount.value = data.limitCount;
  };

  const $setValue = (value: Record<string, ItemType>) => {
    selected.value = value;
  };

  // 提交
  const $reset = () => {
    selected.value = {};
    disabledIds.value = [];
    excludeIds.value = [];
    // apiQuery.value = {};
    limitCount.value = undefined;
  };

  return {
    selected,
    disabledIds,
    excludeIds,
    // apiQuery,
    limitCount,
    $set,
    $setValue,
    $reset,
  };
});
