<script setup lang="ts">
import {
  fetchLibraryList,
  getAssetStatus,
} from '@/app-general-affairs-logistics/services/assets-manage';
import iconCloseSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_close_search.svg';
import iconOpenSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_open_search.svg';
import { loginStore } from '@/store/modules/login';
import { showInfo } from '@/utils/tools';
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';
import AssetDetailPopup from '../../components/AssetDetailPopup.vue';
import AssetItem from '../../components/AssetItem.vue';
import { usePrintAssets } from '../../store/usePrintAssets';
import { Asset } from '../../types/asset';

const userInfoStore = loginStore();
const printAssetsStore = usePrintAssets();

interface State {
  list: Asset[];
  selected: Record<string, Asset>;
  total: number;
  pageNum: number;
  keyword: string;
  allSelected: boolean;
  status: string;
  assetStatuses: string[];
  isOwner: boolean;
}

const state = reactive<State>({
  list: [],
  pageNum: 1,
  total: 0,
  keyword: '',
  selected: {},
  allSelected: false,
  status: 'loadmore',
  assetStatuses: [],
  isOwner: false,
});

const formState = reactive<Pick<State, 'assetStatuses' | 'keyword' | 'isOwner'>>({
  keyword: '',
  assetStatuses: [],
  isOwner: false,
});

const statusList = ref<{ label: string; value: string }[]>([]);
const popupRef = ref();
const isOpenSearch = ref<boolean>(false);

const empty = computed(() => {
  return state.status !== 'loading' && state.pageNum === 1 && state.list.length === 0;
});

const selectedList = computed(() => Object.values(state.selected));

const listIds = computed(() => state.list.map(i => i.id));

const getStatusList = async () => {
  try {
    const res: any = await getAssetStatus();
    const _res = (res || []).map((i: any) => ({ ...i, value: `${i.value}` }));
    statusList.value = [{ label: '全部', value: '' }, ..._res];
  } catch (e: any) {}
};

const handleChangeStatus = (status: string) => {
  if (!status) {
    formState.assetStatuses = [];
    return;
  }

  if (formState.assetStatuses.includes(status)) {
    formState.assetStatuses = formState.assetStatuses.filter(i => i !== status);
  } else {
    formState.assetStatuses = [...formState.assetStatuses, status];
  }
};

