import { onReachBottom } from '@dcloudio/uni-app';
import { ref } from 'vue';

//列表方法
const usePageList = (api: any) => {
  // 搜索参数
  const state = ref<any>({
    list: [],
    pageNum: 1,
    total: 0,
    status: 'loadmore',
  });

  //获取分页数据
  const getPageList = async () => {
    try {
      state.value.status = 'loading';
      const response: any = await api.page({
        pageSize: 20,
        ...state.value,
      });

      if (state.value.pageNum === 1) {
        state.value.list = response.result || [];
      } else {
        state.value.list = state.value.list.concat(response.result || []);
      }
      console.log('🚀ccc ~ getPageList ~ state.list:', state.value.list);

      state.value.total = response.total || 0;
    } catch (error: any) {
      uni.hideLoading();
      uni.showToast({
        title: error?.desc || '请求数据出错',
        icon: 'none',
        mask: false,
        duration: 3000,
      });
    } finally {
      state.value.status = state.value.list.length >= state.value.total ? 'nomore' : 'loadmore';
    }
  };

  //加载更多
  const loadMore = () => {
    if (state.value.status === 'loadmore') {
      state.value.pageNum = state.value.pageNum + 1;
      getPageList();
    }
  };

  // 上拉加载
  onReachBottom(() => {
    loadMore();
  });

  const onSearch = () => {
    state.value.pageNum = 1;
    getPageList();
  };

  return {
    state,
    getPageList,
    loadMore,
    onSearch,
  };
};

export { usePageList };
