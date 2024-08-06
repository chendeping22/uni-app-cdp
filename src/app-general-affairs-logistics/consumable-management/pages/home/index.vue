<script setup lang="ts">
import defaultFile from '@/app-general-affairs-logistics/static/assets-manage/upload-file-item.svg';
import materialLoseOut from '@/app-general-affairs-logistics/static/consumable-management/materialLoseOut.svg';
import materialOut from '@/app-general-affairs-logistics/static/consumable-management/materialOut.svg';
import purchase from '@/app-general-affairs-logistics/static/consumable-management/purchase.svg';
import put from '@/app-general-affairs-logistics/static/consumable-management/put.svg';
import { formatDate, hideLoading, showInfo, showLoading } from '@/utils/tools';
import {
  onBackPress,
  onPageScroll,
  onPullDownRefresh,
  onReachBottom,
  onShow,
} from '@dcloudio/uni-app';
import { computed, onBeforeMount, reactive, ref } from 'vue';

import { getMaterialBacksPage } from '@/app-general-affairs-logistics/consumable-management/services/materialBack';
import { getMaterialOutsPage } from '@/app-general-affairs-logistics/consumable-management/services/materialOut';
import { getMaterialPutsPage } from '@/app-general-affairs-logistics/consumable-management/services/materialPuts';
import dayjs from 'dayjs';
import { find } from 'lodash-es';
import { getStoresBySpaceId } from '../../services/common';
import {
  getCountAndComputePercent,
  getCountMaterialBack,
  getCountMaterialOut,
  getCountMaterialPut,
  getMaterialPurchases,
  getMaterialPurchasesTask,
} from '../../services/home';
import { getMaterialInfosPage } from '../../services/inventory';
import { useTab } from '../../store/homeTab';
import ChartsList from './components/chartsList';
import DataList from './components/dataList';
import Inventory from './components/inventory/index.vue';
import MaterialList from './components/materialList/index.vue';
import PurchaseList from './components/purchaseList';
import SearchPopup from './components/searchPopup/index.vue';
import Statistics from './components/statistics';
import { RecordTypeEnum, TabList, bottomBtn, cardConfig } from './constants';

interface ISearchParams {
  searchValues?: string;
  status?: (string | number)[];
  startTime?: string;
  endTime?: string;
  storeId?: string;
  statusList?: (string | number)[];
  name?: string;
}

const tabStore = useTab();
const state = reactive<{
  listData: Record<string, any>[];
  pageNum: number;
  total: number;
  pageStatus: string;
}>({
  listData: [],
  pageNum: 1,
  total: 0,
  pageStatus: 'loadmore',
});
const currentTab = ref(tabStore.tabIndex);
const statisticsData = ref();
const countMaterialPut = ref();
const materialOutPut = ref();
const materialLoseOutPut = ref();
const materialBackPut = ref();
const isOpenSearch = ref<boolean>(false);
const storeList = ref<any[]>([]);

/** tab为耗材入库、出库、退库，耗损出库 */
const isMaterialTab = computed(() =>
  [
    RecordTypeEnum.ConsumableInventoryRecord,
    RecordTypeEnum.ConsumablesOutboundRecord,
    RecordTypeEnum.ConsumablesLossOutboundRecord,
    RecordTypeEnum.ConsumablesReturnRecord,
  ].includes(currentTab.value),
);
const defaultParams = {
  dateType: 1,
  beginTime: dayjs().startOf('year').format('YYYY-MM-DD'),
  endTime: dayjs().endOf('year').format('YYYY-MM-DD'),
};
const materialPutSearch = async (searchState?: any) => {
  countMaterialPut.value = await getCountMaterialPut(searchState || defaultParams);
};
const materialOutSearch = async (searchState?: any) => {
  materialOutPut.value = await getCountMaterialOut({
    ...(searchState || defaultParams),
    type: 0,
  });
};
const materialLoseOutSearch = async (searchState?: any) => {
  materialLoseOutPut.value = await getCountMaterialOut({
    ...(searchState || defaultParams),
    type: 1,
  });
};
const materialBackSearch = async (searchState?: any) => {
  materialBackPut.value = await getCountMaterialBack(searchState || defaultParams);
};
const getCount = async () => {
  statisticsData.value = await getCountAndComputePercent();
  materialPutSearch();
  materialOutSearch();
  materialLoseOutSearch();
  materialBackSearch();
};
const handleSearch = () => {
  if (currentTab.value === RecordTypeEnum.HomeRecord) {
    init();
  } else {
    state.pageNum = 1;
    getPageList();
  }
};

