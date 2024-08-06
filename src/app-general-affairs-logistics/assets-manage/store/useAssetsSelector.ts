import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Asset } from '../types/asset';

export const useAssetsSelector = defineStore('assetsSelector', () => {
  // 缓存信息
  const selected = ref<Record<string, Asset>>({});
  const disabledIds = ref<string[]>([]);
  const excludeIds = ref<string[]>([]);
  const apiQuery = ref<Record<string, any>>({});
  const limitCount = ref<number>();

  const $set = (data: {
    value?: Record<string, Asset>;
    disabledIds?: string[];
    excludeIds?: string[];
    apiQuery?: Record<string, any>;
    limitCount?: number;
  }) => {
    selected.value = data.value || {};
    disabledIds.value = data.disabledIds || [];
    excludeIds.value = data.excludeIds || [];
    apiQuery.value = data.apiQuery || {};
    limitCount.value = data.limitCount;
  };

  const $setValue = (value: Record<string, Asset>) => {
    selected.value = value;
  };

  // 提交
  const $reset = () => {
    selected.value = {};
    disabledIds.value = [];
    excludeIds.value = [];
    apiQuery.value = {};
    limitCount.value = undefined;
  };

  return {
    selected,
    disabledIds,
    excludeIds,
    apiQuery,
    limitCount,
    $set,
    $setValue,
    $reset,
  };
});
