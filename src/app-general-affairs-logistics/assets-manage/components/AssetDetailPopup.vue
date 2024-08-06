<script setup lang="ts">
import { request } from '@/utils/request';
import { computed, reactive, watch } from 'vue';
import { Asset } from '../types/asset';
import AssetsInfo from './detail/assets-info/index.vue';
import BaseInfo from './detail/base-info/index.vue';
import FileList from './detail/file-list/index.vue';

const props = defineProps<{
  listIds: string[];
}>();

const state = reactive<{
  open: boolean;
  loading: boolean;
  currentTab: number;
  index: number;
  node: Asset;
}>({
  open: false,
  loading: false,
  currentTab: 0,
  index: 0,
  node: {} as Asset,
});

const dataSource = reactive<Record<string, Asset>>({});

const open = (_index: number) => {
  if (state.index !== _index) {
    state.node = {} as Asset;
  }
  state.currentTab = 0;
  state.open = true;
  state.index = _index;
};

const id = computed(() => {
  if (!state.open) {
    return null;
  }
  return props.listIds[state.index];
});

const getDetail = async (_id: string) => {
  if (!_id) {
    return;
  }
  try {
    state.loading = true;
    const response: any = await request(`/AssetInfo/detail/${_id}`, {}, 'GET', {
      spaceType: request.service.school,
      overdueShowLoadingTime: 0,
      defaultError: false,
    });
    const _node = response || {};
    dataSource[_id] = _node;
    state.node = _node;
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
  }
};

const nodeDetail = computed(() => {
  const _node = state.node as any;
  return {
    /** 详情id */
    assetId: _node.id,
    /** 资产图片列表 */
    assetInfoImgVOList: _node.assetInfoImgVOList || [],
    /** 附件信息 */
    assetMeansList: _node.assetMeansList || [],
    /** 资产信息-基础信息 */
    baseInfoMap: _node,
    /** 资产信息- 资产参数*/
    assetParamMap: _node,
    /** 资产信息-其他 */
    otherParamMap: _node,
    /** 是否为资产管理员 1-是，0-否 */
    isAdmin: 0,
  };
});

const nextDisabled = computed(() => state.index + 1 === props.listIds.length);

const onNext = () => {
  if (nextDisabled.value) {
    return;
  }
  if (state.loading) {
    return;
  }
  state.index = state.index + 1;
};

const onPrev = () => {
  if (!state.index) {
    return;
  }
  if (state.loading) {
    return;
  }
  state.index = state.index - 1;
};

watch(id, newVal => {
  if (!newVal) {
    return;
  }
  if (dataSource[newVal]) {
    state.node = dataSource[newVal];
  } else {
    getDetail(newVal);
  }
});

defineExpose({
  open,
});
</script>

<template>
  <u-popup
    v-model="state.open"
    mode="bottom"
    height="90%"
    closeable
    safe-area-inset-bottom
    border-radius="8"
  >
    <view v-if="state.node.id" class="asset-detail">
      <AssetsInfo :detail-info="nodeDetail" no-preview />
      <u-tabs
        v-model="state.currentTab"
        :list="[
          {
            name: '基础信息',
          },
          {
            name: '附件',
          },
        ]"
        :is-scroll="false"
      ></u-tabs>
      <scroll-view scroll-y class="asset-detail-scroll-view">
        <BaseInfo v-if="state.currentTab === 0" :detail-info="nodeDetail" />
        <FileList v-else :detail-info="nodeDetail" />
      </scroll-view>
      <view class="asset-detail-operate">
        <view
          class="asset-detail-operate-btn"
          :style="{ opacity: state.index ? 1 : 0.5 }"
          @click="onPrev"
        >
          <u-icon name="arrow-left" color="#1677FF" size="32"></u-icon>
          <text class="btn-text">上一个</text>
        </view>
        <view
          class="asset-detail-operate-btn"
          :style="{ opacity: nextDisabled ? 0.5 : 1 }"
          @click="onNext"
        >
          <text class="btn-text">下一个</text>
          <u-icon name="arrow-right" color="#1677FF" size="32"></u-icon>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<style lang="scss" scoped>
.asset-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 68rpx;
  overflow: hidden;
  :deep(.assets-card) {
    margin: 0 !important;
  }
}

.asset-detail-scroll-view {
  flex: 1;
  overflow: hidden;
  height: 100%;
  padding: 0 32rpx;
}

.asset-detail-operate {
  display: flex;
  justify-content: space-between;
  padding: 12rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.0784313725);
  &-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    line-height: 44rpx;
    padding: 16rpx;
    .btn-text {
      color: #1677ff;
      margin: 0 8rpx;
    }
  }
}
</style>
