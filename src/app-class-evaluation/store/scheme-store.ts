import { defineStore } from 'pinia';
import { ref } from 'vue';

export const schemeStore = defineStore('schemeDataStore', () => {
  // 缓存信息

  const schemeMap = ref<any[]>([]);
  const selectedSchemeMap = ref<Record<string, any>>({});
  const weekAndMonthMap = ref<Record<string, any>>({});
  const weekAndMonthListMap = ref<Record<string, any>>({});
  const $setWeekAndMonth = (data: any) => {
    weekAndMonthMap.value = data;
  };

  const $setWeekAndMonthList = (data: any) => {
    weekAndMonthListMap.value = data;
  };

  const $setSchemeMap = (data: any) => {
    schemeMap.value = data;
  };
  const $setSelectedSchemeMap = (data: any) => {
    selectedSchemeMap.value = data;
  };

  return {
    schemeMap,
    selectedSchemeMap,
    weekAndMonthMap,
    weekAndMonthListMap,
    $setSelectedSchemeMap,
    $setSchemeMap,
    $setWeekAndMonth,
    $setWeekAndMonthList,
  };
});
