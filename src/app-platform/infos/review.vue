<template>
  <view
    style="height: calc(100vh - 88rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))"
  >
    <u-empty-custom v-if="!isFetching && reviewInfos?.length === 0" />
    <scroll-view v-else :scroll-y="true" style="height: 100%" @scrolltolower="onReachBottom">
      <template v-for="(info, index) in reviewInfos" :key="index">
        <ReviewItem :index="headCurrent" :info="info" @click-item="clickItem(info)" />
      </template>
      <view class="u-p-t-24 u-p-b-24">
        <u-loadmore :status="status" @loadmore="onReachBottom"></u-loadmore>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { IInfoInfo, queryReviewList } from '@/app-platform/services/infos';
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ReviewItem from './components/review-item/index.vue';

const props = defineProps<{
  /** 切换头部的选项卡 */
  modelValue: number;
}>();
defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

onBeforeMount(() => {
  uni.$on('RefreshReviewList', forceQueryData);
});

onBeforeUnmount(() => {
  uni.$off('RefreshReviewList', forceQueryData);
});

onMounted(() => {});

const onReachBottom = () => {
  queryNextPageData();
};

const headCurrent = ref(0);
const pageNum = ref(1);
const reviewInfos = ref<IInfoInfo[]>();
const isFetching = ref<boolean>(false);
const isNoMore = ref<boolean>(false);
const status = computed<'loadmore' | 'loading' | 'nomore'>(() => {
  if (isFetching.value) {
    return 'loading';
  } else if (isNoMore.value) {
    return 'nomore';
  }
  return 'loadmore';
});

const queryData = (
  options: {
    /** 强制请求，用于切换tab和下拉刷新时进行强制请求 */
    enforce?: boolean;
    /** 加载下一页数据 */
    nextPage?: boolean;
  } = {},
) => {
  if (options.enforce || (!isFetching.value && !isNoMore.value)) {
    const currentModelValue = props.modelValue;
    isFetching.value = true;
    if (options.nextPage) {
      pageNum.value += 1;
    }
    if (pageNum.value === 1) {
      isNoMore.value = false;
    }
    return queryReviewList(pageNum.value, currentModelValue + 1)
      .then((data: any) => {
        if (currentModelValue === props.modelValue && data && data.result) {
          if (!data.hasNextPage) {
            isNoMore.value = true;
          }
          if (pageNum.value === 1) {
            reviewInfos.value = data.result;
          } else {
            reviewInfos.value = [...reviewInfos.value, ...data.result];
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
      });
  }
  return Promise.resolve();
};
const forceQueryData = () => {
  pageNum.value = 1;
  isNoMore.value = false;
  return queryData({ enforce: true });
};

const queryNextPageData = () => queryData({ nextPage: true });

watch(
  () => props.modelValue,
  val => {
    console.log('........review---LL', val);
    reviewInfos.value = [];
    forceQueryData();
  },
  {
    immediate: true,
  },
);

const clickItem = (tempInfoInfo: IInfoInfo) => {
  uni.navigateTo({
    url: `/app-platform/infos/review/detail?id=${tempInfoInfo.id}&&source=approval`,
  });
};
</script>
