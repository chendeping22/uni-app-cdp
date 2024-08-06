import {
  fetchList,
  rowInfoType,
  statusType,
} from '@/app-preprimary-education/services/feedMedicine';
import { Ref, onMounted, ref, watch } from 'vue';
import usePageEvent from '../../hooks/usePageEvent';

type TQueryParam = {
  reviewStatus: Ref<statusType>;
  studentName: Ref<string>;
  loadMore: Ref<boolean>; // 加载更多
  refresh: Ref<boolean>; // 下拉刷新
  loadComplete?: (result: boolean) => void; // 加载完成
};

export default ({ reviewStatus, studentName, loadMore, refresh, loadComplete }: TQueryParam) => {
  let pageNum = 1;
  let total = 0;
  let loading = false;
  const leaveList = ref<rowInfoType[]>([]);
  const getLeaveList = (successCallback: (res: any) => void) => {
    if (loading) return;
    loading = true;
    fetchList({
      studentName: studentName.value,
      status: reviewStatus.value,
      pageNum: pageNum++,
      pageSize: 10,
    })
      .then(res => {
        console.log('res----', res);
        //测试
        // setTimeout(() => {
        //   res.page.result = [];
        //   successCallback(res);
        // }, 2000);
        successCallback(res);
        loadComplete && loadComplete(true);
      })
      .catch(error => {
        uni.showToast({
          title: error.desc,
        });
        loadComplete && loadComplete(false);
      })
      .finally(() => {
        loading = false;
      });
  };

  onMounted(() => {
    getLeaveList(res => {
      total = res.page.total;
      leaveList.value = res.page.result ? [...res.page.result] : [];
    });
  });

  usePageEvent('refresh', data => {
    pageNum = 1;
    getLeaveList(res => {
      total = res.page.total;
      leaveList.value = res.page.result ? [...res.page.result] : [];
    });
  });

  watch([reviewStatus, studentName], () => {
    pageNum = 1;
    getLeaveList(res => {
      total = res.page.total;
      leaveList.value = res.page.result ? [...res.page.result] : [];
    });
  });

  watch(refresh, () => {
    if (refresh.value) {
      pageNum = 1;
      getLeaveList(res => {
        total = res.page.total;
        leaveList.value = res.page.result ? [...res.page.result] : [];
      });
    }
  });
  watch(loadMore, () => {
    if (loadMore.value) {
      if (leaveList.value.length >= total) return;
      getLeaveList(res => {
        if (res.page.result && res.page.result.length) {
          leaveList.value = leaveList.value.concat(res.page.result);
        }
      });
    }
  });
  return leaveList;
};
