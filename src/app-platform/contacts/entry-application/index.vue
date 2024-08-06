<template>
  <page>
    <view class="content">
      <view class="tabs">
        <u-tabs
          v-model="actionIndex"
          :list="tabsTitle"
          :is-scroll="false"
          item-width="140"
          font-size="34"
          @change="handleChangeTab"
        ></u-tabs>
      </view>

      <view v-show="actionIndex == 0" class="input-content">
        <view class="search-content"> </view>
        <view v-if="list?.length" class="scroller-parent" :style="{ height: scrollH + 'px' }">
          <scroll-view
            class="scroller-content"
            :scroll-y="true"
            refresher-enabled="true"
            :refresher-triggered="triggered"
            @refresherrefresh="onRefresh"
            @scrolltolower="scrolltolower"
          >
            <view v-if="total" class="ptb-s" style="padding-left: 32rpx">
              <text class="color-placeholder bold">共{{ total }}条申请</text>
            </view>
            <EntryUnhandle
              v-for="item in list"
              :key="item.id"
              :info="item"
              @onApprove="unHandlerEvent"
            />
            <u-loadmore
              v-if="isShowNoMoreTip"
              :status="bottomLoadingState"
              :bg-color="getPageBgColor"
            />
          </scroll-view>
        </view>
        <u-empty-custom
          v-else
          v-show="isShowEmptyView"
          text="暂无数据"
          model="list"
          class="content-empty"
        />
      </view>
      <view v-show="actionIndex == 1" class="input-content">
        <view class="search-content"> </view>
        <view v-if="doneList?.length" class="scroller-parent" :style="{ height: scrollH + 'px' }">
          <scroll-view
            class="scroller-content"
            :scroll-y="true"
            refresher-enabled="true"
            :refresher-triggered="doneTriggered"
            @refresherrefresh="onDownRefresh"
            @scrolltolower="scrolltolower"
          >
            <view class="ptb-s"></view>
            <EntryHandle v-for="item in doneList" :key="item.id" :info="item" />
            <u-loadmore
              v-if="doneIsShowNoMoreTip"
              :status="doneBottomLoadingState"
              :bg-color="getPageBgColor"
            />
          </scroll-view>
        </view>
        <u-empty-custom
          v-else
          v-show="doneIsShowEmptyView"
          text="暂无数据"
          model="list"
          class="content-empty"
        />
      </view>
    </view>
  </page>
</template>

<script lang="ts" setup>
import { IListApproveToClazzRtn, listApproveToClazz } from '@/app-platform/services/contacts';
import { loginStore } from '@/store/modules/login';
import { getPageBgColor } from '@/styles/theme/get-config-color';
import { hideLoading, log } from '@/utils/tools';
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import EntryHandle from './entry-handle/index.vue';
import EntryUnhandle from './entry-unhandle/index.vue';

/** 数据加载类型 */
export type IDataLoadType = 'new' | 'append';

/** 翻页属性 */
export interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}

// tabs
const tabsTitle = ref([{ name: '未处理' }, { name: '已处理' }]);
// 选中tab
const actionIndex = ref(0);
// tab切换
const handleChangeTab = (idx: number) => {
  actionIndex.value = idx;
};
const scrollH = ref(0);
const pageSize = 15;

const triggered = ref(false);
const list = ref([] as IListApproveToClazzRtn[]);
const pager = reactive({} as IPager);
const total = ref(0);
const isShowEmptyView = ref(false);
const isShowNoMoreTip = ref(false);
const bottomLoadingState = ref('loading');

const doneTriggered = ref(false);
const doneList = ref([] as IListApproveToClazzRtn[]);
const donePager = reactive({} as IPager);
const doneIsShowEmptyView = ref(false);
const doneIsShowNoMoreTip = ref(false);
const doneBottomLoadingState = ref('loading');

// 是否需要刷新通讯录-学生数据
let isNeedRefreshContact = false;
const store = loginStore();

/** 调用接口获取数据 */
const fetchData = async (type: IDataLoadType) => {
  if (type === 'new') {
    isShowNoMoreTip.value = false;
  }
  try {
    const res = await fetchDataFunc(Object.assign({}, pager, { pageNum: pager.pageNum }), type);
    log('fetchData -> res : ', res);
    if (type !== 'append') {
      closeRefresh();
      uni.stopPullDownRefresh();
      hideLoading();
    }

    Object.assign(pager, {
      total: res['total'] || pager.total,
    });
    if (pager.pageNum * pager.pageSize >= pager.total) {
      bottomLoadingState.value = 'nomore';
      isShowNoMoreTip.value = true;
    }
    return res;
  } catch (error: any) {
    if (type !== 'append') {
      uni.stopPullDownRefresh();
      closeRefresh();
      hideLoading();
    }

    if (type === 'append') {
      Object.assign(pager, {
        pageNum: pager.pageNum - 1,
      });
    }
    return [];
  }
};

const fetchDataFunc = async (pager: IPager, loadType: IDataLoadType) => {
  const { pageSize, pageNum } = pager;
  const res = await listApproveToClazz({
    teacherId: store?.userInfo?.id || '',
    status: actionIndex.value,
    pageSize,
    pageNum,
  });

  total.value = res.total;
  if (loadType === 'new') list.value = [];
  list.value.push(...res.result);
  if (list.value.length === 0) {
    isShowEmptyView.value = true;
  }
  return res;
};

