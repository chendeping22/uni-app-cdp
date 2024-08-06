<template>
  <page custom-overflow="visible">
    <view class="approve-page">
      <view class="approve-header">
        <view class="search-content">
          <u-search
            v-model="searchParams.searchKeyword"
            placeholder="请输入单号"
            shape="square"
            color="rgba(0, 0, 0, 0.88)"
            search-icon-color="rgba(0, 0, 0, 0.45)"
            placeholder-color="rgba(0, 0, 0, 0.45)"
            :show-action="false"
            class="search-content-search"
            :height="72"
            @search="handleSearch"
          ></u-search>
          <u-image
            :src="isOpenSearch ? iconOpenSearch : iconCloseSearch"
            width="80rpx"
            height="80rpx"
            :fade="false"
            :show-loading="false"
            :style="{ marginLeft: '32rpx' }"
            @click="handleIconSearch"
          ></u-image>
        </view>
        <u-tabs
          v-model="currentTab"
          :list="tabList"
          inactive-color="rgba(0, 0, 0, 0.65)"
          class="approve-tabs"
          @change="changeTab"
        ></u-tabs>
        <u-popup
          v-model="isOpenSearch"
          mode="top"
          :mask="true"
          class="search-popup"
          height="440rpx"
          :border-radius="16"
          :mask-custom-style="{
            top: '260rpx',
          }"
        >
          <view class="search-popup-content">
            <view class="popup-title">筛选</view>
            <view class="popup-list">
              <view
                v-for="item in statusList"
                :key="item.value"
                class="popup-item"
                :class="
                  searchParams.approveStatus?.includes(item.value)
                    ? 'select-popup-item'
                    : 'normal-popup-item'
                "
                @click="handleChangeStatus(item.value)"
                >{{ item.label }}</view
              ></view
            >
          </view>
          <view class="popup-bottom">
            <u-button class="popup-bottom-left" @click="handleReset">重置</u-button>
            <u-button class="popup-bottom-right" type="primary" @click="handleFilterSearch"
              >确定</u-button
            >
          </view>
        </u-popup>
      </view>
      <view class="approve-header-placeholder"></view>
      <view class="approve-content">
        <view v-if="state.listData?.length" class="approve-list">
          <list :current-type="currentType" :list-data="state.listData" :status-list="statusList" />
          <u-loadmore :status="state.pageStatus" margin-bottom="32" @loadmore="loadmore" />
        </view>
        <view v-else class="approve-empty">
          <u-empty-custom
            v-if="isEmpty"
            :mode="searchParams.searchKeyword ? 'search' : 'list'"
          ></u-empty-custom>
        </view>
        <view
          v-if="
            currentType !== RecordTypeEnum.ServiceRecord && currentType !== RecordTypeEnum.PutRecord
          "
          class="approve-bottom"
        >
          <u-button type="primary" @click="goAdd(bottomBtn[currentType]?.url)">{{
            bottomBtn[currentType]?.name
          }}</u-button>
        </view>
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import {
  RecordTypeEnum,
  statusList as commonStatus,
  disposeStatusList,
  serviceStatusList,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { getPermissionInfo } from '@/app-general-affairs-logistics/services/assets-manage';
import iconCloseSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_close_search.svg';
import iconOpenSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_open_search.svg';
import { getPageParams, showInfo } from '@/utils/tools';
import { onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import { filter, includes } from 'lodash-es';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import {
  IListParams,
  getApproveReceiveList,
  getAssetAcceptanceReturnList,
  getAssetBorrowList,
  getAssetBorrowReturnList,
  getAssetDisposalsList,
  getAssetPutList,
  getAssetRepairTaskList,
  getAssetRepairsList,
  getAssetVariationList,
} from '../../services/approve-list';
import { adminTabs, bottomBtn, commonTabs } from './constants';
import list from './list/index.vue';

const tabList = ref<any[]>([]);

const searchParams = reactive<{ searchKeyword?: string; approveStatus?: (string | number)[] }>({
  searchKeyword: undefined,
  approveStatus: [''],
});
const currentTab = ref(RecordTypeEnum.ReceiveRecord);
const isOpenSearch = ref<boolean>(false);

const statusList = computed(() => {
  let list: any[] = [];
  switch (currentTab.value) {
    case RecordTypeEnum.ServiceRecord:
      list = serviceStatusList;
      break;
    case RecordTypeEnum.DisposeRecord:
      list = disposeStatusList;
      break;
    default:
      list = commonStatus;
      break;
  }
  return [{ label: '全部', value: '' }].concat(list);
});

const pageParams = ref<any>();

const getTabList = async () => {
  try {
    const res: any = await getPermissionInfo();
    tabList.value = [...commonTabs, ...(res?.isAdmin ? adminTabs : [])];
  } catch (e: any) {
    tabList.value = commonTabs;
  } finally {
    currentTab.value = pageParams.value?.tab || RecordTypeEnum.ReceiveRecord;
    state.currentPage = 1;
    getPageList();
  }
};

onBeforeMount(() => {
  pageParams.value = getPageParams() || {};
  getTabList();
});
onShow(() => {
  getPageList();
});
const state = reactive<{
  listData: Record<string, any>[];
  currentPage: number;
  total: number;
  pageStatus: string;
  recordId: string;
}>({
  listData: [],
  currentPage: 1,
  total: 0,
  pageStatus: 'loadmore',
  recordId: '',
});

/** 当前单据类型 */
const currentType = computed(() => tabList.value[currentTab.value]?.key);

const isEmpty = computed(
  () => state.pageStatus !== 'loading' && state.currentPage === 1 && state.listData?.length === 0,
);

const handleListData = async (params: IListParams) => {
  let res: any = undefined;
  switch (currentType.value) {
    case RecordTypeEnum.ReceiveRecord:
      res = await getApproveReceiveList(params);
      break;
    case RecordTypeEnum.SendBackRecord:
      res = await getAssetAcceptanceReturnList(params);
      break;
    case RecordTypeEnum.BorrowRecord:
      res = await getAssetBorrowList(params);
      break;
    case RecordTypeEnum.ReturnRecord:
      res = await getAssetBorrowReturnList(params);
      break;
    case RecordTypeEnum.RepairRecord:
      res = await getAssetRepairsList(params);
      break;
    case RecordTypeEnum.ServiceRecord:
      res = await getAssetRepairTaskList(params);
      break;
    case RecordTypeEnum.VariationRecord:
      res = await getAssetVariationList(params);
      break;
    case RecordTypeEnum.DisposeRecord:
      res = await getAssetDisposalsList(params);
      break;
    case RecordTypeEnum.PutRecord:
      res = await getAssetPutList(params);
      break;
    default:
      break;
  }
  return res;
};

/** 列表查询 */
const getPageList = async () => {
  try {
    state.pageStatus = 'loading';
    const params: any = {
      ...(searchParams?.searchKeyword ? { code: searchParams?.searchKeyword } : {}),
      ...(searchParams.approveStatus?.find(v => v)
        ? { taskStatus: searchParams.approveStatus }
        : {}),
      pageSize: 15,
      currentPage: state.currentPage,
    };
    const res: any = await handleListData(params);
    if (state.currentPage === 1) {
      state.listData = res?.list || res?.records || [];
    } else {
      state.listData = state.listData.concat(res?.list || res?.records || []);
    }
    state.total = (res?.pagination?.total || res?.total) ?? 0;
  } catch (e: any) {
    showInfo(e?.msg || '查询失败');
    state.listData = [];
  } finally {
    state.pageStatus = state.listData.length >= state.total ? 'nomore' : 'loadmore';
    uni.stopPullDownRefresh();
  }
};

const handleSearch = () => {
  state.currentPage = 1;
  getPageList();
};

const handleFilterSearch = () => {
  state.listData = [];
  isOpenSearch.value = false;
  handleSearch();
};

const changeTab = (index: number) => {
  if (index === RecordTypeEnum.ServiceRecord || currentTab.value === RecordTypeEnum.ServiceRecord) {
    searchParams.approveStatus = [''];
  }
  state.listData = [];
  currentTab.value = index;
  handleSearch();
};

const handleIconSearch = () => {
  isOpenSearch.value = !isOpenSearch.value;
};

const handleChangeStatus = (status: string) => {
  // 选中全部-清空其他选中
  if (!status) {
    searchParams.approveStatus = [''];
    return;
  }
  let selectStatus: any = searchParams.approveStatus || [];
  // 选中及取消操作
  if (!includes(selectStatus, status)) {
    selectStatus = selectStatus.concat(status);
  } else {
    selectStatus = filter(selectStatus, v => v !== status);
  }
  // 取消其他状态选中后，默认选中全部
  searchParams.approveStatus = selectStatus?.length
    ? filter(selectStatus || [], v => v !== '')
    : [''];
};

const handleReset = () => {
  state.listData = [];
  searchParams.approveStatus = [''];
  isOpenSearch.value = false;
  handleSearch();
};

const loadmore = () => {
  if (state.pageStatus === 'loadmore') {
    state.currentPage = state.currentPage + 1;
    getPageList();
  }
};

const goAdd = (url: string) => {
  uni.navigateTo({ url });
};

onReachBottom(() => {
  loadmore();
});

/** 下拉刷新 */
onPullDownRefresh(() => {
  state.currentPage = 1;
  getPageList();
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.approve-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.approve-header {
  background-color: $colorWhite;
  box-shadow: $boxShadow;
  position: fixed;
  height: 160rpx;
  width: 100%;
  z-index: 2;
  &-placeholder {
    padding-top: 150rpx;
  }
}
.search-content {
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  &-search {
    flex: 1;
  }
}
.approve-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.approve-list {
  flex: 1;
}

.approve-empty {
  flex: 1;
}
.approve-bottom {
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  position: sticky;
  bottom: 0;
  z-index: 2;
  background-color: $colorWhite;
}
.search-popup {
  top: 72rpx;
  :deep(.u-drawer) {
    top: 72rpx;
  }
  &-content {
    padding: 32rpx;
    padding-bottom: 0;
  }
  .popup-title {
    font-weight: 500;
    color: $textDefaultColor;
    margin-bottom: 24rpx;
  }
  .popup-list {
    display: flex;
    flex-wrap: wrap;
  }
  .popup-item {
    margin-bottom: 24rpx;
    margin-right: 24rpx;
    width: 200rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
  }
  .popup-bottom {
    display: flex;
    padding: 24rpx 32rpx;
  }
  .popup-bottom-left,
  .popup-bottom-right {
    flex: 1;
  }
  .popup-bottom-left {
    margin-right: 24rpx;
    color: $colorPrimaryBase;
  }
  .select-popup-item {
    color: $colorPrimaryBase;
    background-color: $colorPrimaryLightBg;
  }
  .normal-popup-item {
    color: $textLabelColor;
    background-color: $fillDefaultColor;
  }
}
</style>
