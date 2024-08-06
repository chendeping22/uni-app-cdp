<script setup lang="ts">
import {
  getSelectorBaseItems,
  getSelectorPurchaseItems,
  getSelectorWarehouseItems,
} from '@/app-general-affairs-logistics/services/consumable-selector';
import { showInfo } from '@/utils/tools';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { debounce, isNil } from 'lodash-es';
import { computed, reactive, watch } from 'vue';
import MaterialItemContent from '../../components/MaterialItemContent.vue';
import MaterialItemTitle from '../../components/MaterialItemTitle.vue';
import { getStoresBySpaceId } from '../../services/common';
import { useMaterialSelector } from '../../store/useMaterialSelector';
import { Material, SelectorTypeEnum } from '../../types/material';
import Checkbox from './Checkbox.vue';
import * as contentSchema from './schema';

const pages = getCurrentPages();
const p = pages[pages.length - 1] as any;
const eventChannel = p.getOpenerEventChannel();

const store = useMaterialSelector();

const state = reactive<{
  list: Material[];
  total: number;
  pageNum: number;
  keyword: string;
  storeId: string;
  storeName: string;
  allSelected: boolean;
  status: string;
  showStore: boolean;
  focus: boolean;
  storeList: any[];
}>({
  list: [],
  pageNum: 1,
  total: 0,
  keyword: '',
  focus: false,
  storeId: '',
  storeName: '全部仓库',
  allSelected: false,
  status: 'loadmore',
  showStore: false,
  storeList: [],
});

const excludeKeys = ['name', 'no'];

const schema = computed(() => {
  let _schema;
  switch (store.type) {
    case SelectorTypeEnum.purchase:
      _schema = contentSchema.purchase;
      break;
    case SelectorTypeEnum.warehouse:
      _schema = contentSchema.warehouse;
      break;
    default:
      _schema = contentSchema.base;
      break;
  }
  return _schema.filter(i => !excludeKeys.includes(i.key));
});

const placeholder = computed(() => {
  switch (store.type) {
    case SelectorTypeEnum.purchase:
      return '请输入采购单号/耗材名称搜索';
    case SelectorTypeEnum.warehouse:
      return '请输入耗材名称搜索';
    default:
      return '请输入耗材名称/耗材编号搜索';
  }
});

const empty = computed(() => {
  return (
    (state.status !== 'loading' || state.keyword) && state.pageNum === 1 && state.list.length === 0
  );
});

const isSearch = computed(() => {
  return !!(state.keyword || state.storeId);
});

const selectedLen = computed(() => Object.keys(store.selected).length);

const _api = computed(() => {
  switch (store.type) {
    case SelectorTypeEnum.purchase:
      return getSelectorPurchaseItems;
    case SelectorTypeEnum.warehouse:
      return getSelectorWarehouseItems;
    default:
      return getSelectorBaseItems;
  }
});

const idKey = computed(() => (store.type === SelectorTypeEnum.base ? 'baseId' : 'id'));

const getPageList = async () => {
  try {
    state.status = 'loading';
    const _searchValues = `${state.keyword}${state.storeId}`;
    const response: any = await _api.value({
      pageNum: state.pageNum,
      pageSize: 20,
      searchValues: state.keyword,
      storeId: state.storeId,
      ...store.apiQuery,
    } as any);
    if (_searchValues === `${state.keyword}${state.storeId}`) {
      // 数据发生变化 全选按钮撤回
      state.allSelected = false;

      if (state.pageNum === 1) {
        state.list = response.result || [];
      } else {
        state.list = state.list.concat(response.result || []);
      }
      state.total = response.total || 0;
    }
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

const onClickItem = (item: Material) => {
  const id = item[idKey.value] || item.id;
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
      showInfo(`已选耗材超过${store.limitCount}项，请重选`);
      return;
    }
    eventChannel.emit('acceptDataFromMaterialSelectorPage', store.selected);
  }

  uni.navigateBack();
};

const debounceSearch = debounce(() => {
  state.pageNum = 1;
  getPageList();
}, 500);

const onClearSearch = () => {
  state.focus = true;
};

const onBlurSearch = () => {
  state.focus = false;
};

