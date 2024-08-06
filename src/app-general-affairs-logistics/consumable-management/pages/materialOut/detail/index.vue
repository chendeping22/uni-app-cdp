<template>
  <page custom-overflow="visible">
    <view class="material-page">
      <view class="material-detail">
        <DetailCard :data="cardData" />
        <DetailCollapse
          title="出库明细"
          itemTypeName="领用出库"
          :detailConfig="detailConfig"
          :detailData="detailData?.items"
        />
      </view>
      <view class="page-bottom" v-if="showBackOperate">
        <u-button @click="handleToMaterialBack" :custom-style="{ color: '#1677ff' }">退库</u-button>
        <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import DetailCard from '@/app-general-affairs-logistics/consumable-management/components/DetailCard.vue';
import DetailCollapse from '@/app-general-affairs-logistics/consumable-management/components/DetailCollapse/index.vue';
import { getMaterialOutsDetail } from '@/app-general-affairs-logistics/consumable-management/services/materialOut';
import { IMaterialState } from '@/app-general-affairs-logistics/consumable-management/types/material';
import { loginStore } from '@/store/modules/login';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, onMounted, ref } from 'vue';
import { detailConfig } from './detailConfig.ts';

const store = loginStore();
const { userInfo } = store || {};

const detailData = ref<IMaterialState>();

const cardData = computed(() => [
  {
    title: '申请人信息',
    content: [
      { label: '出库单号', value: detailData.value?.code },
      { label: '领用人', value: detailData.value?.applyUser },
      { label: '领用部门', value: detailData.value?.departmentName },
      {
        label: '领用时间',
        value: detailData.value?.applyTime
          ? dayjs(detailData.value?.applyTime).format('YYYY-MM-DD HH:mm')
          : '',
      },
    ],
  },
  {
    title: '出库信息',
    content: [
      {
        label: '摘要',
        value: detailData.value?.remark,
      },
    ],
  },
]);

const showBackOperate = computed(() => detailData.value?.applyUserId === userInfo?.id);

const getDetail = async (id: string | number) => {
  try {
    showLoading();
    const res = await getMaterialOutsDetail(id);
    detailData.value = res || {};
  } catch (e: any) {
    showInfo(e?.desc || '获取详情失败');
  } finally {
    hideLoading();
  }
};

const handleToMaterialBack = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/consumable-management/pages/materialBack/index?id=${detailData.value?.id}`,
  });
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
.page-bottom {
  position: sticky;
  bottom: 0;
  padding: 24rpx 32rpx;
  z-index: 2;
  box-shadow: $shadow-light-up-md;
  background: $color-background-base;
}
</style>
