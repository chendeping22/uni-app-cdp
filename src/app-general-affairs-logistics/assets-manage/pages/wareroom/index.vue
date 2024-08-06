<script setup lang="ts">
import {
  fetchLibraryList,
  getAssetStatus,
} from '@/app-general-affairs-logistics/services/assets-manage';
import iconCloseSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_close_search.svg';
import iconOpenSearch from '@/app-general-affairs-logistics/static/assets-manage/icon_open_search.svg';
import printIcon from '@/app-general-affairs-logistics/static/assets-manage/print.svg';
import { loginStore } from '@/store/modules/login';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { computed, reactive, ref } from 'vue';
import { Asset } from '../../types/asset';
import AssetItem from './AssetItem.vue';

const userInfoStore = loginStore();

interface State {
  list: Asset[];
  total: number;
  pageNum: number;
  keyword: string;
  status: string;
  assetStatuses: string[];
  isOwner: boolean;
}

const state = reactive<State>({
  list: [],
  pageNum: 1,
  total: 0,
  keyword: '',
  status: 'loadmore',
  assetStatuses: [],
  isOwner: false,
});

const isOpenSearch = ref<boolean>(false);
const formState = reactive<Pick<State, 'assetStatuses' | 'keyword' | 'isOwner'>>({
  keyword: '',
  assetStatuses: [],
  isOwner: false,
});
const statusList = ref<{ label: string; value: string }[]>([]);

const empty = computed(() => {
  return state.status !== 'loading' && state.pageNum === 1 && state.list.length === 0;
});

const isSearch = computed(() => {
  return !!(state.keyword || state.assetStatuses.length);
});

const getStatusList = async () => {
  try {
    const res: any = await getAssetStatus();
    const _res = (res || []).map((i: any) => ({ ...i, value: `${i.value}` }));
    statusList.value = [{ label: '全部', value: '' }, ..._res];
  } catch (e: any) {}
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

const loadMore = () => {
  if (state.status === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
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

const onSearchInput = (value?: string) => {
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

const onPrint = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/print/select-assets`,
  });
};

onLoad((option: any) => {
  getStatusList();
  if (option.keyword) {
    state.keyword = option.keyword;
    formState.keyword = option.keyword;
  }
  if (option.isOwner) {
    formState.isOwner = true;
    state.isOwner = true;
  }
  if (option.status) {
    state.assetStatuses = [option.status];
    formState.assetStatuses = [option.status];
  }

  state.pageNum = 1;
  getPageList();
});

// 上拉加载
onReachBottom(() => {
  loadMore();
});

onPullDownRefresh(() => {
  state.pageNum = 1;
  getPageList();
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
          @clear="onSearchInput"
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
          v-for="item in state.list"
          :key="item.id"
          :node="item"
          :user-id="userInfoStore.userInfo?.id"
        />
        <u-loadmore
          :status="state.status"
          margin-top="48"
          margin-bottom="48"
          @loadmore="loadMore"
        />
      </view>
      <view v-else class="asset-list-empty">
        <u-empty-custom
          v-if="empty"
          text="暂无数据"
          :mode="isSearch ? 'search' : 'data'"
        ></u-empty-custom>
      </view>
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
    <view class="print-fixed" @click="onPrint">
      <u-image
        :src="printIcon"
        width="32"
        height="32"
        :show-loading="false"
        :fade="false"
      ></u-image>
    </view>
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

.print-fixed {
  position: fixed;
  right: 64rpx;
  bottom: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: $colorPrimaryBase;
}
</style>
