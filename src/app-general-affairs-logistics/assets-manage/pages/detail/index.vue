<template>
  <page custom-overflow="visible">
    <view class="assets-detail-page">
      <view v-if="detailData" class="assets-detail">
        <AssetsInfo :detail-info="detailData" />
        <view class="detail-card">
          <u-sticky>
            <view class="detail-card-tabs">
              <u-tabs
                v-model="activeKey"
                :list="tabsData"
                :is-scroll="false"
                @change="handleChangeTab"
              >
              </u-tabs>
            </view>
          </u-sticky>
          <view class="assets-info">
            <view class="assets-info-inner">
              <BaseInfo v-if="tabType == AssetsTabEnum.AssetInfo" :detail-info="detailData" />
              <AssetsRecord v-if="showAssetsRecord" :record-data="recordData" />
              <FileList v-if="showFileList" :detail-info="detailData" />
            </view>
            <view v-if="showEmpty" style="padding: 48px 0 24px">
              <u-empty-custom text="暂无数据" mode="list" :src="icon_empty" :icon-size="144" />
            </view>
          </view>
        </view>
      </view>
      <view v-if="operateMap.show && !inventoryState.inventoryTaskId" class="toolbar">
        <view class="toolbar-main">
          <view class="toolbar-section">
            <u-button v-if="operateMap.borrow" style="flex: 1" @click="onClickOperate('borrow')"
              >借用</u-button
            >
            <u-button v-if="operateMap.repair" style="flex: 1" @click="onClickOperate('repair')"
              >报修</u-button
            >
          </view>
          <view class="toolbar-section">
            <u-button
              v-if="operateMap.back"
              type="primary"
              style="flex: 1"
              @click="onClickOperate('back')"
              >归还</u-button
            >
            <u-button
              v-if="operateMap.sendBack"
              type="primary"
              style="flex: 1"
              @click="onClickOperate('sendBack')"
              >退还</u-button
            >
            <u-button
              v-if="operateMap.receive"
              type="primary"
              style="flex: 1"
              @click="onClickOperate('receive')"
              >领用</u-button
            >
            <u-button type="primary" style="flex: 1" @click="onClickPrint">标签打印</u-button>
          </view>
        </view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
      <view v-else-if="inventoryState.inventoryTaskId" class="toolbar">
        <view class="toolbar-main">
          <u-button
            v-if="showScanBtn"
            style="flex: 1"
            :custom-style="footerItem"
            @click="handleScan(ScanTypeEnum.AssetsDetailInventory)"
            >扫码盘点</u-button
          >
          <u-button
            v-if="showOperateBtn"
            type="primary"
            style="flex: 1"
            @click="() => pictureInventoryRef?.handleShowPopup({ isEdit: false })"
            >手动盘点</u-button
          >
          <u-button
            v-if="showUpdateBtn"
            type="primary"
            style="flex: 1"
            @click="() => pictureInventoryRef?.handleShowPopup({ isEdit: true })"
            >修改盘点信息</u-button
          >
          <u-button
            v-if="!showScanBtn"
            :custom-style="footerItem"
            style="flex: 1"
            @click="() => (showCancelModal = true)"
            >取消盘点</u-button
          >
        </view>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
      <view v-else class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
  </page>
  <PictureInventory
    ref="pictureInventoryRef"
    :detail-data="{ assetId: pageParams?.id, ...inventoryState }"
    @onPictureClose="handlePictureClose"
  />
  <u-modal
    v-model="showCancelModal"
    title="确认取消盘点？"
    content="取消后需要再次盘点"
    show-cancel-button
    show-confirm-button
    @confirm="handleCancelInventory"
    @cancel="() => (showCancelModal = false)"
  ></u-modal>
</template>

<script setup lang="ts">
import {
  ScanTypeEnum,
  handleScan,
  scanInfoStore,
} from '@/app-general-affairs-logistics/assets-manage/utils/assets-scan';

