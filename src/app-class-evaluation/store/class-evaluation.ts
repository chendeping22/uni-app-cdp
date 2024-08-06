import { getEvaluatorUserInfo } from '@/app-class-evaluation/services/evaluation';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useClassEvaluationStore = defineStore('classEvaluation', () => {
  const loaded = ref(false);
  const data = ref<{
    /**
     * 班级id
     */
    clazzIds?: number[];
    /**
     * 人员身份类型
     */
    indentity?: number;
    /**
     * 是否是评价人
     */
    isEvaluator?: boolean;
    /**
     * 德育主任老师名称集合
     */
    moralTeacherNames?: string[];
  }>({
    isEvaluator: false,
  });

  const fetch = async () => {
    try {
      const res: any = await getEvaluatorUserInfo();
      data.value = res || {};
      loaded.value = true;
    } catch (error) {
      loaded.value = true;
    }
  };

  const $setLoaded = value => {
    loaded.value = value;
  };

  return {
    loaded,
    data,
    fetch,
    $setLoaded,
  };
});
