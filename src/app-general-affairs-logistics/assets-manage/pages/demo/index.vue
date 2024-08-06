<!-- 资产领用 -->
<template>
  <view>
    <view
      ><u-button @click="handleReceiveScan">扫码选择</u-button>
      <view>{{ selectedData }}</view>
    </view>
    <approve-flow :orderId="orderId" />
    <view class="u-flex">
      <u-button type="primary" @click="handleWithdraw">撤回</u-button>
      <u-button type="primary" @click="handlePress">催办</u-button>
      <u-button type="primary" @click="handleOpinion('reject')">驳回</u-button>
      <u-button type="primary" @click="handleOpinion('commit')">同意</u-button>
    </view>
    <opinion-popup ref="opinionPopupRef" @onAfterSubmit="handleAfterSubmit" />
  </view>
</template>

<script setup lang="ts">
import OpinionPopup from '@/app-general-affairs-logistics/assets-manage/components/OpinionPopup.vue';
import {
  ScanTypeEnum,
  handleScan,
  scanInfoStore,
} from '@/app-general-affairs-logistics/assets-manage/utils/assets-scan';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import { getDetailByRole } from '@/app-general-affairs-logistics/services/assets-manage';
import { showInfo } from '@/utils/tools';
import { ref, watch } from 'vue';
import { getFlowLaunchPress, getWorkOrderWithdraw } from '../../services/approve-operate';

const scanStore = scanInfoStore();
const selectedData = ref<any>();
const orderId = ref<string>('548525918860427333');
const opinionPopupRef = ref();

const handleReceiveScan = async () => {
  handleScan(ScanTypeEnum.ScanAsset);
};

const handleScanData = async (bizId: string) => {
  const data: any = await getDetailByRole(bizId);
  selectedData.value = data?.baseInfoMap;
};

watch(
  () => scanStore.scanRes,
  val => {
    if (!val?.bizId) return;
    handleScanData(val?.bizId);
  },
);

/** 撤回 */
const handleWithdraw = async () => {
  try {
    const res = await getWorkOrderWithdraw(orderId.value);
    console.log('🚀 ~ handleWithdraw ~ res:', res);
    showInfo('撤回成功');
  } catch (e: any) {
    showInfo(e?.msg || '撤回失败');
  }
};

/** 催办 */
const handlePress = async () => {
  try {
    await getFlowLaunchPress(orderId.value);
    showInfo('催办成功');
  } catch (e: any) {
    showInfo(e?.msg || '催办失败');
  }
};

const handleOpinion = (type: string) => {
  opinionPopupRef.value?.handleShowPopup({ orderId: orderId.value, type });
};

const handleAfterSubmit = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped></style>
