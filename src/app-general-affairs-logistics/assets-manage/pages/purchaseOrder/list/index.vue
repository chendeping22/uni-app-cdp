<template>
  <ListCard
    v-for="(item, index) in listData"
    v-if="listData?.length"
    :key="item.code"
    :card-data="item"
    :column="column"
    :status-list="statusList"
    :status-file-name="statusFileName"
    @onClick="handleDetail(item)"
  />
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import ListCard from '../components/list-card/index.vue';
import { RecordTypeEnum } from '../constants';
import { approvalColumn } from './columns/approvalColumn';
import { inventoryColumn } from './columns/inventoryColumn';

const props = defineProps({
  currentType: {
    type: Number,
    default: RecordTypeEnum.ApprovalRecord,
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
  [RecordTypeEnum.ApprovalRecord]: {
    column: approvalColumn, // 卡片参数
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/purchaseRequestetail/index', // 申请详情地址
    orderIdName: 'fId', // 单据id参数，默认fId
    statusName: 'status', // 状态参数名
    type: 1,
  },
  [RecordTypeEnum.InventoryRecord]: {
    column: inventoryColumn,
    detailUrl: '/app-general-affairs-logistics/assets-manage/pages/purchaseRequestetail/index', // 清单详情地址
    orderIdName: 'fId',
    statusName: 'purchaseStatus',
    type: 2,
  },
};

/** 卡片参数 */
const column = computed(() => cardConfig[props.currentType]?.column);

const statusFileName = computed(() => cardConfig[props.currentType]?.statusName);

/** 跳转到详情 */
const handleDetail = (data: Record<string, any>) => {
  const { detailUrl, orderIdName = 'fId', type } = cardConfig[props.currentType] || {};
  uni.navigateTo({ url: `${detailUrl}?orderId=${data[orderIdName]}&type=${type}` });
};
</script>

<style lang="scss" scoped></style>
