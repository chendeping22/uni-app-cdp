<template>
  <view class="tool-wrap">
    <view class="tool-wrap-head">
      <u-button
        @click="handleAssetsSelect"
        style="flex: 1"
        :custom-style="{ color: '#1677ff', marginRight: '16rpx' }"
      >
        <u-icon name="plus" color="#2979ff" size="24" style="margin-right: 12rpx"></u-icon
        >选择资产</u-button
      >
      <u-button
        @click="handleScan(ScanTypeEnum.ScanAsset)"
        style="flex: 1"
        :custom-style="{ color: '#1677ff' }"
      >
        扫码选择</u-button
      >
    </view>
    <asset-list v-if="assetsList.length" :list="assetsList" @delete="ondDelete"></asset-list>
    <u-toast ref="toast" />
  </view>
</template>

<script setup lang="ts">
import showAssetsSelector from '@/app-general-affairs-logistics/assets-manage/pages/assets-selector/show-selector';
import {
  ScanTypeEnum,
  handleScan,
} from '@/app-general-affairs-logistics/assets-manage/utils/assets-scan';
import { getDetailByRole } from '@/app-general-affairs-logistics/services/assets-manage';
import { loginStore } from '@/store/modules/login';
import { showInfo } from '@/utils/tools';
import { filter, find, isNil, map, uniqBy } from 'lodash-es';
import { PropType, ref, watch } from 'vue';
import { Asset } from '../types/asset';
import { scanInfoStore } from '../utils/assets-scan';
import { RecordTypeEnum } from '../utils/constants';
import AssetList from './AssetList.vue';

interface AssetsListQuery {
  /** 资产状态集合 */
  assetStatuses?: (string | number)[];
  /** 保管人集合 */
  recipientIdList?: string[];
  /** 需排除的资产状态集合 */
  excludeAssetStatuses?: (string | number)[];
  [x: string]: any;
}

const props = defineProps({
  /** 已有的资产列表数据 */
  assetsList: {
    type: Array as PropType<Asset[]>,
    default: [],
  },
  /** 资产列表查询参数 */
  apiQuery: {
    type: Object as PropType<AssetsListQuery>,
    default: {},
  },
  /** 单据类型 */
  orderType: {
    type: Number,
    default: undefined,
  },
});

const store = loginStore();
const { userInfo } = store || {};

const scanStore = scanInfoStore();
const emits = defineEmits<{
  (e: 'onSelectList', itemDTOList: Asset[]): void;
}>();

const toast = ref();

const onChangeList = (val: Asset[]) => {
  emits('onSelectList', val);
};

// 资产选择处理
const handleAssetsSelect = () => {
  showAssetsSelector({
    // value: props.assetsList,
    excludeIds: map(props.assetsList, (v: any) => v.assetId),
    apiQuery: props?.apiQuery,
    limitCount: 100,
    callback: (data: any) => {
      const _list = uniqBy(props.assetsList.concat(data), 'assetId');
      onChangeList(_list);
    },
  });
};

/** 资产状态提示 */
const showStatusInfo = () => {
  switch (props?.orderType) {
    // 领用
    case RecordTypeEnum.ReceiveRecord:
    // 借用
    case RecordTypeEnum.BorrowRecord:
      showInfo('选择的资产非闲置状态');
      break;
    // 退还
    case RecordTypeEnum.SendBackRecord:
      showInfo('选择退还的资产非在用状态');
      break;
    // 归还
    case RecordTypeEnum.ReturnRecord:
      showInfo('选择归还的资产非借用状态');
      break;
    // 报修
    case RecordTypeEnum.RepairRecord:
      showInfo('选择的资产不可报修');
      break;
    // 资产变更：申请人非发起人
    case RecordTypeEnum.VariationRecord:
      showInfo('选择的资产非借用或在用状态');
      break;
    default:
      showInfo('选择的资产状态不对');
      break;
  }
};

/** 需排除的资产状态提示 */
const showExcludeStatusInfo = () => {
  switch (props?.orderType) {
    // 资产变更
    case RecordTypeEnum.VariationRecord:
      toast.value.show({
        title: '所选资产状态不可为待维修、维修中、审批中',
        type: 'default',
      });
      break;
    // 资产处置
    case RecordTypeEnum.DisposeRecord:
      toast.value.show({
        title: '所选资产状态不可为待维修、维修中、已处置、审批中',
        type: 'default',
      });
      break;
    default:
      showInfo('选择的资产状态不对');
      break;
  }
};

const handleScanData = async (bizId: string) => {
  const data: any = await getDetailByRole(bizId);
  if (!data?.assetId) return;
  if (find(props.assetsList, i => i.assetId === data?.assetId)) {
    showInfo('该资产已选择!');
    return;
  }
  if (props.assetsList.length >= 100) {
    showInfo('已选资产达到或超过100条，请重选');
    return;
  }
  /**
   * 领用、借用：资产状态为闲置
   * 退还(归还): 资产状态为 在用（借用）
   * 普通用户：资产在用(借用)，保管人为当前用户
   * 管理员：资产在用(借用)，保管人为所选领用人(借用人)的资产
   *
   */
  // 资产状态
  const assetStatus = data?.baseInfoMap?.assetStatus;
  // 资产保管人
  const recipientId = data?.baseInfoMap?.recipientId;
  // 是否管理员
  const isAdmin = data?.isAdmin;

  const includeStatuses = props?.apiQuery?.assetStatuses || [];
  const excludeStatuses = props?.apiQuery?.excludeAssetStatuses || [];

  // 资产状态判断
  if (!isNil(assetStatus) && includeStatuses?.length && !includeStatuses?.includes(+assetStatus)) {
    showStatusInfo();
    return;
  }

  // 需排除的资产状态判断
  if (!isNil(assetStatus) && excludeStatuses?.length && excludeStatuses?.includes(+assetStatus)) {
    showExcludeStatusInfo();
    return;
  }

  const asset = {
    ...(data?.baseInfoMap || {}),
    ...(data?.assetParamMap || {}),
    ...(data?.otherParamMap || {}),
    id: data?.assetId,
    assetId: data?.assetId,
    assetInfoImgVOList: data?.assetInfoImgVOList,
    assetMeansList: data?.assetMeansList,
  } as Asset;

  if (!props?.apiQuery?.recipientIdList?.length) {
    onChangeList(uniqBy(props.assetsList.concat(asset), 'assetId'));
    return;
  }

  // 管理员：保管人为recipientIdList人员；普通用户：保管人为当前用户
  const includeRecipient = props?.apiQuery?.recipientIdList.includes(recipientId);
  const adminSelectedAble = isAdmin && includeRecipient;
  const selectedAble = !isAdmin && userInfo?.id && includeRecipient && recipientId === userInfo?.id;

  if (adminSelectedAble || selectedAble) {
    onChangeList(uniqBy(props.assetsList.concat(asset), 'assetId'));
  } else {
    showInfo('资产保管人与当前选择不符');
  }
};

const ondDelete = (node: any) => {
  onChangeList(filter(props.assetsList, i => i.assetId !== node.assetId));
};

watch(
  () => scanStore.scanRes,
  val => {
    if (!val?.bizId) return;
    handleScanData(val?.bizId);
  },
);
</script>

<style lang="scss" scoped>
.tool-wrap {
  padding: 0 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}

.tool-wrap-head {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  display: flex;
}
</style>