import PictureInventory from '@/app-general-affairs-logistics/assets-manage/components/PictureInventory.vue';
import {
  getDetailByRole,
  getDetailOperationResume,
} from '@/app-general-affairs-logistics/services/assets-manage';
import { getPageParams, showInfo } from '@/utils/tools';
import { isNil } from 'lodash-es';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import AssetsInfo from '../../components/detail/assets-info/index.vue';
import AssetsRecord from '../../components/detail/assets-record/index.vue';
import BaseInfo from '../../components/detail/base-info/index.vue';
import { AssetsTabEnum, IDetailData, IRecordItem } from '../../components/detail/constants';
import FileList from '../../components/detail/file-list/index.vue';
import {
  cancelAssetInventory,
  deleteSubtasks,
  saveAssetInventory,
} from '../../services/operate-inventory';
import { useAdmin } from '../../store/useAdmin';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';
import { usePrintAssets } from '../../store/usePrintAssets';
import { AssetStatusEnum } from '../../types/asset';
import icon_empty from '/static/icon_empty.svg';

interface IInventoryState {
  /**盘点任务id */
  inventoryTaskId?: string;
  /** 盘点详情列表记录id */
  subTaskId?: string;
  /**是否严格拍照 1-是 0-否 */
  photograph?: string;
  /**允许手动盘点：1-是 0-否 */
  manual?: string;
  /** 盘点类型 */
  type?: string;
}

const printAssetsStore = usePrintAssets();
const scanStore = scanInfoStore();
const footerItem = {
  color: '#1677ff',
};

const activeKey = ref<number>(0);
const detailData = ref<IDetailData>(); // 资产详情
const tabType = ref<number>(AssetsTabEnum.AssetInfo);
const recordData = ref<IRecordItem[]>([]);
const assetDetailToCreateStore = useAssetDetailToCreate();
const pageParams = ref<any>();
const pictureInventoryRef = ref();

const showCancelModal = ref<boolean>(false);

const inventoryState = reactive<IInventoryState>({});
const isScan = ref<boolean>();

const isAdminStore = useAdmin();
// 是否为资产管理员
const isAdmin = computed(() => isAdminStore.isAdmin);

/** 是否展示履历列表 */
const showAssetsRecord = computed(
  () => !!(tabType.value == AssetsTabEnum.AssetRecord && isAdmin.value && recordData.value?.length),
);

/** 是否展示附件列表 */
const showFileList = computed(
  () => !!(tabType.value == AssetsTabEnum.FileInfo && detailData.value?.assetMeansList?.length),
);

const showEmpty = computed(() => {
  if (tabType.value == AssetsTabEnum.AssetRecord && isAdmin.value) {
    return !recordData.value?.length;
  }
  if (tabType.value == AssetsTabEnum.FileInfo) {
    return !detailData.value?.assetMeansList?.length;
  }
  return false;
});

/** 扫码盘点按钮 */
const showScanBtn = computed(() => inventoryState.type === '0');
/** 手动盘点按钮 */
const showOperateBtn = computed(() => inventoryState.type === '0' && inventoryState.manual === '1');
/** 取消盘点信息：已盘、盘盈在册 */
const showUpdateBtn = computed(() => inventoryState.type !== '0' && pageParams.value?.id);

const tabsData = computed(() => {
  return [
    {
      name: '资产信息',
      value: 1,
    },
    ...(isAdmin.value
      ? [
          {
            name: '资产履历',
            value: 2,
          },
        ]
      : []),

    {
      name: '附件信息',
      value: 3,
    },
  ];
});

const operateMap = computed(() => {
  const _operateMap = {
    /** 领用 */
    receive: false,
    /** 借用 */
    borrow: false,
    /** 维修 */
    repair: false,
    /** 归还 */
    back: false,
    /** 退还 */
    sendBack: false,
    /** 无操作 */
    show: false,
  };

  const status = detailData.value?.baseInfoMap?.assetStatus;
  if (status && isNil(status)) {
    return _operateMap;
  }

  switch (+status) {
    case AssetStatusEnum.IDLE:
      _operateMap.show = true;

      _operateMap.receive = true;
      _operateMap.borrow = true;
      // 闲置资产 普通用户不要报修
      if (isAdmin.value) {
        _operateMap.repair = true;
      }
      break;
    case AssetStatusEnum.BORROWED:
      _operateMap.show = true;

      _operateMap.repair = true;
      _operateMap.back = true;
      break;
    case AssetStatusEnum.IN_USE:
      _operateMap.show = true;

      _operateMap.repair = true;
      _operateMap.sendBack = true;
      break;

    default:
      break;
  }

  return _operateMap;
});

