<template>
  <view>
    <view class="group" v-for="info in basicInfo" :key="info.key">
      <view class="group-title">{{ info.name }}</view>
      <view class="group-content">
        <view class="group-cell" v-for="item in info?.children" :key="item?.key">
          <view class="group-cell-name">{{ item?.name }}</view>
          <view class="group-cell-value">{{ item?.value || '/' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { includes, map } from 'lodash-es';
import { PropType, onMounted, ref, watch } from 'vue';
import { IDetailData } from '../constants';
import { IBasicInfoParent, getBaseInfo } from './constants';

const props = defineProps({
  detailInfo: {
    type: Object as PropType<IDetailData>,
    default: {},
  },
});

const basicInfo = ref<IBasicInfoParent[]>();

const getBasicInfoInit = () => {
  const { basicColumns, assetParamsColumn, otherColumn } = getBaseInfo(
    !!props?.detailInfo?.isAdmin,
  );
  return [
    {
      name: '基础信息',
      key: 'baseInfoMap',
      columns: basicColumns,
    },
    {
      name: '资产参数',
      key: 'assetParamMap',
      columns: assetParamsColumn,
    },
    {
      name: '其他',
      key: 'otherParamMap',
      columns: otherColumn,
    },
  ];
};

const handleChildrenData = (data: Record<string, any>, columns: Record<string, any>[]) => {
  const dateVal = ['arrivalDate', 'purchaseDate', 'warrantyDate']; // 需要转化的日期
  return map(columns, v => ({
    ...v,
    value:
      data?.[v.key] && includes(dateVal, v.key)
        ? dayjs(data[v.key]).format('YYYY-MM-DD')
        : data?.[v.key],
  }));
};

const handleUpdateDetail = (val: IDetailData) => {
  console.log('file: index.vue:95 ~ handleUpdateDetail ~ val:', val);
  const data: Record<string, any> = {
    baseInfoMap: { ...val?.baseInfoMap, ...val?.otherParamMap },
    assetParamMap: val?.assetParamMap,
    otherParamMap: val?.otherParamMap,
  };
  const infoData = getBasicInfoInit();
  basicInfo.value = map(infoData, v => ({
    ...v,
    children: handleChildrenData(data?.[v.key], v.columns),
  }));
};

watch(
  () => props.detailInfo,
  val => {
    handleUpdateDetail(val);
  },
);

onMounted(() => {
  if (props.detailInfo) {
    handleUpdateDetail(props.detailInfo);
  }
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.group {
  padding-top: 32rpx;
}
.group-title {
  font-size: 26rpx;
  color: rgba(0, 0, 0, 0.88);
  font-weight: 500;
  margin-bottom: 16rpx;
  line-height: 36rpx;
}
.group-content {
  background-color: rgba(0, 0, 0, 0.02);
  padding: 24rpx;
  border-radius: 16rpx;
}
.group-cell {
  display: flex;
  align-items: self-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
  &:last-child {
    margin-bottom: 0;
  }
  &-name {
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.45);
    word-break: break-all;
    font-weight: 400;
    width: 144rpx;
    line-height: 40rpx;
  }
  &-value {
    font-size: 30rpx;
    color: rgba(0, 0, 0, 0.88);
    margin-left: 32rpx;
    text-align: left;
    word-break: break-all;
    display: flex;
    justify-content: flex-end;
    font-weight: 400;
    line-height: 40rpx;
    flex: 1;
  }
}
</style>
