<script setup lang="ts">
import AlbumList from '@/app-platform/infos/album/list.vue';
import NewsList from '@/app-platform/infos/news/list.vue';
import { EVENTS, LOG_STATUS, actionList, infosCategory } from '@/app-platform/infos/util';
import VideoList from '@/app-platform/infos/video/list.vue';
import {
  IInfoType,
  deleteAlbumVideo,
  deleteInfos,
  onOffLineAlbum,
  querySchoolPublishAlbum,
  querySchoolPublishInfos,
  toggleTopDisplay,
} from '@/app-platform/services/infos';
import { onShow } from '@dcloudio/uni-app';
import { computed, onBeforeMount, ref, watch } from 'vue';
import usePageObserve from './hooks/use-page-observe';

const props = defineProps<{
  /** 切换头部的选项卡 */
  modelValue: 0 | 1 | 2;
}>();
defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const showActions = ref(false);
const currentActionData = ref<any>({});
const isFetching = ref<boolean>(false);
const isNoMore = ref<boolean>(false);
const show = ref(false);

const [scrollTop, notifyCb] = usePageObserve(EVENTS.publish);

const actionsList = computed(() =>
  actionList.filter(item => {
    const status = currentActionData.value.publishStatus as LOG_STATUS;

    switch (item.action) {
      case 'top': {
        if (props.modelValue !== 0) {
          return false;
        } else {
          return (
            !currentActionData.value.topDisplay &&
            [LOG_STATUS.time_un_publish, LOG_STATUS.time_publish, LOG_STATUS.publish].includes(
              status,
            )
          );
        }
      }
      case 'cancelTop': {
        if (props.modelValue !== 0) {
          return false;
        } else {
          return (
            !!currentActionData.value.topDisplay &&
            [LOG_STATUS.time_un_publish, LOG_STATUS.time_publish, LOG_STATUS.publish].includes(
              status,
            )
          );
        }
      }
      case 'offline': {
        if (props.modelValue !== 0) {
          return false;
        } else {
          return [LOG_STATUS.publish, LOG_STATUS.time_publish].includes(status);
        }
      }
      case 'online': {
        if (props.modelValue !== 0) {
          return false;
        } else {
          return status === LOG_STATUS.offline;
        }
      }
      case 'edit': {
        return ![LOG_STATUS.offline, LOG_STATUS.verifying].includes(status);
      }
      case 'delete': {
        return true;
      }
      default:
        return false;
    }
  }),
);

const status = computed<'loadmore' | 'loading' | 'nomore'>(() => {
  if (isFetching.value) {
    return 'loading';
  } else if (isNoMore.value) {
    return 'nomore';
  }
  return 'loadmore';
});
const list = ref<any[]>([]);
let pageNum = 1;

const getPageSize = () => (props.modelValue === 0 ? 15 : 16);

const fetchData = (pageNum: number, pageSize?: number) => {
  const currentModelValue = props.modelValue;
  const params = {
    pageNum,
    pageSize: pageSize || getPageSize(),
  };

  const req =
    currentModelValue === 0
      ? querySchoolPublishInfos(params)
      : querySchoolPublishAlbum({
          ...params,
          type: currentModelValue === 1 ? IInfoType.album : IInfoType.video,
        });

  return req;
};

const queryData = (
  options: {
    /** 强制请求，用于切换tab和下拉刷新时进行强制请求 */
    enforce?: boolean;
    /** 加载下一页数据 */
    nextPage?: boolean;
    /** 刷新数据 */
    refresh?: boolean;
  } = {},
) => {
  if (options.enforce || (!isFetching.value && (!isNoMore.value || options.refresh))) {
    const currentModelValue = props.modelValue;
    isFetching.value = true;
    let currentPageNum = pageNum;
    let currentPageSize = getPageSize();

    if (options.nextPage) {
      currentPageNum += 1;
    } else if (options.refresh) {
      currentPageSize = currentPageSize * currentPageNum;
      currentPageNum = 1;
    }
    const r = fetchData(currentPageNum, currentPageSize);
    r.then((data: any) => {
      if (currentModelValue === props.modelValue && data && data.result) {
        if (!data.hasNextPage) {
          isNoMore.value = true;
        }
        if (currentPageNum === 1) {
          list.value = data.result;
        } else {
          list.value = [...list.value, ...data.result];
        }
        // 更新记录pageNum
        if (!options.refresh) {
          pageNum = currentPageNum;
        }
      }
    })
      .catch(err => {
        console.debug(err);
      })
      .finally(() => {
        if (currentModelValue === props.modelValue) {
          isFetching.value = false;
        }
        notifyCb.value?.();
      });

    return r;
  }
  return Promise.resolve();
};
const forceQueryData = () => {
  pageNum = 1;
  isNoMore.value = false;
  return queryData({ enforce: true });
};
const clearDataAndForceQueryData = () => {
  list.value = [];
  forceQueryData();
};
const queryNextPageData = () => queryData({ nextPage: true });
const refreshQueriedData = () => queryData({ refresh: true });

