<template>
  <page :empty="!isFetching && !list?.length">
    <view class="top-panel">
      <view class="searchbar">
        <u-search
          v-model="searchKey"
          placeholder="搜索"
          shape="square"
          height="72"
          :show-action="false"
        ></u-search>
      </view>
      <view v-if="!showSearchContent" class="breadcrumbs">
        <scroll-view v-if="currentPath.length" scroll-x style="width: 100%; white-space: nowrap">
          <view class="breadcrumbs__item subheadline-regular">
            <view
              class="breadcrumbs__item breadcrumbs__item__clickable"
              @click="handleBreadcrumbsClick(-1)"
              >全国</view
            >
          </view>
          <view
            v-for="(item, index) in currentPath"
            :key="item.postalCode"
            class="breadcrumbs__item subheadline-regular"
          >
            <text style="padding: 0 4px">/</text>
            <text v-if="index === currentPath.length - 1">{{ item.areaName }}</text>
            <view
              v-else
              class="breadcrumbs__item breadcrumbs__item__clickable"
              @click="handleBreadcrumbsClick(index)"
              >{{ item.areaName }}</view
            >
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="content body-regular">
      <scroll-view scroll-y style="height: 100%">
        <view style="height: 24rpx"></view>
        <!-- 非搜索列表 -->
        <template v-if="!showSearchContent">
          <view>
            <u-cell-group :border="false">
              <cell-item
                v-for="item in list"
                :key="item.postalCode"
                :node="item"
                :is-show-dill="!isLeaf"
                @click="clickHandle($event, isLeaf)"
              ></cell-item>
            </u-cell-group>
          </view>
        </template>
        <!-- 搜索列表 -->
        <template v-else>
          <view v-if="searchContent.length === 0">
            <empty mode="search"></empty>
          </view>
          <template v-else>
            <view style="margin-top: 24rpx">
              <u-cell-group :border="false">
                <cell-item
                  v-for="item in searchContent"
                  :key="item.postalCode"
                  :node="item"
                  :is-show-dill="false"
                  show-full-name
                  @click="clickHandle($event, true)"
                >
                  <template #right-icon> <view /></template>
                </cell-item>
              </u-cell-group>
            </view>
          </template>
        </template>
        <view style="height: 24rpx"></view>
      </scroll-view>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom" style="background-color: #fff"></view>
  </page>
</template>
<script setup lang="ts">
import empty from '@/components/u-empty-custom/u-empty-custom.vue';
import { compact, includes, last, trim } from 'lodash-es';
import { computed, getCurrentInstance, ref } from 'vue';
import CellItem from './Item.vue';
import { getAreasTree } from './services';
import { Area } from './types';

const instance: any = getCurrentInstance()?.proxy;
const eventChannel = instance?.getOpenerEventChannel();

const isFetching = ref(true);
const areasTree = ref<Area[]>([]);
const searchKey = ref('');
const currentPath = ref<Area[]>([]);
const value = ref<string>();
const keyword = computed(() => {
  return searchKey.value.replace(/[\s/]/g, '');
});
const showSearchContent = computed(() => !!keyword.value);
const isLeaf = computed(() => currentPath.value.length >= 2);
const valuePath = computed(() => {
  return compact((value.value || '').split('/').map(trim));
});
const leafs = computed(() => {
  const result: Area[] = [];
  const traverse = (list: Area[]) => {
    list.forEach(item => {
      if (item.subAreas?.length) {
        traverse(item.subAreas);
      } else {
        result.push(item);
      }
    });
  };
  traverse(areasTree.value);
  return result;
});
const searchContent = computed(() => {
  if (!keyword.value) {
    return [];
  }
  return leafs.value
    .filter(item => {
      return includes(item.namePath.join(''), keyword.value);
    })
    .slice(0, 200);
});

const list = computed<Area[]>(() => {
  const current = last(currentPath.value);
  return current ? current.subAreas : areasTree.value;
});

const clickHandle = (node: Area, isClickLeaf: boolean) => {
  if (isClickLeaf) {
    if (eventChannel) {
      eventChannel.emit('acceptDataFromSelectorComponentPage', node);
    }
    uni.navigateBack();
  } else {
    currentPath.value = [...currentPath.value, node];
  }
};

const handleBreadcrumbsClick = (index: number = 0) => {
  currentPath.value = currentPath.value.slice(0, index + 1);
};

const init = () => {
  const res = getAreasTree();
  areasTree.value = res;
  isFetching.value = false;
};

init();
</script>

<style lang="scss">
.page {
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss" scoped>
$page-gap: 32rpx;
$section-gap: 24rpx;

.top-panel {
  // z-index: 1;
  padding: 16rpx 0;
  background-color: #fff;
  box-shadow: $shadow-light-down-md;
}
.searchbar {
  padding: 0 $page-gap;
}
.breadcrumbs {
  padding: 16rpx $page-gap 0;
  &__item {
    display: inline-block;

    &__clickable {
      color: $color-primary;
    }
  }
}
.content {
  flex: 1;
  overflow: hidden;
}
.toolbar {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx $page-gap;
  background-color: #fff;
  box-shadow: $shadow-light-up-md;
}
.popup-content {
  background-color: $uni-bg-color;
}
</style>
