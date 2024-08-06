<script lang="ts" setup>
import {
  ScanTypeEnum,
  handleScan,
  scanInfoStore,
} from '@/app-general-affairs-logistics/assets-manage/utils/assets-scan';
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, reactive, ref, watch } from 'vue';
import { getInventoryAssets, getInventoryDetail } from '../../../services/inventory-detail';
import StatusTag from './status-tag.vue';
import { ApprovalStatus } from './types';

import { saveAssetInventory } from '@/app-general-affairs-logistics/assets-manage/services/operate-inventory';
import { getDetailByRole } from '@/app-general-affairs-logistics/services/assets-manage';
import { showInfo } from '@/utils/tools';
import ApprovePopup from './approve-popup.vue';

const footerItem = {
  color: '#1677ff',
};

const scanStore = scanInfoStore();

const state = reactive<any>({
  activeKey: 0,
  detail: {},
  list: [],
  pageNum: 1,
  total: 0,
  keyword: '',
  _keyword: '',
  status: 'loadmore',
  inventoryId: '',
  taskId: '',
  loadError: '',
  loadSuccess: false,
});

const approvePopupRef = ref();

/** 子任务处于进行中、已驳回状态下可进行扫码/手动盘点、提交审核、修改盘点信息，审核中和已完成仅可查看，不可操作。 */
const showFooter = computed(() =>
  [ApprovalStatus.REJECT, ApprovalStatus.IN_PROGRESS].includes(state.detail.taskStatus),
);

const tabsData = computed(() => {
  return [
    {
      name: `未盘(${state.detail.noInventoryNum || 0})`,
      value: 0,
      type: 'noInventory',
    },

    {
      name: `已盘(${state.detail.inventoryNum || 0})`,
      value: 1,
      type: 'inventory',
    },
    {
      name: `盘盈(${
        (state.detail.inventoryProfitExistNum || 0) + (state.detail.inventoryProfitAbsentNum || 0)
      })`,
      value: 2,
      type: 'inventoryProfit',
    },
  ];
});

const handleChangeTab = (index: number) => {
  state.activeKey = index;
};

const getDetail = async (options: any) => {
  if (!(options.assetInventoryId && options.taskId)) {
    return;
  }

  try {
    const res: any = await getInventoryDetail({
      inventoryId: options.assetInventoryId,
      taskId: options.taskId,
    });
    state.detail = res || {};
    state.loadSuccess = true;
    state.loadError = '';
  } catch (e: any) {
    state.loadSuccess = false;
    state.loadError = e?.desc || e?.msg || '数据加载异常';
  }
};

const getPageList = async () => {
  if (!(state.inventoryId && state.taskId)) {
    return;
  }
  try {
    state.status = 'loading';
    const response: any = await getInventoryAssets(
      {
        pageNum: state.pageNum,
        pageSize: 20,
        keyword: state.keyword,
        inventoryId: state.inventoryId,
        taskId: state.taskId,
      },
      tabsData.value[state.activeKey].type,
    );

    if (state.pageNum === 1) {
      state.list = response.records || [];
    } else {
      state.list = state.list.concat(response.records || []);
    }
    state.total = response.total || 0;
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error?.desc || error?.msg || '请求数据出错',
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

const onSearchInput = (value: string) => {
  state.keyword = value || '';
  state.pageNum = 1;
  getPageList();
};

const onApprovalRecord = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/components/approve-flow-draw/record?id=${state.taskId}`,
  });
};

const onAssetDetail = (item: any) => {
  if (!item?.assetId) {
    showInfo('请在web端查看上报的资产信息');
    return;
  }
  const taskId = showFooter.value && state.taskId ? state.taskId : '';
  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/detail/index?taskId=${taskId}&id=${
      item?.assetId || ''
    }&subId=${item?.id || ''}&graph=${item?.photograph}&manual=${item?.manual}&type=${
      state.activeKey
    }`,
  });
};

/** 提交审核 */
const handleApprove = () => {
  approvePopupRef.value?.handleShowPopup({
    inventoryTaskId: state.taskId,
    noInventoryNum: state.detail?.noInventoryNum,
    inventoryBys: state.detail?.inventoryBys,
  });
};

/** 扫码盘点 */
const handleScanData = async (bizId: string) => {
  const data: any = await getDetailByRole(bizId);
  if (!data?.assetId) {
    showInfo('所选择的资产不属于当前组织');
    state.activeKey = 0;
    return;
  }
  const params = {
    assetId: data?.assetId,
    inventoryType: 1, //1:移动端，2-web端
    inventoryMode: 2, // 1:手动，2：扫码
    inventoryTaskId: state.taskId,
  };
  try {
    await saveAssetInventory(params);
    showInfo('盘点成功');
    handleShow();
  } catch (e: any) {
    showInfo(e?.msg || '盘点失败');
  }
};