/** 调用接口获取数据 */
const fetchDoneData = async (type: IDataLoadType) => {
  if (type === 'new') {
    doneIsShowNoMoreTip.value = false;
  }
  try {
    const res = await fetchDoneDataFunc(
      Object.assign({}, donePager, { pageNum: donePager.pageNum }),
      type,
    );
    log('fetchDoneData -> res : ', res);
    if (type !== 'append') {
      closeRefresh();
      uni.stopPullDownRefresh();
      hideLoading();
    }

    Object.assign(donePager, {
      total: res['total'] || donePager.total,
    });
    if (donePager.pageNum * donePager.pageSize >= donePager.total) {
      doneBottomLoadingState.value = 'nomore';
      doneIsShowNoMoreTip.value = true;
    }
    return res;
  } catch (error: any) {
    if (type !== 'append') {
      uni.stopPullDownRefresh();
      closeRefresh();
      hideLoading();
    }

    if (type === 'append') {
      Object.assign(donePager, {
        pageNum: donePager.pageNum - 1,
      });
    }
    return [];
  }
};

const fetchDoneDataFunc = async (pager: IPager, loadType: IDataLoadType) => {
  const { pageSize, pageNum } = pager;
  const res = await listApproveToClazz({
    teacherId: store?.userInfo?.id || '',
    status: actionIndex.value,
    pageSize,
    pageNum,
  });

  if (loadType === 'new') doneList.value = [];
  doneList.value.push(...res.result);
  if (doneList.value.length === 0) {
    doneIsShowEmptyView.value = true;
  }
  return res;
};

const freshList = () => {
  list.value = [];
  initPager();
  fetchData('new');
};

/**
 * 未处理的入班申请处理后的回调
 * @param isApply 是否同意
 */
const unHandlerEvent = (isApply: boolean) => {
  log('isApply : ', isApply);
  isNeedRefreshContact = isApply;
  freshList();
};

watch(
  () => actionIndex.value,
  newValue => {
    log('watch-actionIndex.value : ', actionIndex.value);
    if (newValue == 1) {
      doneList.value = [];
      Object.assign(donePager, { pageNum: 1, pageSize: pageSize, total: Infinity });
      fetchDoneData('new');
    } else {
      if (!list.value || list.value.length == 0) {
        freshList();
      }
    }
  },
);

/** 初始化翻页属性 */
const initPager = () => {
  Object.assign(pager, { pageNum: 1, pageSize: pageSize, total: Infinity });
};

// scroll-view
const onRefresh = async () => {
  log('onRefresh=============');
  log('下拉刷新');
  initPager();
  fetchData('new');
};

const onDownRefresh = async () => {
  log('onDownRefresh=============');
  log('下拉刷新');
  Object.assign(donePager, { pageNum: 1, pageSize: pageSize, total: Infinity });
  fetchDoneData('new');
};

// scroll-view
const scrolltolower = () => {
  log('到底了');
  if (actionIndex.value == 0) {
    log('scrolltolower -> pagerNum : ', pager.pageNum);
    log('scrolltolower -> pageSize : ', pager.pageSize);
    log('scrolltolower -> total : ', pager.total);
    if (pager.pageNum * pager.pageSize >= pager.total) {
      bottomLoadingState.value = 'nomore';
      isShowNoMoreTip.value = true;
      return;
    }
    Object.assign(pager, {
      pageNum: pager.pageNum + 1,
    });
    bottomLoadingState.value = 'loading';
    fetchData('append');
  } else {
    log('scrolltolower -> pagerNum : ', donePager.pageNum);
    log('scrolltolower -> pageSize : ', donePager.pageSize);
    log('scrolltolower -> total : ', donePager.total);
    if (donePager.pageNum * donePager.pageSize >= donePager.total) {
      doneBottomLoadingState.value = 'nomore';
      doneIsShowNoMoreTip.value = true;
      return;
    }
    Object.assign(donePager, {
      pageNum: donePager.pageNum + 1,
    });
    doneBottomLoadingState.value = 'loading';
    fetchDoneData('append');
  }
};

// scroll-view
const closeRefresh = () => {
  if (actionIndex.value == 0) {
    if (!triggered.value) {
      triggered.value = true;
      setTimeout(() => {
        triggered.value = false;
      }, 200);
    }
  } else {
    if (!doneTriggered.value) {
      doneTriggered.value = true;
      setTimeout(() => {
        doneTriggered.value = false;
      }, 200);
    }
  }
};

onMounted(() => {
  let safeArea = uni.getSystemInfoSync().safeAreaInsets?.bottom;
  log('onMounted -> safeArea : ', safeArea);
  let windowH = uni.getSystemInfoSync().windowHeight;
  log('onMounted -> windowH : ', windowH);
  scrollH.value = windowH - 55 - (safeArea ? safeArea : 0);
  // 触发自动刷新下
  log('onMounted -> 下拉刷新');
  initPager();
  fetchData('new');
});

onUnmounted(() => {
  if (isNeedRefreshContact) {
    uni.$emit('joinClassUpdateStudent');
  }
});
</script>

<style scoped lang="scss">
.content {
  height: 100%;
  position: relative;
  // overflow: scroll; // 使用这个条件会导致无法下滑加载更多
  box-sizing: border-box;
  background-repeat: no-repeat;
  background-color: $ui-color-page-primary;
}
.tabs {
  height: 88rpx;
  display: flex;
  background-color: white;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
}
.bold {
  font-weight: 600;
}
.ptb-s {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.input-content {
  height: 100%;
  .search-content {
    padding: 0 32rpx 0 32rpx;
  }
}

.color-placeholder {
  color: #86909c;
}

.scroller-parent {
  display: flex;
  flex-direction: column;
  .scroller-content {
    flex: 1;
    height: 0;
    width: 100%;
    // height: calc(100vh - var(--window-top) - 88rpx - 100rpx);
  }
}

:deep(.u-tabbar__content__item__text .u-line-1) {
  font-size: 20rpx;
  line-height: 20rpx;
}
</style>
