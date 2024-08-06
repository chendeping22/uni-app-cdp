import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStatisticsClazzStore = defineStore('StatisticsClazzStore', () => {
  const clazzInfo = ref<{
    clazzId?: string;
    clazzName?: string;
    clazzTeacherName?: string;
    studentNum?: number;
    abbreviation?: string;
    rank?: number;
  }>({});

  const $setClazzInfo = (data?: Record<string, any>) => {
    clazzInfo.value = data || {};
  };

  return {
    clazzInfo,
    $setClazzInfo,
  };
});
