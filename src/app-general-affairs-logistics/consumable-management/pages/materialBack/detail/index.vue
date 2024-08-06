<template>
  <page custom-overflow="visible" class="material-page">
    <view class="material-detail">
      <DetailCard :data="cardData" />
      <DetailCollapse
        v-if="detailData?.items?.length"
        title="退库明细"
        itemTypeName="退库"
        :detailConfig="detailConfig"
        :detailData="detailData?.items"
      />
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </page>
</template>

<script setup lang="ts">
import DetailCard from '@/app-general-affairs-logistics/consumable-management/components/DetailCard.vue';
import DetailCollapse from '@/app-general-affairs-logistics/consumable-management/components/DetailCollapse/index.vue';
import { getMaterialBackDetail } from '@/app-general-affairs-logistics/consumable-management/services/materialBack';
import { IMaterialState } from '@/app-general-affairs-logistics/consumable-management/types/material';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';
import { detailConfig } from './detailConfig.ts';

const detailData = ref<IMaterialState>();

const cardData = computed(() => [
  {
    title: '申请人信息',
    content: [
      { label: '退库单号', value: detailData.value?.code },
      { label: '申请人', value: detailData.value?.applyUser },
      { label: '申请部门', value: detailData.value?.departmentName },
      {
        label: '申请时间',
        value: detailData.value?.applyTime
          ? dayjs(detailData.value?.applyTime).format('YYYY-MM-DD HH:mm')
          : '',
      },
    ],
  },
  {
    title: '退库信息',
    content: [
      {
        label: '摘要',
        value: detailData.value?.remark,
      },
    ],
  },
]);

const getDetail = async (id: string | number) => {
  try {
    showLoading();
    const res = await getMaterialBackDetail(id);
    detailData.value = res || {};
  } catch (e: any) {
    showInfo(e?.desc || '获取详情失败');
  } finally {
    hideLoading();
  }
};

onMounted(() => {
  const pageParams = getPageParams();
  if (pageParams?.id) {
    getDetail(pageParams?.id);
  }
});
</script>

<style lang="scss" scoped>
.material-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.material-detail {
  padding: 24rpx 32rpx;
  flex: 1;
}
</style>
