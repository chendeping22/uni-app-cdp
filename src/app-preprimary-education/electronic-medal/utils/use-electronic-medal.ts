import { loginStore } from '@/store/modules/login';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getStudents } from './service';

/** home页面的Model, 即state和actions */
const useHomeModel = () => {
  const students = ref<any>([]);
  const getHomeList = async (clazzId: string) => {
    const res = await getStudents(clazzId);
    students.value = res;
    return res;
  };
  return { students, getHomeList };
};

const useStudentModel = () => {
  const studentsData = ref<any>([]);
  const setStudentsData = (val: any) => {
    studentsData.value = val;
  };
  return { studentsData, setStudentsData };
};

interface IClazz {
  title: string;
  clazzId: string;
}

/**
 * useTimeImpression
 * 采用组合式api组织各Model
 * 注意：
 * 1. 每个页面各一个Model
 * 2. 各Model内的actions最好只操作数据或状态, 逻辑相关的流程放在此hook上
 */
export const useTimeImpression = defineStore('observationRecord', () => {
  const store = loginStore();
  const userInfo = computed(() => store.userInfo);
  const curClazz = ref({} as IClazz);
  const setClazz = (obj: IClazz) => {
    curClazz.value = obj;
  };

  const homePage = useHomeModel();

  const studentData = useStudentModel();

  return {
    userInfo,
    homePage,
    curClazz,
    studentData,
    setClazz,
  };
});
