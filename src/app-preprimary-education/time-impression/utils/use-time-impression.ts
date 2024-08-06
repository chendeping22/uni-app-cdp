import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { cloneDeep, sumBy } from '@/utils/lodash-es';
import { defineStore } from 'pinia';
import { computed, ref, unref } from 'vue';
import {
  IAddTimeImpression,
  IEditSource,
  IGetObserveTaskDetailRtn,
  IGetObserveTaskStudentRtn,
  IGetObserveTasks,
  IGetObserveTasksRtn,
  IGetSourceDetail,
  IGetStudentRtn,
  IGetTimeImpressionQuery,
  IGetTimeImpressionQueryRes,
  IGetTimeImpressionQueryRtn,
  IPostBatchAssignLabels,
  IPostFiles,
  IPostQuerySourceLib,
  IPostQuerySourceLibRtn,
  IPostSaveObserveTask,
  IQueryRecentLabelsRtn,
  IresourceList,
  addLabel,
  addStudentResources,
  addTimeImpression,
  clearRecycle,
  deleteCurrent,
  deleteObseveCurrent,
  deleteResource,
  deleteSources,
  deleteTimeSet,
  editSource,
  findStudentTimeSets,
  getObserveTaskDetail,
  getObserveTaskStudent,
  getObserveTasks,
  getQueryExistResourceIds,
  getQueryExistResourceIdsByTime,
  getRecycleDetail,
  getSourceDetail,
  getStudents,
  postBatchAssignLabels,
  postFiles,
  postQueryRecyclePage,
  postQuerySourceLib,
  postSaveObserveTask,
  pushSource,
  queryAllLabels,
  queryNameLikeLabels,
  queryRecentLabels,
  queryStudentResource,
  recycleDelete,
  restoreRecycle,
} from './service';

interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}
const usePagerModel = () => {
  const pager = ref<IPager>({
    pageNum: 1,
    pageSize: 30,
    total: 0,
  });
  const resetPager = () => {
    pager.value = {
      pageNum: 1,
      pageSize: 30,
      total: 0,
    };
  };
  const setPager = (obj: IPager) => {
    pager.value = obj;
  };
  return {
    pager,
    resetPager,
    setPager,
  };
};
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
    fileData.value = fileData.value.filter(item => {
      return item.fileId !== obj.fileId;
    });
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

/** home页面的Model, 即state和actions */
const useHomeModel = () => {
  const students = ref<IGetStudentRtn[]>([]);
  const getHomeList = async (clazzId: string) => {
    const res = await getStudents(clazzId);
    students.value = res;
    return res;
  };
  return { students, getHomeList };
};

export interface ICurStudent {
  studentId: string;
  studentName: string;
  gender: number;
  studentCode: string;
  photoNum: number;
}

/** viewPictureModel页面的Model, 即state和actions */
const useViewPictureModel = () => {
  const params = ref({} as IGetTimeImpressionQuery);
  const list = ref<IGetTimeImpressionQueryRtn[]>([]);
  const total = ref(0);
  const curSelects = ref<IresourceList[]>([]);
  const curStudent = ref({} as ICurStudent);
  const timeList = ref<IGetTimeImpressionQueryRes[]>([]);

  const setParams = (obj: IGetTimeImpressionQuery) => {
    params.value = obj;
  };
  // 时光集
  const getList = async () => {
    // curSelects.value = [];
    // const res = await getTimeImpressionQuery(params.value);
    const res = await findStudentTimeSets(params.value);
    timeList.value = res;

    total.value = sumBy(res, item => sumBy(item.resourceGroups, i => i.resourceList.length));
    curStudent.value.photoNum = total.value;
  };

  // 观察任务
  const fetchStudentResource = async () => {
    curSelects.value = [];
    const res = await queryStudentResource(params.value);
    list.value = res;
    total.value = sumBy(res, o => o.resourceList.length);
    curStudent.value.photoNum = total.value;
  };

  const getCommonQuery = async (pageType: string, studentId: string, taskId?: string) => {
    if (pageType === 'timeset') {
      params.value = {
        ...params.value,
        studentId,
      };
      await getList();
      return timeList.value;
    } else if (pageType === 'observe') {
      params.value = {
        ...params.value,
        studentId,
        taskId,
      };
      await fetchStudentResource();
      return list.value;
    }
  };

  const updateCurSelects = (arr: IresourceList[]) => {
    curSelects.value = arr;
  };
  return {
    total,
    params,
    list,
    timeList,
    curSelects,
    curStudent,
    getCommonQuery,
    setParams,
    getList,
    updateCurSelects,
    fetchStudentResource,
  };
};