const getPageList = async () => {
  try {
    state.status = 'loading';
    const response: any = await fetchLibraryList({
      pageNum: state.pageNum,
      pageSize: 20,
      tenantId: userInfoStore.userInfo?.locationId,
      keyword: state.keyword,
      assetStatuses: state.assetStatuses,
      recipientIdList:
        state.isOwner && userInfoStore.userInfo?.id ? [userInfoStore.userInfo.id] : [],
    });

    if (state.pageNum === 1) {
      state.list = response.records || [];
    } else {
      state.list = state.list.concat(response.records || []);
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
    uni.stopPullDownRefresh();
  }
};

const onClickItem = (item: Asset) => {
  const id = item.assetId || item.id;
  if (state.selected[id]) {
    const _data = state.selected;
    delete _data[id];
    state.allSelected = false;
    state.selected = _data;
  } else {
    state.selected = { ...state.selected, [id]: item };
  }
};

const handleConfirmClick = () => {
  console.log('handleConfirmClick 打印', state.selected);
  if (selectedList.value.length) {
    printAssetsStore.$set(selectedList.value);
    uni.navigateTo({
      url: `/app-general-affairs-logistics/assets-manage/pages/print/index`,
    });
  } else {
    showInfo('请选择资产后打印');
  }
};

const handleReset = () => {
  // 清空表单数据
  formState.isOwner = false;
  formState.assetStatuses = [];
  formState.keyword = '';

  // 清空查询数据
  state.keyword = '';
  state.assetStatuses = [];
  state.isOwner = false;
  state.pageNum = 1;
  isOpenSearch.value = false;
  getPageList();
};

const onSearchInput = (value: string) => {
  state.keyword = value || '';
  state.pageNum = 1;
  isOpenSearch.value = false;
  getPageList();
};

const handleIconSearch = () => {
  isOpenSearch.value = !isOpenSearch.value;
};

const handleFilterSearch = () => {
  state.pageNum = 1;
  state.assetStatuses = formState.assetStatuses;
  state.keyword = formState.keyword;
  state.isOwner = formState.isOwner;
  isOpenSearch.value = false;
  getPageList();
};

const onSearch = (value: string) => {
  state.keyword = value || '';
  state.pageNum = 1;
  getPageList();
};

const onSelectAll = () => {
  let _data = state.selected;
  if (state.allSelected) {
    // 取消全选
    _data = {};
  } else {
    state.list.forEach(i => {
      _data[i.id] = i;
    });
  }

  state.allSelected = !state.allSelected;
  state.selected = _data;
};

const onMore = (_index: number) => {
  popupRef.value?.open(_index);
};

const loadMore = () => {
  if (state.status === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
};

onLoad(() => {
  state.pageNum = 1;
  getStatusList();
  getPageList();
});

onShow(() => {
  if (printAssetsStore.isResetSelectedPrint) {
    state.selected = {};
    state.allSelected = false;
  }
});

// 上拉加载
onReachBottom(() => {
  loadMore();
});
</script>

<template>
  <page custom-overflow="visible">
    <view class="selector-page">
      <view class="searchbar">
        <u-search
          v-model="formState.keyword"
          placeholder="搜索资产编号、资产名称"
          shape="square"
          :show-action="false"
          style="flex: 1"
          :height="72"
          @search="onSearchInput"
        ></u-search>
        <u-image
          :src="isOpenSearch ? iconOpenSearch : iconCloseSearch"
          width="80rpx"
          height="80rpx"
          :show-loading="false"
          :fade="false"
          :style="{ marginLeft: '32rpx' }"
          @click="handleIconSearch"
        ></u-image>
        <u-popup
          v-model="isOpenSearch"
          mode="top"
          :mask="true"
          class="search-popup"
          :border-radius="16"
          :mask-custom-style="{
            top: '240rpx',
          }"
        >
          <view class="search-popup-content">
            <view class="popup-title">筛选</view>
            <view class="popup-owner"
              ><u-checkbox v-model="formState.isOwner" name="isOwner" shape="circle"
                >只看我管理使用的资产</u-checkbox
              ></view
            >
            <view class="popup-list">
              <view
                v-for="item in statusList"
                :key="item.value"
                class="popup-item"
                :class="
                  formState.assetStatuses.includes(item.value) ||
                  (!formState.assetStatuses.length && !item.value)
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
      <view class="searchbar-placeholder"></view>
      <view v-if="state.list.length" class="asset-list">
        <asset-item
          v-for="(item, index) in state.list"
          :key="item.id"
          :node="item"
          :selected="!!state.selected[item.id]"
          @click="onClickItem"
          @more="onMore(index)"
        />
        <u-loadmore
          :status="state.status"
          margin-top="48"
          margin-bottom="48"
          @loadmore="loadMore"
        />
      </view>
      <view v-else class="asset-list-empty">
        <u-empty-custom v-if="empty" text="暂无数据"></u-empty-custom>
      </view>
      <view v-if="!empty" class="toolbar">
        <view class="toolbar-container">
          <view class="toolbar-checkbox-all" @click="onSelectAll">
            <view
              class="checkbox-icon"
              :style="{
                backgroundColor: state.allSelected ? '#176bfb' : '#fff',
              }"
            >
              <u-icon name="checkbox-mark" color="#fff" size="20"></u-icon>
            </view>
            全选
          </view>
          <view class="toolbar-main">
            已选择<text class="selected-count">{{ selectedList.length || 0 }}</text>
            项
          </view>
          <u-button type="primary" @click="handleConfirmClick">打印资产</u-button>
        </view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
      <view v-else class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
    <asset-detail-popup ref="popupRef" :list-ids="listIds"></asset-detail-popup>
  </page>
</template>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.selector-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.searchbar {
  position: fixed;
  // top: calc(44px + env(safe-area-inset-top));
  left: 0;
  width: 100%;
  z-index: 2;
  padding: 24rpx 32rpx;
  background-color: #fff;
  box-shadow: 0px 1px 2px 0px #0000000a;
  display: flex;
  align-items: center;
  &-placeholder {
    padding-top: 120rpx;
  }
}
.asset-list {
  padding-top: 0;
  flex: 1;
  &-empty {
    flex: 1;
  }
}
.toolbar {
  // position: fixed;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  background-color: #fff;
  padding: 24rpx 32rpx;
  // display: flex;
  // align-items: center;
  box-shadow: 0px -2px 4px 0px #00000014;
  &-container {
    width: 100%;
    display: flex;
    align-items: center;
  }
  &-checkbox-all {
    display: flex;
    align-items: center;
    margin-right: 16rpx;
  }
  .checkbox-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    border: 1px solid #c8c9cc;
    border-radius: 50%;
    margin-right: 32rpx;
  }
  &-main {
    flex: 1;
    text-align: right;
    margin-right: 16rpx;
  }
  .selected-count {
    display: inline-block;
    padding: 0 12rpx;
    margin: 0 8rpx;
    border-radius: 50%;
    font-size: 12px;
    background: #0000000f;
  }
}

.search-popup {
  top: 100rpx;
  :deep(.u-drawer) {
    top: 100rpx;
  }
  &-content {
    padding: 32rpx;
    padding-bottom: 0;
  }
  .popup-title {
    font-weight: 500;
    font-size: 32rpx;
    line-height: 44rpx;
    color: $textDefaultColor;
    margin-bottom: 24rpx;
  }
  .popup-owner {
    margin-bottom: 24rpx;
    color: $textSecondaryColor;
  }
  .popup-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: -12rpx;
    flex-wrap: wrap;
    padding-bottom: 32rpx;
  }
  .popup-item {
    font-size: 30rpx;
    height: 80rpx;
    display: flex;
    margin: 12rpx;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
  }
  .popup-bottom {
    display: flex;
    padding: 24rpx 32rpx;
    border-top: 1px solid #0000000f;
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