const handleChangeTab = (index: number) => {
  activeKey.value = index;
  tabType.value = tabsData.value[index].value;
};

const getRecordData = async () => {
  try {
    uni.showLoading();
    const detailId = pageParams.value?.id || '';
    const data: any = await getDetailOperationResume(detailId);
    recordData.value = data || {};
  } finally {
    uni.hideLoading();
  }
};

const getDetail = async () => {
  try {
    uni.showLoading();
    const detailId = pageParams.value?.id || '';
    const data: any = await getDetailByRole(detailId);
    detailData.value = data || {};
    if (data?.isAdmin || isAdmin.value) {
      getRecordData();
    }
    inventoryState.inventoryTaskId = pageParams.value?.taskId;
  } catch (e: any) {
    showInfo(e?.msg || '获取详情失败');
    detailData.value = {};
  } finally {
    uni.hideLoading();
  }
};

const onClickPrint = () => {
  if (detailData.value) {
    const { assetParamMap, baseInfoMap, otherParamMap, ...rest } = detailData.value;
    printAssetsStore.$set([
      {
        ...assetParamMap,
        ...baseInfoMap,
        ...otherParamMap,
        ...rest,
      } as any,
    ]);
    uni.navigateTo({
      url: `/app-general-affairs-logistics/assets-manage/pages/print/index`,
    });
  }
};

const onClickOperate = (type: string) => {
  assetDetailToCreateStore.$set({
    ...detailData.value?.baseInfoMap,
    assetId: detailData.value?.assetId,
    assetInfoImgVOList: detailData.value?.assetInfoImgVOList || [],
  });

  uni.navigateTo({
    url: `/app-general-affairs-logistics/assets-manage/pages/${type}/index?assetId=${detailData.value?.assetId}`,
  });
};

const handleDetailScanData = async (bizId: string) => {
  const data: any = await getDetailByRole(bizId);
  if (!data?.assetId) return;
  const params = {
    assetId: data?.assetId,
    inventoryType: 1, //1:移动端，2-web端
    inventoryMode: 2, // 1:手动，2：扫码
    inventoryTaskId: inventoryState.inventoryTaskId,
  };
  try {
    isScan.value = true;
    await saveAssetInventory(params);
    showInfo('盘点成功');
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  } catch (e: any) {
    showInfo(e?.msg || '盘点失败');
  } finally {
    isScan.value = false;
  }
};

/**取消盘点 */
const handleCancelInventory = async () => {
  const params = {
    assetId: detailData.value?.assetId,
    inventoryTaskId: inventoryState.inventoryTaskId,
  };
  try {
    inventoryState.type === '1'
      ? await cancelAssetInventory(params)
      : await deleteSubtasks(inventoryState.subTaskId || '');

    showInfo('取消盘点成功');
    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.msg || '取消盘点失败');
  }
};

const handlePictureClose = () => {
  uni.navigateBack();
};

watch(
  () => scanStore.assetsDetailInventoryRes,
  val => {
    if (!val?.bizId || isScan.value) return;
    handleDetailScanData(val?.bizId);
  },
);

onMounted(() => {
  pageParams.value = getPageParams();
  /** 盘点操作 */
  if (pageParams.value?.taskId) {
    inventoryState.subTaskId = pageParams.value?.subId;
    inventoryState.photograph = pageParams.value?.graph;
    inventoryState.manual = pageParams.value?.manual;
    inventoryState.type = pageParams.value?.type;
  }
  getDetail();
});
</script>

<style lang="scss" scoped>
.assets-detail {
  padding-bottom: 12rpx;
  flex: 1;
  &-page {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
.detail-card {
  margin: 0 32rpx 24rpx;
  overflow: hidden;
  :deep(.u-tabs) {
    border-radius: 16rpx 16rpx 0 0;
    overflow: hidden;
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

.assets-info {
  padding: 0 32rpx 32rpx;
  border-radius: 0 0 16rpx 16rpx;
  background-color: #fff;
}

.toolbar {
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
  &-section {
    flex: 1;
    display: flex;
    align-items: center;
  }
  :deep(.u-btn) {
    flex: 1;
    margin: 0 12rpx;
  }
}
</style>