const useSourceDetailModel = () => {
  const detail = ref({} as IGetSourceDetail);
  const getDetail = async d => {
    detail.value = {} as IGetSourceDetail;
    const res = await getSourceDetail(d);
    detail.value = res;
    return res;
  };

  const fetchRecycleDetail = async (resourceId: string) => {
    detail.value = {} as IGetSourceDetail;
    const res = await getRecycleDetail(resourceId);
    detail.value = res;
    return res;
  };

  return {
    detail,
    getDetail,
    fetchRecycleDetail,
  };
};

interface IObserveRecordParams {
  name: string;
  studentIds: string[];
}
const useObserveRecordModel = () => {
  const params = ref({} as IObserveRecordParams);
  const tasks = ref<IGetObserveTasksRtn[]>([]);
  const taskDetail = ref({} as IGetObserveTaskDetailRtn);
  const taskRefStudents = ref<IGetObserveTaskStudentRtn[]>([]);
  const fetchObserveTask = async (type: string, data: IGetObserveTasks) => {
    const res = await getObserveTasks(data);
    if (type === 'new') {
      tasks.value = [];
    }
    tasks.value.push(...res.result);
    return res;
  };
  const fetchObserveTaskDetail = async (id: string) => {
    taskDetail.value = {} as IGetObserveTaskDetailRtn;
    const res = await getObserveTaskDetail(id);
    taskDetail.value = res;
  };
  const fetchObserveTaskStudents = async (id: string) => {
    const res = await getObserveTaskStudent(id);
    taskRefStudents.value = res.result;
  };

  const saveObserveTask = async (data: IPostSaveObserveTask) => {
    await postSaveObserveTask(data);
    return;
  };
  const actionAddStudentResources = async (data: IAddTimeImpression) => {
    await addStudentResources(data);
    return;
  };

  const actionDeleteObseveCurrent = async (resourceRelIds: string[]) => {
    const res = await deleteObseveCurrent(resourceRelIds);
    return res;
  };

  return {
    params,
    tasks,
    taskDetail,
    taskRefStudents,
    fetchObserveTask,
    fetchObserveTaskDetail,
    fetchObserveTaskStudents,
    saveObserveTask,
    actionAddStudentResources,
    actionDeleteObseveCurrent,
  };
};

interface IClazz {
  title: string;
  clazzId: string;
}

/** 资源库 */
const useSourceLibModel = () => {
  const tabInx = ref(0);
  const params = ref({} as Optional<IPostQuerySourceLib>);
  const sources = ref<IPostQuerySourceLibRtn[]>([]);
  const existResourceIds = ref<string[]>([]);
  const refreshCount = ref(0);
  const curAddFiles = ref<string[]>([]);
  const total = ref(0);
  // 控制类
  const controls = ref({
    isBatchCheck: false,
    isCheckAll: false,
  });

  const curSelects = ref<IPostQuerySourceLibRtn[]>([]);

  const fetchSourceLib = async (param: Optional<IPostQuerySourceLib>) => {
    const res = await postQuerySourceLib(param);
    total.value = res.total;
    return res;
  };
  const fetchQueryRecyclePage = async (params: Optional<IPostQuerySourceLib>) => {
    const res = await postQueryRecyclePage(params);
    total.value = res.total;
    return res;
  };

  const fetchExistResourceIds = async (studentId: string) => {
    const res = await getQueryExistResourceIds(studentId);
    existResourceIds.value = res;
  };

  const fetchExistResourceIdsByTime = async (studentId: string) => {
    const res = await getQueryExistResourceIdsByTime(studentId);
    existResourceIds.value = res;
  };

  const updateCurSelects = (arr: IPostQuerySourceLibRtn[]) => {
    curSelects.value = cloneDeep(arr);
  };

  const actionAddTimeImpression = async (data: IAddTimeImpression) => {
    const res = await addTimeImpression(data);
    return res;
  };

  /** 清空回收站 */
  const actionClearRecycle = async () => {
    const res = await clearRecycle();
    return res;
  };
  /** 回收站删除 */
  const actionRecycleDelete = async (resourceIds: string[]) => {
    const res = await recycleDelete(resourceIds);
    return res;
  };
  /** 回收站还原 */
  const actionRestoreRecycle = async (resourceIds: string[]) => {
    const res = await restoreRecycle(resourceIds);
    return res;
  };
  return {
    params,
    total,
    sources,
    curSelects,
    tabInx,
    existResourceIds,
    controls,
    refreshCount,
    curAddFiles,
    fetchSourceLib,
    updateCurSelects,
    fetchQueryRecyclePage,
    actionAddTimeImpression,
    actionClearRecycle,
    actionRecycleDelete,
    actionRestoreRecycle,
    fetchExistResourceIds,
    fetchExistResourceIdsByTime,
  };
};