const changeTab = (index: number) => {
  searchParams.value = {};
  isOpenSearch.value = false;
  tabStore.$set(index);
  currentTab.value = index;
  if (index === RecordTypeEnum.HomeRecord) {
    return;
  }
  state.total = 0;
  state.listData = [];
  handleSearch();
};

const ordinaryList = ref<any[]>([]);
const loading = ref<boolean>(false);
const navList = [
  {
    label: '采购申请',
    icon: purchase,
    url: '/app-general-affairs-logistics/consumable-management/pages/purchase/index',
  },
  {
    label: '耗材入库',
    icon: put,
    url: '/app-general-affairs-logistics/consumable-management/pages/materialPuts/index',
  },
  {
    label: '耗材出库',
    icon: materialOut,
    url: '/app-general-affairs-logistics/consumable-management/pages/materialOut/index',
  },
  {
    label: '耗损出库',
    icon: materialLoseOut,
    url: '/app-general-affairs-logistics/consumable-management/pages/materialLoseOut/index',
  },
];
const scrollTop = ref<number>(1);

onPageScroll(e => {
  scrollTop.value = e.scrollTop;
});

const handleFilterSearch = (val?: ISearchParams) => {
  searchParams.value = { ...val };
  state.listData = [];
  isOpenSearch.value = false;
  handleSearch();
};

const handleListData = async (params: any) => {
  let res: any = undefined;
  switch (currentTab.value) {
    case RecordTypeEnum.PurchaseRequestRecord:
      res = await getMaterialPurchases(params);
      break;
    case RecordTypeEnum.ProcurementListRecord:
      res = await getMaterialPurchasesTask(params);
      break;
    case RecordTypeEnum.ConsumableInventoryRecord:
      res = await getMaterialPutsPage(params);
      break;
    case RecordTypeEnum.ConsumablesOutboundRecord:
      res = await getMaterialOutsPage(Object.assign(params, { flag: 0 }));
      break;
    case RecordTypeEnum.ConsumablesLossOutboundRecord:
      res = await getMaterialOutsPage(Object.assign(params, { flag: 1 }));
      break;
    case RecordTypeEnum.ConsumablesReturnRecord:
      res = await getMaterialBacksPage(params);
      break;
    case RecordTypeEnum.InventoryManagementRecord:
      res = await getMaterialInfosPage(params);
      break;
    default:
      break;
  }
  return res;
};

const isInventory = computed(() => currentTab.value === RecordTypeEnum.InventoryManagementRecord);

/** 列表查询 */
const getPageList = async () => {
  const { searchValues, name, startTime, endTime, storeId, statusList } = searchParams.value || {};
  showLoading();
  try {
    state.pageStatus = 'loading';
    const params: any = {
      ...(searchValues ? { [isInventory.value ? 'name' : 'searchValues']: searchValues } : {}),
      ...(name ? { name } : {}),
      ...(startTime ? { startTime } : {}),
      ...(endTime ? { endTime } : {}),
      ...(storeId ? { storeId } : {}),
      ...(find(statusList || [], v => v !== '')
        ? { [isInventory.value ? 'state' : 'statusList']: statusList?.join(',') }
        : {}),
      pageSize: 15,
      pageNum: state.pageNum,
    };
    const res: any = await handleListData(params);
    if (state.pageNum === 1) {
      state.listData = res?.result || [];
    } else {
      state.listData = state.listData.concat(res?.result || []);
    }
    state.total = res?.total;
  } catch (e: any) {
    showInfo(e?.desc || '查询失败');
    state.listData = [];
  } finally {
    state.pageStatus = state.listData.length >= state.total ? 'nomore' : 'loadmore';
    hideLoading();
    uni.stopPullDownRefresh();
  }
};

