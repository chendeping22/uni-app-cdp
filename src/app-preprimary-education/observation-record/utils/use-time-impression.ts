import { loginStore } from '@/store/modules/login';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { findByStudentId, getStudents, observeRecords } from './service';

const useSaveUploadData = () => {
  /**压缩的 */
  const fileData = ref([]);
  /**原始的 */
  const origionFileData = ref([]);
  /**压缩的 */
  const setFileData = (obj: any) => {
    fileData.value = obj;
  };
  /**原始的 */
  const setOrigionFileData = (obj: any) => {
    origionFileData.value = obj;
  };
  const delFileData = (obj: any) => {
    fileData.value = fileData.value.filter(item => item.fileId !== obj.fileId);
    origionFileData.value = origionFileData.value.filter(item => item.fileId !== obj.fileId);
  };
  const clear = () => {
    fileData.value = [];
    origionFileData.value = [];
  };
  return {
    fileData,
    origionFileData,
    setFileData,
    setOrigionFileData,
    delFileData,
    clear,
  };
};
const usePointsOfObservationModel = () => {
  const indicators = ref([]);
  const treeDataSave = ref([]);
  const tabList = ref([]);
  const inxList = ref([]);
  const studentList = ref([]);
  const currentType = ref('');
  const setStudentList = (arr: any) => {
    studentList.value = arr;
  };
  const setCurrentType = (type: any) => {
    currentType.value = type;
  };
  const setInxList = (arr: any) => {
    inxList.value = arr;
  };
  const setIndicators = (arr: any) => {
    indicators.value = arr;
  };
  const setTreeDataSave = (arr: any) => {
    treeDataSave.value = arr;
  };
  const setTabList = (arr: any) => {
    tabList.value = arr;
  };
  const clearIndicatorCacheData = () => {
    indicators.value = [];
    treeDataSave.value = [];
  };

  return {
    indicators,
    treeDataSave,
    tabList,
    inxList,
    currentType,
    studentList,
    setTreeDataSave,
    setIndicators,
    setInxList,
    setTabList,
    setStudentList,
    setCurrentType,
    clearIndicatorCacheData,
  };
};

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

const useViewPictureModel = () => {
  const dratfList = ref<any[]>([]);
  const fileUrl = ref<any[]>([]);
  const picList = ref<any[]>([]);
  const setPicList = (val: any) => {
    picList.value = val;
  };
  const setFileUrl = (val: any) => {
    fileUrl.value = val;
  };

  const getCommonQuery = async (pageSize: number, pageNum: number, studentId: string) => {
    const params = {
      pageSize,
      pageNum,
      studentId,
    };
    const res: any = await findByStudentId(params);
    picList.value = res.result;
    return res;
  };

  const observeRecordsApi = async (pageSize: number, pageNum: number, personId: string) => {
    const pageList = {
      pageSize,
      pageNum,
      q_eq_status: 0,
      q_eq_createBy: personId,
    };
    const res: any = await observeRecords(pageList);
    dratfList.value = res.result;
    return res;
  };

  return {
    dratfList,
    picList,
    fileUrl,
    getCommonQuery,
    observeRecordsApi,
    setPicList,
    setFileUrl,
  };
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
  const sourceUploadData = useSaveUploadData();
  const homePage = useHomeModel();
  const PointsOfObservationData = usePointsOfObservationModel();
  const studentData = useStudentModel();
  const viewPicturePage = useViewPictureModel();

  return {
    userInfo,
    homePage,
    curClazz,
    sourceUploadData,
    PointsOfObservationData,
    viewPicturePage,
    studentData,
    setClazz,
  };
});