watch(
  () => scanStore.scanInventoryRes,
  val => {
    if (!val?.bizId) return;
    handleScanData(val?.bizId);
  },
);

const getFirstPage = () => {
  state._keyword = '';
  state.keyword = '';
  state.pageNum = 1;
  getPageList();
  getDetail({ assetInventoryId: state.inventoryId, taskId: state.taskId });
};

watch(
  () => state.activeKey,
  () => {
    getFirstPage();
  },
);

onLoad((options: any) => {
  state.inventoryId = options.assetInventoryId;
  state.taskId = options.taskId;
});

const handleShow = () => {
  /** 返回时刷新 */
  getDetail({ assetInventoryId: state.inventoryId, taskId: state.taskId });
  state.pageNum = 1;
  getPageList();
};

onShow(() => {
  handleShow();
});

// 上拉加载
onReachBottom(() => {
  loadMore();
});

// 下拉刷新
onPullDownRefresh(() => {
  getDetail({ assetInventoryId: state.inventoryId, taskId: state.taskId });
  getFirstPage();
});
</script>

<template>
  <page custom-overflow="visible">
    <view v-if="state.loadError" class="inventory-detail-empty"
      ><u-empty-custom :text="state.loadError" mode="data" :margin-top="136"
    /></view>
    <view v-else-if="state.loadSuccess" class="inventory-detail">
      <view class="inventory-detail-card" style="margin-top: 24rpx">
        <view class="inventory-detail-card-desc">
          <view class="inventory-detail-item">
            <view class="inventory-detail-value body-medium" style="margin-right: 24rpx">
              {{ state.detail.taskName || '' }}
            </view>
            <status-tag
              v-if="state.detail.taskStatusDesc"
              :status="state.detail.taskStatus"
              :label="state.detail.taskStatusDesc"
            ></status-tag>
          </view>
          <view class="inventory-detail-item">
            <view class="inventory-detail-label subheadline-regular"> 创建时间 </view>
            <view class="inventory-detail-value subheadline-regular">
              {{
                state.detail.createTime
                  ? dayjs(state.detail.createTime).format('YYYY-MM-DD HH:mm')
                  : '/'
              }}
            </view>
          </view>
          <view
            v-if="state.detail.taskStatus === ApprovalStatus.FINISH"
            class="inventory-detail-item"
          >
            <view class="inventory-detail-label subheadline-regular"> 完成时间 </view>
            <view class="inventory-detail-value subheadline-regular">
              {{
                state.detail.updateTime
                  ? dayjs(state.detail.updateTime).format('YYYY-MM-DD HH:mm')
                  : '/'
              }}
            </view>
          </view>
          <view
            v-if="state.detail.taskStatus === ApprovalStatus.REJECT"
            class="inventory-detail-item"
          >
            <view class="inventory-detail-label subheadline-regular"> 驳回时间 </view>
            <view class="inventory-detail-value subheadline-regular">
              {{
                state.detail.updateTime
                  ? dayjs(state.detail.updateTime).format('YYYY-MM-DD HH:mm')
                  : '/'
              }}
            </view>
          </view>
          <view
            v-if="state.detail.taskStatus === ApprovalStatus.CANCEL"
            class="inventory-detail-item"
          >
            <view class="inventory-detail-label subheadline-regular"> 取消时间 </view>
            <view class="inventory-detail-value subheadline-regular">
              {{
                state.detail.updateTime
                  ? dayjs(state.detail.updateTime).format('YYYY-MM-DD HH:mm')
                  : '/'
              }}
            </view>
          </view>
          <view class="inventory-detail-item">
            <view class="inventory-detail-label subheadline-regular"> 盘点总数 </view>
            <view class="inventory-detail-value subheadline-regular">
              {{ state.detail.taskItemNum || 0 }}
            </view>
          </view>
        </view>
        <view class="inventory-detail-approval subheadline-regular" @click="onApprovalRecord">
          查看审批记录
        </view>
      </view>
      <view class="inventory-detail-main">
        <view class="inventory-detail-card">
          <u-sticky>
            <view class="inventory-detail-card-tabs">
              <u-tabs
                v-model="state.activeKey"
                :list="tabsData"
                :is-scroll="false"
                @change="handleChangeTab"
              >
              </u-tabs>
            </view>
          </u-sticky>

          <view class="inventory-detail-searchbar">
            <u-search
              v-model="state._keyword"
              placeholder="请输入资产名称或编号"
              shape="square"
              :show-action="false"
              style="flex: 1"
              @search="onSearchInput"
            ></u-search>
          </view>
          <view v-if="state.list.length" class="inventory-detail-assets">
            <view
              v-for="item in state.list"
              :key="item.id"
              class="inventory-detail-asset"
              @click="onAssetDetail(item)"
            >
              <view class="inventory-detail-asset-header u-flex u-col-top">
                <image
                  v-if="item.imageList?.[0]"
                  :src="item.imageList?.[0]"
                  class="header-img"
                  mode="aspectFit"
                ></image>
                <view v-else class="header-img icon-default">
                  <u-icon name="photo" color="#999" size="38"></u-icon>
                </view>
                <view class="u-flex-1 u-flex name-no">
                  <view class="u-margin-bottom-8 body-medium name">
                    {{ item.assetName || '/' }}
                  </view>
                  <view v-if="item.assetNo" class="u-flex footnote-regular no">
                    {{ item.assetNo }}
                  </view>
                </view>
              </view>
              <view class="inventory-detail-item">
                <view class="inventory-detail-label subheadline-regular"> 所在空间 </view>
                <view class="inventory-detail-value subheadline-regular">
                  {{ item.spaceName || '/' }}
                </view>
              </view>
              <view class="inventory-detail-item">
                <view class="inventory-detail-label subheadline-regular"> 存放位置 </view>
                <view class="inventory-detail-value subheadline-regular">
                  {{ item.place || '/' }}
                </view>
              </view>
            </view>
            <!-- <u-loadmore
            :status="state.status"
            margin-top="48"
            margin-bottom="48"
            @loadmore="loadMore"
          /> -->
          </view>
          <view v-else-if="!state.loading" style="padding: 48rpx 0">
            <u-empty-custom text="暂无数据"></u-empty-custom>
          </view>
        </view>
      </view>
      <view style="height: 24rpx"></view>
      <view v-if="showFooter" class="inventory-detail-toolbar">
        <view class="inventory-detail-toolbar-main">
          <u-button
            style="flex: 1"
            :custom-style="footerItem"
            @click="handleScan(ScanTypeEnum.ScanInventory)"
            >扫码盘点</u-button
          >
          <u-button type="primary" style="flex: 1" @click="handleApprove">提交审核</u-button>
        </view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
      <view v-else class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
  </page>
  <ApprovePopup ref="approvePopupRef" @onClose="handleShow" />
