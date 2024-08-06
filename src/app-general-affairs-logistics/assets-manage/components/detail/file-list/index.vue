<template>
  <view style="padding-top: 4px">
    <AttachmentsList v-if="fileData?.length" :file-data="fileData" />
    <u-empty-custom v-else style="margin-top: 48px"></u-empty-custom>
  </view>
</template>

<script setup lang="ts">
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import { PropType, onMounted, ref } from 'vue';
import { IAssetMeans, IDetailData } from '../constants';

const props = defineProps({
  detailInfo: {
    type: Object as PropType<IDetailData>,
    default: {},
  },
});

const fileData = ref<IAssetMeans[]>([]);

onMounted(() => {
  if (props?.detailInfo) {
    fileData.value = props?.detailInfo?.assetMeansList;
  }
});
</script>

<style lang="scss" scoped></style>