const handleShowActions = (data: any) => {
  currentActionData.value = data;
  showActions.value = true;
};

const click2InfosEdit = (item: Record<string, any>) => {
  if (!infosCategory[props.modelValue]) return;
  uni.navigateTo({
    url: `/app-platform/infos/${infosCategory[props.modelValue]}/edit?id=${item.id}`,
  });
};

const handleActionClick = async (index: number) => {
  const item = currentActionData.value;
  if (!item) return;
  const actionType = actionsList.value[index].action;
  switch (actionType) {
    case 'top': {
      await toggleTopDisplay({
        topDisplay: 1,
        id: item.id,
      });
      uni.showToast({
        title: '已置顶',
        icon: 'success',
      });
      break;
    }
    case 'cancelTop': {
      await toggleTopDisplay({
        topDisplay: 0,
        id: item.id,
      });
      uni.showToast({
        title: '已取消置顶',
        icon: 'success',
      });
      break;
    }
    case 'offline': {
      await onOffLineAlbum({
        status: 4,
        id: item.id,
      });
      uni.showToast({
        title: '已下线',
        icon: 'success',
      });
      break;
    }
    case 'online': {
      await onOffLineAlbum({
        status: 1,
        id: item.id,
      });
      uni.showToast({
        title: '已上线',
        icon: 'success',
      });
      break;
    }
    case 'edit': {
      click2InfosEdit(item);
      break;
    }
    case 'delete': {
      show.value = true;
      break;
    }
    default: {
      break;
    }
  }

  if (!['edit', 'cancel', 'delete'].includes(actionType)) {
    refreshQueriedData();
  }
};

const handleDelInfos = async () => {
  const item = currentActionData.value;
  try {
    if (props.modelValue === 0) {
      await deleteInfos(item.id);
    } else {
      await deleteAlbumVideo(item.id);
    }
  } catch (error) {
    console.log('>>LL>>> ~ 删除弹窗:', error);
  } finally {
    show.value = false;
  }
  uni.showToast({
    title: '已删除',
    icon: 'success',
    success() {
      refreshQueriedData();
    },
  });
};

const onReachBottom = () => {
  queryNextPageData();
};

watch(
  () => props.modelValue,
  (val, originVal) => {
    if (val !== originVal) {
      clearDataAndForceQueryData();
    }
  },
);

onBeforeMount(() => {
  refreshQueriedData();
});

onShow(() => {
  refreshQueriedData();
});
</script>

<template>
  <view
    style="height: calc(100vh - 88rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))"
  >
    <u-empty-custom v-if="!isFetching && list.length === 0" />
    <scroll-view
      v-else
      :scroll-y="true"
      style="height: 100%"
      scroll-with-animation
      :scroll-top="scrollTop"
      @scrolltolower="onReachBottom"
    >
      <VideoList v-if="modelValue === 2" :data="list" :on-actions="handleShowActions" />
      <AlbumList v-else-if="modelValue === 1" :data="list" :on-actions="handleShowActions" />
      <NewsList v-else :data="list" :on-actions="handleShowActions" />
      <view class="u-p-b-24">
        <u-loadmore
          :status="status"
          :load-text="{
            loadmore: '上拉刷新',
            loading: '正在加载',
            nomore: '没有更多了',
          }"
          @loadmore="onReachBottom"
        />
      </view>
    </scroll-view>
  </view>
  <u-modal
    v-model="show"
    async-close
    title="确认删除？"
    content="删除后将无法恢复，确认删除该项吗？"
    show-cancel-button
    @confirm="handleDelInfos"
  />
  <u-action-sheet
    v-model="showActions"
    border-radius="16"
    :list="actionsList"
    safe-area-inset-bottom
    @click="handleActionClick"
  />
</template>