const loadmore = () => {
  if (state.pageStatus === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
};

const selectItem = (item: Record<string, any>) => {
  uni.navigateTo({
    url: item?.url,
  });
};

const searchParams = ref<ISearchParams>({});

const init = async () => {
  loading.value = true;
  showLoading();
  try {
    getCount();
  } catch (e: any) {
    showInfo(e?.desc || '查询失败');
  } finally {
    hideLoading();
    uni.stopPullDownRefresh();
    loading.value = false;
  }
};

const goToDetail = (item: any) => {
  const { detailUrl, idName = 'id' } = cardConfig[currentTab.value] || {};
  uni.navigateTo({ url: `${detailUrl}?id=${item[idName]}&type=${currentTab.value}` });
};

const getStoreData = async () => {
  try {
    const res: any = await getStoresBySpaceId();
    storeList.value = res;
    storeList.value.unshift({ id: '', name: '全部' });
  } catch (e: any) {
    storeList.value = [];
  }
};

const homeInit = () => {
  if (currentTab.value === RecordTypeEnum.HomeRecord) {
    init();
  } else {
    state.pageNum = 1;
    getPageList();
  }
};

onShow(() => {
  currentTab.value = tabStore.tabIndex;
  getStoreData();
  homeInit();
});
onBeforeMount(() => {
  homeInit();
});

/** 下拉刷新 */
onPullDownRefresh(() => {
  homeInit();
});

onReachBottom(() => {
  loadmore();
});

onBackPress(options => {
  console.log(options.from, 'optionsoptionsoptionsoptionsoptionsoptionsoptionsoptions');
  currentTab.value = RecordTypeEnum.HomeRecord;
  tabStore.$set(RecordTypeEnum.HomeRecord);
});
</script>
<template>
  <page :custom-overflow="isOpenSearch ? 'hidden' : 'visible'">
    <view class="approve-page">
      <u-tabs
        v-model="currentTab"
        :list="TabList"
        inactive-color="rgba(0, 0, 0, 0.65)"
        class="approve-tabs"
        @change="changeTab"
      ></u-tabs>
      <SearchPopup
        v-show="isOpenSearch"
        :is-open-search="isOpenSearch"
        :store-list="storeList"
        :current-tab="currentTab"
        @onClose="isOpenSearch = false"
        @onSearch="handleFilterSearch"
        @onReset="handleFilterSearch"
      >
      </SearchPopup>
      <view v-if="currentTab === RecordTypeEnum.HomeRecord" class="main-wrap">
        <view class="nav-wrap">
          <view class="nav-list">
            <view
              v-for="(item, index) in navList"
              :key="index"
              class="nav-item u-p-t-32 u-p-b-32"
              @click="selectItem(item)"
            >
              <view class="img-box">
                <u-image
                  :src="item.icon"
                  width="48"
                  height="48"
                  :show-loading="false"
                  :fade="false"
                ></u-image>
              </view>
              <view class="u-font-24 u-m-t-8">{{ item.label }}</view>
            </view>
          </view>
          <Statistics :source-data="statisticsData"></Statistics>
          <ChartsList
            title="耗材入库"
            :source-data="countMaterialPut"
            :store-list="storeList"
            @onSearch="materialPutSearch"
          ></ChartsList>
          <ChartsList
            title="耗材出库"
            :source-data="materialOutPut"
            :store-list="storeList"
            @onSearch="materialOutSearch"
          ></ChartsList>
          <ChartsList
            title="耗损出库"
            :source-data="materialLoseOutPut"
            :store-list="storeList"
            @onSearch="materialLoseOutSearch"
          ></ChartsList>
          <ChartsList
            title="耗材退库"
            :source-data="materialBackPut"
            :store-list="storeList"
            @onSearch="materialBackSearch"
          ></ChartsList>
        </view>
        <view v-if="loading" style="text-align: center; padding: 32rpx"
          ><u-loading :show="loading"></u-loading
        ></view>
        <view v-else class="ordinary-wrap">
          <template v-if="ordinaryList.length">
            <view
              v-for="item in ordinaryList"
              :key="item.id"
              class="ordinary-item"
              @click="goToDetail(item)"
            >
              <u-image
                width="96rpx"
                height="96rpx"
                border-radius="16rpx"
                :src="
                  item.assetInfoImgVOList?.[0] ? item.assetInfoImgVOList[0].fileUrl : defaultFile
                "
              ></u-image>
              <view class="ordinary-item-right">
                <view class="ordinary-item-right-item" style="margin-bottom: 8rpx">
                  <view class="ordinary-title">{{ item.assetName }}</view>
                  <view>
                    <u-tag
                      :text="item.assetStatusShow"
                      mode="light"
                      bg-color="rgba(230, 244, 255, 1)"
                      color="rgba(22, 119, 255, 1)"
                      border-color="transparent"
                  /></view>
                </view>
                <view class="ordinary-item-right-item">
                  <view class="ordinary-code">{{ item.assetNo }}</view>
                  <view class="time">
                    <view
                      ><u-icon
                        name="clock"
                        size="26"
                        color="#00000073"
                        style="margin-right: 16rpx"
                      ></u-icon
                    ></view>
                    <view>{{ formatDate(item.updateTime) }}</view>
                  </view>
                </view>
              </view>
            </view>
          </template>
        </view>
      </view>
      <DataList
        v-else
        :list-data="state.listData"
        :total="state.total"
        :page-status="state.pageStatus"
        :page-num="state.pageNum"
        :bottom-text="bottomBtn[currentTab]?.name"
        :bottom-url="bottomBtn[currentTab]?.url"
        :scroll-top="scrollTop"
        style="height: 100%"
        @filter="isOpenSearch = true"
      >
        <template
          v-if="currentTab === RecordTypeEnum.PurchaseRequestRecord && state.listData?.length"
        >
          <PurchaseList
            :list-data="state.listData"
            :list-type="1"
            @detail="goToDetail"
          ></PurchaseList>
        </template>
        <template
          v-if="currentTab === RecordTypeEnum.ProcurementListRecord && state.listData?.length"
        >
          <PurchaseList
            :list-data="state.listData"
            :list-type="2"
            @detail="goToDetail"
          ></PurchaseList>
        </template>
        <template v-if="isMaterialTab && state.listData?.length">
          <MaterialList
            :list-data="state.listData"
            :current-tab="currentTab"
            @detail="goToDetail"
          ></MaterialList>
        </template>
        <template
          v-if="currentTab === RecordTypeEnum.InventoryManagementRecord && state.listData?.length"
        >
          <Inventory :list="state.listData" />
        </template>
      </DataList>
    </view>
  </page>
</template>
<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.approve-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.approve-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}
.approve-empty {
  flex: 1;
}
.search-content {
  padding: 0rpx 32rpx 16rpx 32rpx;
  background-color: white;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  position: fixed;
  z-index: 2;
  width: 100%;
}
.main-wrap {
  padding: 24rpx 32rpx 24rpx 32rpx;
}
.head-list {
  // display: flex;
  background: #fff;
  // justify-content: space-between;
  padding: 24rpx 32rpx;
  // gap: 16px;
  align-self: stretch;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 32rpx;
}
.head-item {
  padding: 16rpx 0;
  height: 144rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  text-align: center;
  flex: 1;
}
.head-item-title {
  margin-bottom: 8rpx;
  color: rgba(0, 0, 0, 0.45);
  font-family: 'PingFang SC';
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}
.head-item-content {
  color: rgba(0, 0, 0, 0.88);
  font-family: 'PingFang SC';
  font-size: 28px;
  font-style: normal;
  font-weight: 500;
  line-height: 34px;
}
.u-grid-item {
  background: transparent;
}
.nav-list {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  .up-down {
    width: 100%;
    height: 56rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  text-align: center;
  height: 184rpx;
}
.img-box {
  margin-bottom: 16rpx;
  display: flex;
  width: 40px;
  height: 40px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 16rpx;
  background: #e6f4ff;
}
.ordinary-wrap {
  padding: 24rpx 0;
}
.ordinary-item {
  margin-bottom: 24rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
  .ordinary-item-right {
    flex: 1;
  }
}
.ordinary-item-right-item {
  margin-left: 32rpx;
  display: flex;
  gap: 24rpx;
  justify-content: space-between;
  .time {
    display: flex;
  }
}
.ordinary-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 32rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 44rpx;
}
.ordinary-code {
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 30rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
}
.time {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.45);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 30rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 40rpx;
}
</style>
