<template>
  <ListCard
    v-for="(item, index) in listData"
    v-if="listData?.length"
    :key="item.code"
    :card-data="item"
    :column="column"
    :status-list="statusList"
    @onClick="handleDetail(item)"
  />
</template>

<script setup lang="ts">
import { RecordTypeEnum } from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { PropType, computed } from 'vue';
import ListCard from '../components/list-card/index.vue';
import { borrowRecord } from './columns/borrowRecord';
import { disposeColumn } from './columns/disposeColumn';
import { putColumn } from './columns/putColumn';
import { receiveColumn } from './columns/receiveColumn';
import { repairRecord } from './columns/repairRecord';
import { returnRecord } from './columns/returnRecord';
import { sendBackColumn } from './columns/sendBackColumn';
import { serviceRecord } from './columns/serviceRecord';
import { variationColumn } from './columns/variationColumn';

const props = defineProps({
  currentType: {
    type: Number,
    default: RecordTypeEnum.ReceiveRecord,
  },
  listData: {
    type: Array as PropType<any[]>,
    default: [],
  },
  statusList: {
    type: Array as PropType<{ label: string; value: string }[]>,
    default: [],
  },
});
const cardConfig: Record<string, any> = {
  [RecordTypeEnum.ReceiveRecord]: {
    column: receiveColumn, // 卡片参数
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/receive/detail', // 详情地址
    orderIdName: 'fId', // 单据id参数，默认fId
  },
  [RecordTypeEnum.SendBackRecord]: {
    column: sendBackColumn,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/sendBack/detail', // 详情地址
    orderIdName: 'fId',
  },
  [RecordTypeEnum.BorrowRecord]: {
    column: borrowRecord,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/borrow/detail',
    orderIdName: 'id',
  },
  [RecordTypeEnum.ReturnRecord]: {
    column: returnRecord,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/back/detail',
    orderIdName: 'fId',
  },
  [RecordTypeEnum.RepairRecord]: {
    column: repairRecord,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/repair/detail',
    orderIdName: 'id',
  },
  [RecordTypeEnum.ServiceRecord]: {
    column: serviceRecord,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/service/index',
    orderIdName: 'id',
  },
  [RecordTypeEnum.VariationRecord]: {
    column: variationColumn,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/variation/detail',
    orderIdName: 'id',
  },
  [RecordTypeEnum.DisposeRecord]: {
    column: disposeColumn,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/dispose/detail',
    orderIdName: 'id',
  },
  [RecordTypeEnum.PutRecord]: {
    column: putColumn,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/put/index',
    orderIdName: 'id',
  },
};

/** 卡片参数 */
const column = computed(() => cardConfig[props.currentType]?.column);

/** 跳转到详情 */
const handleDetail = (data: Record<string, any>) => {
  const { detailUrl, orderIdName = 'fId' } = cardConfig[props.currentType] || {};
  uni.navigateTo({ url: `${detailUrl}?orderId=${data[orderIdName]}` });
};
</script>

<style lang="scss" scoped></style>