</template>

<style lang="scss" scoped>
.inventory-detail {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  &-main {
    flex: 1;
  }
  &-searchbar {
    padding: 8rpx 32rpx 16rpx;
  }
  &-item {
    padding-top: 24rpx;
    display: flex;
    align-items: first baseline;
  }
  &-label {
    margin-right: 24rpx;
    color: #000000a6;
  }
  &-value {
    flex: 1;
    word-break: break-word;
  }
  &-card {
    margin: 0 32rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;
    &-desc {
      padding: 0 32rpx;
    }
    :deep(.u-tabs) {
      border-radius: 16rpx 16rpx 0 0;
      overflow: hidden;
      padding-top: 8rpx;
      padding-bottom: 8rpx;
    }
    :deep(.u-sticky-wrap) {
      background-color: $ui-color-page-primary !important;
    }
    &-tabs {
      background-color: $ui-color-page-primary;
      padding-top: 24rpx;
    }
  }
  &-toolbar {
    position: sticky;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
    background-color: #fff;
    padding: 24rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0px -2px 4px 0px #00000014;
    &-main {
      display: flex;
      align-items: center;
      width: 100%;
    }
    :deep(.u-btn) {
      flex: 1;
      margin: 0 12rpx;
    }
  }
  &-assets {
    padding: 12rpx 32rpx 0;
  }
  &-asset {
    padding: 24rpx 36rpx;
    margin-bottom: 24rpx;
    border-radius: 16rpx;
    border: 1px solid #00000026;
    .inventory-detail-item {
      padding-top: 16rpx;
    }
    .inventory-detail-value {
      width: 100%;
      @include ellipsis;
    }
    &-header {
      align-items: center;
      padding-bottom: 8rpx;
      .header-img {
        height: 88rpx;
        width: 88rpx;
        margin-right: 32rpx;
        border-radius: 4rpx;
        overflow: hidden;
        &.icon-default {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f2f2f2;
        }
      }
      .name {
        width: 100%;
        @include ellipsis;
      }
      .name-no {
        overflow: hidden;
        flex-direction: column;
        align-items: flex-start;
      }
      .no {
        color: #00000073;
      }
    }
  }
  &-approval {
    margin-top: 24rpx;
    padding: 20rpx 0;
    border-top: 1px solid #0000000f;
    text-align: center;
    color: $color-primary;
  }
}
</style>
