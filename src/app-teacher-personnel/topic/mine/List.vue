<template>
  <view class="searchbar">
    <view class="tab-area">
      <u-tabs v-model="formState.typeIndex" :list="tabs" :is-scroll="false"></u-tabs>
    </view>
    <view class="input-area">
      <u-search
        v-model="formState.name"
        placeholder="课题名称"
        shape="square"
        :show-action="false"
        style=""
        :height="72"
        class="input-search"
        @search="onSearchInput"
        @clear="onSearchClear"
      ></u-search>
    </view>
    <view class="select-area">
      <u-dropdown>
        <u-dropdown-item
          v-model="formState.level"
          :title="getDropdownTitle(edu ? _eduLevelEnum : _levelEnum, formState.level, '课题级别')"
          :options="edu ? eduLevelEnum : levelEnum"
        ></u-dropdown-item>
        <u-dropdown-item
          v-model="formState.status"
          :title="getDropdownTitle(_topicStatusEnum, formState.status, '立项状态')"
          :options="topicStatusEnum"
        ></u-dropdown-item>
        <u-dropdown-item
          v-model="formState.stage"
          :title="getDropdownTitle(_stageEnum, formState.stage, '阶段')"
          :options="stageEnum"
        ></u-dropdown-item>
      </u-dropdown>
    </view>
  </view>
  <view
    :style="{
      height: !hasTabbar
        ? 'calc(100vh - 288rpx - var(--window-top) - env(safe-area-inset-bottom))'
        : 'calc(100vh - 288rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))',
    }"
  >
    <u-empty-custom v-if="state.status !== 'loading' && state.list.length === 0" mode="search" />
    <scroll-view
      v-else-if="bodyHeight"
      :scroll-y="true"
      :style="{
        height: bodyHeight,
      }"
      style="height: 100%"
      scroll-with-animation
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="triggered"
      @refresherrefresh="handleRefresh"
    >
      <view>
        <template v-for="item in state.list" :key="item.id">
          <TopicItem :form-type="3" v-bind="item" @click="handleDetail(item)"> </TopicItem>
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
import { queryPage } from '@/app-teacher-personnel/topic/api/topicInfo';
import TopicItem from '@/app-teacher-personnel/topic/components/topic-item.vue';
import {
  eduLevelEnum as _eduLevelEnum,
  levelEnum as _levelEnum,
  stageEnum as _stageEnum,
  topicStatusEnum as _topicStatusEnum,
} from '@/app-teacher-personnel/topic/helper/enum';
import { isEdu } from '@/utils/tools';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ALL_ITEM } from '../helper/constants';
import { getDropdownTitle } from '../helper/utils';

const eduLevelEnum = [ALL_ITEM, ..._eduLevelEnum];
const levelEnum = [ALL_ITEM, ..._levelEnum];
const stageEnum = [ALL_ITEM, ..._stageEnum];
const topicStatusEnum = [ALL_ITEM, ..._topicStatusEnum];

interface State {
  list: any[];
  total: number;
  pageNum: number;
  name?: string;
  level?: number | 'all';
  stage?: number | 'all';
  status: string | 'all';
}

const props = defineProps({ hasTabbar: Boolean });

const triggered = ref(false);

const edu = isEdu();
const formState = reactive({
  typeIndex: 0,
  name: undefined,
  level: 'all',
  status: 'all',
  stage: 'all',
});

const state = reactive<State>({
  list: [],
  pageNum: 1,
  total: 0,
  status: 'loadmore',
});

const tabs = [
  { name: '我主持的', type: 1 },
  { name: '我参与的', type: 0 },
];

const bodyHeight = computed(() => {
  return !props.hasTabbar
    ? 'calc(100vh - 288rpx - var(--window-top) - env(safe-area-inset-bottom))'
    : 'calc(100vh - 288rpx - 112rpx - var(--window-top) - env(safe-area-inset-bottom))';
});

function handleRefresh() {
  triggered.value = true;
  reload();
}

const getPageList = async () => {
  try {
    state.status = 'loading';
    const response: any = await queryPage({
      pageNum: state.pageNum,
      pageSize: 20,
      name: formState.name,
      level: formState.level === 'all' ? undefined : formState.level,
      stage: formState.stage === 'all' ? undefined : formState.stage,
      status: formState.status === 'all' ? undefined : formState.status,
      type: tabs[formState.typeIndex].type,
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

const onSearchInput = (value: string) => {
  state.name = value || '';
  state.pageNum = 1;
  // isOpenSearch.value = false;
  getPageList();
};

const onSearchClear = () => {
  state.name = '';
  state.pageNum = 1;
  getPageList();
};

function handleDetail(item) {
  if (tabs[formState.typeIndex].type !== 0 && (item.status === 0 || item.status === 3)) {
    uni.navigateTo({
      url: `/app-teacher-personnel/topic/declare/Declare?id=${item.id}`,
    });
    return;
  }
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/detail/index?id=${item.id}&hideDeletedButton=1&type=mine`,
  });
}

const reload = async () => {
  state.pageNum = 1;
  await getPageList();
};

watch(
  () => [formState.level, formState.stage, formState.status, formState.typeIndex],
  () => {
    reload();
  },
  {
    immediate: true,
  },
);

onLoad(() => {
  reload();
});

onMounted(() => {
  uni.$on('topicDetailModified', reload);
});

onBeforeUnmount(() => {
  uni.$off('topicDetailModified', reload);
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
  height: 288rpx;
  &-placeholder {
    padding-top: 288rpx;
  }
  .tab-area {
    height: 88rpx;
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