/** 添加标签 */
const useAddLabelModel = () => {
  const recentLabels = ref<IQueryRecentLabelsRtn[]>([]);
  const allLabels = ref<IQueryRecentLabelsRtn[]>([]);
  const matchLabels = ref<IQueryRecentLabelsRtn[]>([]);
  /** 编辑信息页选中的标签 */
  const editSelectLabels = ref<IQueryRecentLabelsRtn[]>([]);
  const editSelectLabelIds = ref<string[]>([]);

  const curSelectLabel = ref<IQueryRecentLabelsRtn[]>([]);
  const updateCurSelectLabel = (arr: IQueryRecentLabelsRtn[]) => {
    curSelectLabel.value = arr;
  };

  const fetchRecentLabels = async () => {
    recentLabels.value = [];
    const res = await queryRecentLabels();
    recentLabels.value = res;
  };

  const fetchAllLabels = async () => {
    allLabels.value = [];
    const res = await queryAllLabels();
    allLabels.value = res;
  };
  const fetchNameLikeLabels = async (nameLike: string) => {
    matchLabels.value = [];
    const res = await queryNameLikeLabels(nameLike);
    matchLabels.value = res;
  };

  const fetchAddLabel = async (label: string) => {
    const res = await addLabel(label);
    await fetchNameLikeLabels(label);
    return res;
  };
  return {
    curSelectLabel,
    editSelectLabels,
    editSelectLabelIds,
    recentLabels,
    allLabels,
    matchLabels,
    fetchRecentLabels,
    fetchAllLabels,
    fetchNameLikeLabels,
    updateCurSelectLabel,
    fetchAddLabel,
  };
};

/**
 * useTimeImpression
 * 采用组合式api组织各Model
 * 注意：
 * 1. 每个页面各一个Model
 * 2. 各Model内的actions最好只操作数据或状态, 逻辑相关的流程放在此hook上
 */
export const useTimeImpression = defineStore('useTimeImpression', () => {
  const store = loginStore();
  const userInfo = computed(() => unref(store.userInfo));

  const pager = usePagerModel();
  const sourceUploadData = useSaveUploadData();
  const homePage = useHomeModel();
  const viewPicturePage = useViewPictureModel();
  const observeRecordPage = useObserveRecordModel();
  const sourceLibPage = useSourceLibModel();
  const sourceDetailPage = useSourceDetailModel();
  const addLabelPage = useAddLabelModel();

  const usedUserKey = ref<string>();
  const curClazz = ref({} as IClazz);
  const setClazz = (obj: IClazz) => {
    curClazz.value = obj;
  };
  const curStudent = ref({} as IGetStudentRtn);
  const setCurStudent = (obj: IGetStudentRtn) => {
    curStudent.value = obj;
  };

  /** 删除 */
  const deleteDetail = async (type: number, resourceIds: string[]) => {
    if (type === 0) {
      await deleteTimeSet(resourceIds);
    } else {
      await deleteSources(resourceIds);
    }
  };

  /** 推送 */
  const pushResource = async (resourceStudentIds: string[]) => {
    await pushSource(resourceStudentIds);
    return;
  };

  /** 编辑资源 */
  const updateSource = async (form: IEditSource) => {
    const res = await editSource(form);
    return res;
  };

  /** 批量关联标签 */
  const actionBatchAssignLabels = async (data: IPostBatchAssignLabels) => {
    const res = await postBatchAssignLabels(data);
    return res;
  };

  /** 从资源库删除 */
  const actionDeleteResource = async (resourceIds: string[]) => {
    const res = await deleteResource(resourceIds);
    return res;
  };

  /** 从本页面删除 */
  const actionDeleteCurrent = async (resourceRelIds: string[]) => {
    const res = await deleteCurrent(resourceRelIds);
    return res;
  };

  /** 上传资源 */
  const actionPostFiles = async (arr: IPostFiles[]) => {
    await postFiles(arr);
  };

  /** 重置数据 */
  const actionReset = () => {
    const { currentUserType } = store;
    const curUserKey = `${
      currentUserType === EUserType.guardian ? userInfo.userId : userInfo.id
    }@${currentUserType}`;
    if (usedUserKey.value !== curUserKey) {
      usedUserKey.value = curUserKey;
      homePage.students.value = [];
      curClazz.value = {} as IClazz;
    }
  };

  return {
    pager,
    userInfo,
    homePage,
    viewPicturePage,
    observeRecordPage,
    sourceLibPage,
    sourceDetailPage,
    addLabelPage,
    curClazz,
    curStudent,
    sourceUploadData,
    setClazz,
    setCurStudent,
    deleteDetail,
    pushResource,
    updateSource,
    actionBatchAssignLabels,
    actionDeleteResource,
    actionDeleteCurrent,
    actionPostFiles,
    actionReset,
  };
});
