import { defineStore } from 'pinia';
import { ref } from 'vue';
import { Student } from '../types/student-selector';

export const useStudentSelectorStore = defineStore('evaluationStudentSelector', () => {
  // 缓存信息
  const selectedMap = ref<Record<string, Student[]>>({});
  const selectedClassIds = ref<string[]>([]);
  /** 搜索学生跳转后要清楚选中状态 */
  const isClearEdit = ref(false);

  const $setClass = (data: string[]) => {
    selectedClassIds.value = data || [];
  };

  const $setSelectedMap = (data: { value?: Record<string, Student[]> }) => {
    selectedMap.value = data.value || {};
  };

  const $setClearEdit = (value: boolean) => {
    isClearEdit.value = value;
  };

  return {
    selectedMap,
    selectedClassIds,
    isClearEdit,
    $setSelectedMap,
    $setClass,
    $setClearEdit,
  };
});
