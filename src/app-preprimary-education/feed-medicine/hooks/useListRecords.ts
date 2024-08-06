import {
  fetchChildren,
  fetchList,
  getListType,
  rowInfoType,
  statusType,
  TStudentInfo,
} from '@/app-preprimary-education/services/feedMedicine';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { onMounted, Ref, ref, watch } from 'vue';
import usePageEvent from './usePageEvent';

type TQueryParam = {
  reviewStatus?: Ref<statusType>;
  studentIds?: Array<string | number>;
  studentName?: Ref<string>;
  loadMore: Ref<boolean>; // 加载更多
  refresh: Ref<boolean>; // 下拉刷新
  loadComplete?: (
    result: boolean,
    count?: { unConfirmedNum: number; unTakeMedicineNum: number },
  ) => void; // 加载完成
};

export default ({ reviewStatus, studentName, loadMore, refresh, loadComplete }: TQueryParam) => {
  let pageNum = 1;
  let total = 0;
  const loading = ref(false);
  const isTeacher = loginStore().currentUserType === EUserType.teacher;
  const isGuardian = loginStore().currentUserType === EUserType.guardian;

  const dataList = ref<rowInfoType[]>([]);
  let childrens: TStudentInfo[] = [];
  const getChildrens = async function () {
    let childrens: TStudentInfo[] = [];
    try {
      const res = await fetchChildren();
      if (Array.isArray(res) && res.length > 0) {
        childrens = res;
      } else {
        childrens = [];
      }
    } catch (error) {
      childrens = [];
    }
    return childrens;
  };
  const getLeaveList = async (successCallback: (res: any) => void) => {
    if (loading.value) return;
    loading.value = true;
    if (isGuardian && childrens.length === 0) {
      childrens = await getChildrens();
    }
    const params: getListType = {
      studentName: studentName?.value || '',
      status: reviewStatus?.value || null,
      pageNum: pageNum++,
      pageSize: 10,
    };
    if (isGuardian) {
      params.studentIds = childrens.map(item => item.id);
    } else {
      params.studentIds = null;
    }
    fetchList(params)
      .then(res => {
        successCallback(res);
        if (isTeacher) {
          loadComplete &&
            loadComplete(true, {
              unConfirmedNum: res && res.unConfirmedNum,
              unTakeMedicineNum: res && res.unTakeMedicineNum,
            });
        } else {
          loadComplete && loadComplete(true);
        }
      })
      .catch(error => {
        // uni.showToast({
        //   title: error.desc,
        // });
        loadComplete && loadComplete(false);
      })
      .finally(() => {
        loading.value = false;
      });
  };
  onMounted(() => {
    getLeaveList(res => {
      if (isTeacher) {
        total = res.page.total;
        dataList.value = res.page.result ? [...res.page.result] : [];
      } else {
        total = res.total;
        dataList.value = res.result ? [...res.result] : [];
        //判断dataList的长度，有就往LocalStorage里面传true，没有就传false,处理家长端是否展示导入上次按钮
        uni.setStorageSync('hasMedicineRecord', false);
        uni.setStorageSync('hasMedicineRecord', total > 0);
      }
    });
  });

  usePageEvent('refresh', data => {
    pageNum = 1;
    getLeaveList(res => {
      if (isTeacher) {
        total = res.page.total;
        dataList.value = res.page.result ? [...res.page.result] : [];
      } else {
        total = res.total;
        dataList.value = res.result ? [...res.result] : [];
      }
    });
  });
  usePageEvent('rollbackComplete', data => {
    pageNum = 1;
    getLeaveList(res => {
      if (isTeacher) {
        total = res.page.total;
        dataList.value = res.page.result ? [...res.page.result] : [];
      } else {
        total = res.total;
        dataList.value = res.result ? [...res.result] : [];
      }
    });
  });

  watch([reviewStatus, studentName], () => {
    pageNum = 1;
    dataList.value = [];
    getLeaveList(res => {
      if (isTeacher) {
        total = res.page.total;
        dataList.value = res.page.result ? [...res.page.result] : [];
      } else {
        total = res.total;
        dataList.value = res.result ? [...res.result] : [];
      }
    });
  });

  watch(refresh, () => {
    if (refresh.value) {
      pageNum = 1;
      getLeaveList(res => {
        if (isTeacher) {
          total = res.page.total;
          dataList.value = res.page.result ? [...res.page.result] : [];
        } else {
          total = res.total;
          dataList.value = res.result ? [...res.result] : [];
        }
      });
    }
  });

  const loadMoreFn = () => {
    if (dataList.value.length >= total) return;
    getLeaveList(res => {
      if (isTeacher) {
        if (res.page.result && res.page.result.length) {
          dataList.value = dataList.value.concat(res.page.result);
        }
      } else {
        if (res.result && res.result.length) {
          dataList.value = dataList.value.concat(res.result);
        }
      }
    });
  };

  // watch(
  //   loadMore,
  //   () => {
  //     if (loadMore.value) {
  //       console.log('loadMore');
  //       if (dataList.value.length >= total) return;
  //       getLeaveList(res => {
  //         if (appKind === 'teacher') {
  //           if (res.page.result && res.page.result.length) {
  //             dataList.value = dataList.value.concat(res.page.result);
  //           }
  //         } else {
  //           if (res.result && res.result.length) {
  //             dataList.value = dataList.value.concat(res.result);
  //           }
  //         }
  //       });
  //     }
  //   },
  //   { deep: true },
  // );
  return {
    dataList,
    loadMoreFn,
    loading,
  };
};