const onSelectAll = () => {
  let _data = store.selected;
  if (state.allSelected) {
    // 取消全选
    _data = {};
  } else {
    state.list.forEach(i => {
      _data[i[idKey.value] || i.id] = i;
    });
  }

  state.allSelected = !state.allSelected;

  store.$setValue(_data);
};

const loadMore = () => {
  if (state.status === 'loadmore') {
    state.pageNum = state.pageNum + 1;
    getPageList();
  }
};

const handleConfirmStore = (val: { value?: string; label?: string }[]) => {
  state.storeId = val?.[0]?.value || '';
  state.storeName = val?.[0]?.label || '';
  state.pageNum = 1;
  getPageList();
};

const getStoreData = async () => {
  try {
    const res: any = await getStoresBySpaceId();
    state.storeList = [{ name: '全部仓库', id: '' }].concat(res || []);
  } catch (e: any) {
    state.storeList = [];
  }
};

watch(
  () => state.keyword,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      debounceSearch();
    }
  },
);

onLoad(() => {
  if (store.type === SelectorTypeEnum.warehouse) {
    getStoreData();
  }
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
        <view class="searchbar-container">
          <view
            v-if="store.type === SelectorTypeEnum.warehouse"
            class="searchbar-store"
            @click="state.showStore = true"
          >
            <view class="body-regular searchbar-store-text">{{ state.storeName }}</view>
            <u-icon name="arrow-down" size="24" color="rgba(0, 0, 0, 0.45)"></u-icon
          ></view>
          <u-search
            v-model="state.keyword"
            :placeholder="placeholder"
            shape="square"
            :show-action="false"
            :focus="state.focus"
            :input-style="{ fontSize: '32rpx' }"
            :height="72"
            style="flex: 1"
            @clear="onClearSearch"
            @blur="onBlurSearch"
          ></u-search>
        </view>
      </view>
      <view class="searchbar-placeholder"></view>

      <view v-if="state.list.length" class="material-list">
        <u-collapse
          event-type="close"
          :arrow="true"
          :accordion="true"
          :item-style="{
            borderBottom: '1px solid #0000000f',
            width: '100%',
          }"
          :head-style="{
            opacity: '1 !important',
          }"
        >
          <u-collapse-item v-for="(item, index) in state.list" :key="item.id" :index="index">
            <template #title>
              <MaterialItemTitle :data="item" style="width: 100%; overflow: hidden">
                <template #left>
                  <Checkbox
                    :selected="!!store.selected[item[idKey] || item.id]"
                    :disabled="store.disabledIds.includes(item[idKey] || item.id)"
                    @click="onClickItem(item)"
                  />
                </template>

                <template #right>
                  <text class="body-regular left-tips" v-if="!isNil(item.leftNum)"
                    >余{{ item.leftNum }}{{ item.unit }}</text
                  >
                </template>
              </MaterialItemTitle>
            </template>
            <MaterialItemContent :data="item" :schema="schema" />
          </u-collapse-item>
        </u-collapse>
      </view>
      <view v-else class="material-list-empty">
        <u-empty-custom
          v-if="empty"
          text="暂无数据"
          :mode="isSearch ? 'search' : 'data'"
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
    <u-select
      v-model="state.showStore"
      :list="state.storeList"
      label-name="name"
      value-name="id"
      @cancel="state.showStore = false"
      @confirm="handleConfirmStore"
    ></u-select>
  </page>
</template>

<style lang="scss" scoped>
:deep(.page) {
  background-color: #fff;
}
.selector-page {
  display: flex;
  height: 100%;
  background-color: #fff;
  flex-direction: column;
}
.left-tips {
  color: $color-primary;
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
  &-container {
    display: flex;
    background-color: rgb(242, 242, 242);
    border-radius: 0.3125rem;
  }
  &-store {
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    overflow: hidden;
  }
  &-store-text {
    width: 190rpx;
    font-size: 32rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.material-list {
  padding: 0 32rpx 24rpx;
  flex: 1;
  background-color: #fff;
  &-empty {
    flex: 1;
  }
}

.material-item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin-right: 32rpx;
  border: 1px solid #c8c9cc;
  border-radius: 50%;
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
