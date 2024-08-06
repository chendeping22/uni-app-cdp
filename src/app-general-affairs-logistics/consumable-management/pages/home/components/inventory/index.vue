<template>
  <view class="inventory-box">
    <u-collapse
      event-type="close"
      :arrow="true"
      :accordion="true"
      :item-style="{
        borderBottom: '1px solid #0000000f',
        width: '100%',
      }"
      :head-style="{
        opacity: '1 !important',
      }"
    >
      <u-collapse-item v-for="(item, index) in list" :key="item.id" :index="index">
        <template #title>
          <MaterialItemTitle
            :data="(omit(item, 'no') as Material)"
            style="width: 100%; overflow: hidden"
          >
            <template #right>
              <view>
                <text :style="{ 'margin-right': '4rpx' }">{{ item.num }}</text>
                <text>{{ item.unit }}</text>
              </view>
            </template>
          </MaterialItemTitle>
        </template>
        <MaterialItemContent :data="handleItemData(item)" :schema="schema" />
        <u-button :custom-style="{ color: '#1677FF' }" @click="handleChanges(item)"
          >查看变更记录</u-button
        >
      </u-collapse-item>
    </u-collapse>
  </view>
  <DetailPopup
    :openDetail="openDetail"
    :detailParams="detailParams"
    @onClose="openDetail = false"
  />
</template>

<script setup lang="ts">
import MaterialItemContent from '@/app-general-affairs-logistics/consumable-management/components/MaterialItemContent.vue';
import MaterialItemTitle from '@/app-general-affairs-logistics/consumable-management/components/MaterialItemTitle.vue';
import { Material } from '@/app-general-affairs-logistics/consumable-management/types/material';
import { omit } from 'lodash-es';
import { reactive, ref } from 'vue';
import DetailPopup from './DetailPopup.vue';
import { schema } from './schema';

const props = defineProps<{
  list?: Material[];
}>();

const stateMap = {
  1: '安全库存',
  2: '低于最小库存预警',
};

const openDetail = ref<boolean>(false);
const detailParams = reactive<{ id?: string; name?: string }>({});

const handleItemData = (value?: Record<string, any>) => {
  const item = Object.assign(value || {}, omit(value?.materialBaseInfoDTO, 'id'), {
    stateName: stateMap[value?.state] || '/',
    isWarning: +value?.state === 2,
  });
  return item;
};

const handleChanges = (data?: Material) => {
  openDetail.value = true;
  detailParams.id = data?.id;
  detailParams.name = data?.name;
};
</script>

<style lang="scss" scoped>
.inventory-box {
  background-color: $color-background-base;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
}
</style>
