<template>
  <view class="searchbar">
    <view class="select-area">
      <u-dropdown border-bottom>
        <u-dropdown-item
          v-model="state.level"
          :title="getDropdownTitle(edu ? _eduLevelEnum : _levelEnum, state.level, '课题级别')"
          :options="edu ? eduLevelEnum : levelEnum"
        ></u-dropdown-item>
      </u-dropdown>
    </view>
    <view class="input-area">
      <u-search
        v-model="state.name"
        class="input-search"
        placeholder="批次名称"
        shape="square"
        :show-action="false"
        style=""
        :height="72"
        @search="onSearchInput"
        @clear="onSearchClear"
      ></u-search>
    </view>
  </view>
  <view
    :style="{
      height: !hasTabbar
        ? 'calc(100vh - 200rpx - var(--window-top) - env(safe-area-inset-bottom))'
        : 'calc(100vh - 200rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))',
    }"
  >
    <u-empty-custom v-if="state.status !== 'loading' && state.list.length === 0" mode="search" />
    <scroll-view
      v-else-if="bodyHeight"
      :scroll-y="true"
      :style="{
        height: bodyHeight,
      }"
      scroll-with-animation
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="triggered"
      @refresherrefresh="handleRefresh"
    >
      <view>
        <template v-for="item in state.list" :key="item.id">
          <TopicItem :form-type="2" v-bind="item" @click="handleEdit(item)"> </TopicItem>
        </template>
      </view>

      <view class="u-p-b-24">
        <u-loadmore
          :status="state.status"
          :load-text="{
            loadmore: '上拉刷新',
            loading: '正在加载',
            nomore: '没有更多了',
          }"
          @loadmore="loadMore"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { queryPage } from '@/app-teacher-personnel/topic/api/topicBatch';
import TopicItem from '@/app-teacher-personnel/topic/components/topic-item.vue';
import {
  eduLevelEnum as _eduLevelEnum,
  levelEnum as _levelEnum,
} from '@/app-teacher-personnel/topic/helper/enum';
import { isEdu } from '@/utils/tools';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { computed, reactive, ref, watch } from 'vue';
import { ALL_ITEM } from '../helper/constants';
import { getDropdownTitle } from '../helper/utils';

interface State {
  list: any[];
  total: number;
  pageNum: number;
  name?: string;
  level?: number | 'all';
  stage?: number;
  status: string;
}

const props = defineProps({ hasTabbar: Boolean });

const eduLevelEnum = [ALL_ITEM, ..._eduLevelEnum];
const levelEnum = [ALL_ITEM, ..._levelEnum];
const triggered = ref(false);

const edu = isEdu();
// const formState = reactive({
//   name: '',
//   assetStatuses: [],
//   isOwner: false,
// });

const bodyHeight = computed(() => {
  return !props.hasTabbar
    ? 'calc(100vh - 200rpx - var(--window-top) - env(safe-area-inset-bottom))'
    : 'calc(100vh - 200rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))';
});

const state = reactive<State>({
  list: [],
  pageNum: 1,
  total: 0,
  status: 'loadmore',
  level: 'all',
});

function handleRefresh() {
  triggered.value = true;
  init();
}

const getPageList = async () => {
  try {
    state.status = 'loading';
    const response: any = await queryPage({
      pageNum: state.pageNum,
      pageSize: 20,
      name: state.name,
      level: state.level === 'all' ? undefined : state.level,
      stage: state.stage,
      orderBy: 1,
    });

    if (state.pageNum === 1) {
      state.list = response.result || [];
    } else {
      state.list = state.list.concat(response.result || []);
    }

    state.total = response.total || 0;
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.status = state.list.length >= state.total ? 'nomore' : 'loadmore';
    setTimeout(() => {
      triggered.value = false;
    }, 1000);
    // uni.stopPullDownRefresh();
  }
};

const loadMore = () => {
  if (state.status === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
};

// 上拉加载
onReachBottom(() => {
  loadMore();
});

// onPullDownRefresh(() => {
//   state.pageNum = 1;
//   getPageList();
// });

const onSearchInput = (value: string) => {
  // state.name = value || '';
  state.pageNum = 1;
  // isOpenSearch.value = false;
  getPageList();
};

const onSearchClear = () => {
  state.name = '';
  state.pageNum = 1;
  getPageList();
};

function handleEdit(item) {
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/declare/Detail?id=${item.id}&hideDeletedButton=1`,
  });
}

watch(
  () => [state.stage, state.level],
  () => {
    state.pageNum = 1;
    getPageList();
  },
  {
    immediate: true,
  },
);

function init() {
  state.pageNum = 1;
  getPageList();
}

onLoad(() => {
  init();
});
</script>

<style scoped lang="scss">
.searchbar {
  /* position: fixed;
  left: 0;
  width: 100%;
  z-index: 2; */
  background-color: #fff;
  box-shadow: 0px 1px 2px 0px #0000000a;
  display: flex;
  flex-direction: column;
  height: 200rpx;
  &-placeholder {
    padding-top: 200rpx;
  }
  .select-area {
    padding: 8rpx 0;
  }
  .input-area {
    height: 104rpx;
    padding: 0 32rpx;
    display: flex;
    align-items: center;
    .input-search {
      flex: auto;
    }
  }
}

.add-btn {
  width: $icon-size-xl;
  height: $icon-size-xl;
  @include large-title-regular;
  border-radius: 50%;
  background: $color-primary;
  color: $color-text-inverse;
  text-align: center;
  position: fixed;
  right: px2rpx(20px);
  bottom: calc(px2rpx(60px) + env(safe-area-inset-bottom));
}
</style>
