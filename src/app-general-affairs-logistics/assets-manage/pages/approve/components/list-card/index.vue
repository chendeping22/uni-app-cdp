<template>
  <view class="list-card">
    <u-card :border="false" :show-head="false" :show-foot="false" @click="onClick"
      ><template #body>
        <view class="list-card-header">
          <view class="list-card-header-name"
            >{{ headerData?.label }}：{{ headerData?.value }}</view
          >
          <view
            v-if="!isNil(flowStatus)"
            :class="handleStatusStyle(flowStatus)"
            class="list-card-status"
            >{{ getStatusName(flowStatus) }}</view
          >
        </view>
        <view v-for="(item, index) in contentData" :key="index" class="list-card-item"
          ><ListCardItem :itemData="item" :index="headerData?.value + index"
        /></view>
      </template>
    </u-card>
  </view>
</template>

<script setup lang="ts">
import { handleStatusStyle } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { isNil, slice } from 'lodash-es';
import { PropType, computed } from 'vue';
import ListCardItem from '../list-card-item/index.vue';

const emits = defineEmits(['onClick']);

const props = defineProps({
  cardData: {
    /** 卡片数据 */
    type: Object,
    default: () => {},
  },
  column: {
    /** 卡片参数 */
    type: Array as PropType<{ label: string; key: string; dataRender: (e?: any) => {} }[]>,
    default: [],
  },
  statusList: {
    // 状态列表
    type: Array as PropType<{ label: string; value: string }[]>,
    default: [],
  },
});

/** 单号 */
const headerData = computed(() => ({
  label: props?.column?.[0]?.label,
  value: props?.cardData?.[props?.column?.[0]?.key] || '/',
}));

/** 单据信息 */
const contentData = computed(() =>
  slice(props?.column, 1)?.map(v => {
    const val = props?.cardData?.[v?.key];
    const formatVal = v?.dataRender ? v?.dataRender(val) : val;
    return { ...v, value: formatVal || '/' };
  }),
);

const flowStatus = computed(() => props.cardData?.status);

const getStatusName = (status?: number | string) => {
  return props?.statusList?.find(v => v?.value === status)?.label || '已完成';
};
const onClick = () => {
  emits('onClick');
};
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.list-card {
  :deep(.u-card) {
    border-radius: 16rpx;
  }
  &-header {
    margin-bottom: 32rpx;
    display: flex;
    justify-content: space-between;

    &-name {
      color: $textDefaultColor;
      font-size: 32rpx;
    }
  }
  &-status {
    font-size: 26rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
  }
  &-item {
    margin-bottom: 16rpx;
    display: flex;
    font-size: 30rpx;
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-label {
    min-width: 120rpx;
    color: $textLabelColor;
    margin-right: 24rpx;
  }
  &-value {
    color: $textDefaultColor;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-wrap: break-word;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
</style>
