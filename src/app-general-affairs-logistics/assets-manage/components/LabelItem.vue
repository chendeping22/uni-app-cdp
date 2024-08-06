<script setup lang="ts">
import QrCode from '@/app-general-affairs-logistics/components/qrcode/qrcode.vue';
import { computed, ref } from 'vue';
import { Asset } from '../types/asset';
import { Label } from '../types/label';

const props = defineProps<{
  data: Label;
  asset: Asset;
}>();

const imgSrc = ref('');
const canvasRef = ref();

const items = computed(() => {
  if (props.data.items) {
    const content = props.data.items.find(i => i.type === 'text');
    return content?.fields || [];
  }
  return [];
});

const qrCode = computed(() => {
  const _qrCode: any = props.data.items?.find(i => i.type === 'qrCode') || {};
  const content: any = _qrCode.fields?.[0];

  return {
    label: content?.label || '',
    fieldName: content?.fieldName || '',
    size: _qrCode.width * 10,
  };
});

const options = computed(() => {
  if (qrCode.value.fieldName && props.asset[qrCode.value.fieldName]) {
    return {
      code: JSON.stringify(props.asset[qrCode.value.fieldName]),
      size: 128,
      padding: 0,
    };
  }
  return null;
});

const generate = async () => {
  const res = await canvasRef.value.GetCodeImg();
  imgSrc.value = res?.tempFilePath || '';
};
</script>

<template>
  <view
    :class="['label-item', data.height >= 70 ? 'label-item-vertical' : '']"
    :style="{ maxWidth: data.width * 10 + 8 }"
  >
    <view
      class="label-item-image"
      :style="{
        width: data.height >= 70 ? '100%' : `${qrCode.size + 36}rpx`,
      }"
    >
      <view
        class="label-item-qrcode"
        :style="{
          width: `${qrCode.size + 36}rpx`,
          height: `${qrCode.size + 36}rpx`,
        }"
      >
        <u-image
          v-if="imgSrc"
          :width="`${qrCode.size}rpx`"
          :height="`${qrCode.size}rpx`"
          :src="imgSrc"
          :show-loading="false"
          :fade="false"
        ></u-image>
        <u-loading v-else mode="circle"></u-loading>
      </view>
      <view v-if="options" class="canvas-wrap">
        <QrCode ref="canvasRef" :options="options" @generate="generate"></QrCode>
      </view>
      <view v-if="qrCode.label" class="label-item-image-tip">{{ qrCode.label }}</view>
    </view>
    <view class="label-item-line"></view>
    <view v-if="items?.length" class="label-item-params">
      <view v-for="item in items" :key="item.fieldName" class="label-item-param">
        {{ item.label }}：{{ asset[item.fieldName] || '' }}</view
      >
    </view>
  </view>
</template>

<style lang="scss" scoped>
.label-item {
  display: flex;
  border-radius: 8rpx;
  border: 8rpx solid $color-text-heading;
  // max-width: 500rpx;
  height: 100%;
  overflow: hidden;
  margin: 0 auto;
  word-break: break-all;
  &-params {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: center;
    padding: 8rpx 16rpx;
    overflow: hidden;
  }
  &-line {
    width: 8rpx;
    height: 100%;
    background: $color-text-heading;
  }
  &-param {
    font-size: 26rpx;
    word-break: break-all;
    line-height: 36rpx;
    height: 36rpx;
    overflow: hidden;
  }
  &-qrcode {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  &-image-tip {
    position: relative;
    top: -8rpx;
    padding: 0 18rpx;
    font-size: 20rpx;
    word-break: break-all;
  }
}
.label-item-vertical {
  flex-direction: column-reverse;
  .label-item-image {
    flex-direction: row-reverse;
    width: 100%;
    padding-right: 24rpx;
  }
  .label-item-image-tip {
    top: 0;
    font-size: 28rpx;
    padding: 8rpx 24rpx 8rpx;
  }
  .label-item-params {
    padding: 24rpx;
    width: 100%;
  }
  .label-item-line {
    height: 8rpx;
    width: 100%;
    background: $color-text-heading;
  }
}

.canvas-wrap {
  position: fixed;
  left: -10000px;
  top: 0;
}
</style>
