<script setup lang="ts">
import { fetchList } from '@/app-general-affairs-logistics/services/assets-manage';
import { loginStore } from '@/store/modules/login';
import { showInfo } from '@/utils/tools';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { computed, reactive, ref, unref } from 'vue';
import AssetDetailPopup from '../../components/AssetDetailPopup.vue';
import AssetItem from '../../components/AssetItem.vue';
import { useAssetsSelector } from '../../store/useAssetsSelector';
import { Asset } from '../../types/asset';

const pages = getCurrentPages();
const p = pages[pages.length - 1] as any;
const eventChannel = p.getOpenerEventChannel();

const store = useAssetsSelector();

const userInfoStore = loginStore();

const state = reactive<{
  list: Asset[];
  total: number;
  pageNum: number;
  keyword: string;
  _keyword?: string;
  allSelected: boolean;
  status: string;
}>({
  list: [],
  pageNum: 1,
  total: 0,
  keyword: '',
  _keyword: undefined,
  allSelected: false,
  status: 'loadmore',
});

const popupRef = ref();

const empty = computed(() => {
  return state.status !== 'loading' && state.pageNum === 1 && state.list.length === 0;
});

const selectedLen = computed(() => Object.keys(store.selected).length);

const listIds = computed(() => state.list.map(i => i.id));

const getPageList = async () => {
  try {
    state.status = 'loading';
    const response: any = await fetchList({
      pageNum: state.pageNum,
      pageSize: 20,
      tenantId: userInfoStore.userInfo?.locationId,
      keyword: state.keyword,
      excludeAssetIds: unref(store.excludeIds),
      ...store.apiQuery,
    });
    // 数据发生变化 全选按钮撤回
    state.allSelected = false;

    if (state.pageNum === 1) {
      state.list = response.records || [];
    } else {
      state.list = state.list.concat(response.records || []);
    }
    state.total = response.total || 0;
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.status = state.list.length >= state.total ? 'nomore' : 'loadmore';
  }
};

const onClickItem = (item: Asset) => {
  const id = item.assetId || item.id;
  if (store.selected[id]) {
    const _data = store.selected;
    delete _data[id];
    state.allSelected = false;
    store.$setValue(_data);
  } else {
    store.$setValue({ ...store.selected, [id]: item });
  }
};

const handleConfirmClick = () => {
  if (eventChannel) {
    const selectedNum =
      (store.excludeIds?.length ?? 0) + (Object.keys(store.selected)?.length ?? 0);
    if (store.limitCount && selectedNum > store.limitCount) {
      showInfo(`已选资产超过${store.limitCount}条，请重选`);
      return;
    }
    eventChannel.emit('acceptDataFromAssetsSelectorPage', store.selected);
  }

  uni.navigateBack();
};

const onSearch = (value?: string) => {
  state.keyword = value || '';
  state.pageNum = 1;
  getPageList();
};

const onSelectAll = () => {
  let _data = store.selected;
  if (state.allSelected) {
    // 取消全选
    _data = {};
  } else {
    state.list.forEach(i => {
      _data[i.id] = i;
    });
  }

  state.allSelected = !state.allSelected;

  store.$setValue(_data);
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
  getPageList();
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
          placeholder="搜索资产编号、资产名称"
          shape="square"
          v-model="state._keyword"
          :show-action="false"
          @search="onSearch"
          @clear="onSearch"
        ></u-search>
      </view>
      <view class="searchbar-placeholder"></view>
      <view v-if="state.list.length" class="asset-list">
        <asset-item
          v-for="(item, index) in state.list"
          :key="item.id"
          :node="item"
          :selected="!!store.selected[item.id]"
          :disabled="store.disabledIds.includes(item.id)"
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
        <u-empty-custom
          v-if="empty"
          text="暂无数据"
          :mode="state.keyword ? 'search' : 'data'"
        ></u-empty-custom>
      </view>
      <view v-if="state.list.length || selectedLen" class="toolbar">
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
          <view class="toolbar-main"
            >已选择<text class="selected-count">{{ selectedLen || 0 }}</text
            >项</view
          >
          <u-button type="primary" @click="handleConfirmClick">确定</u-button>
        </view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
    </view>
    <asset-detail-popup ref="popupRef" :list-ids="listIds"></asset-detail-popup>
  </page>
</template>

<style lang="scss" scoped>
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
  &-placeholder {
    padding-top: 112rpx;
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
</style>
