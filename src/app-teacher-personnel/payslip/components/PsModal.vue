<template>
  <u-modal v-model="show" title="" :show-confirm-button="false" :show-cancel-button="false">
    <view class="modal-inner">
      <image class="modal-image" :src="successSvg"></image>
      <view class="modal-desc1">设置成功！</view>
      <view class="modal-desc2">请妥善保存密码，下次输入此密码查看工资详情</view>
      <u-button :custom-style="{ width: '100%' }" type="primary" @click="$emit('confirm')"
        >确定({{ seconds }}秒即将跳转详情页)</u-button
      >
    </view>
  </u-modal>
</template>

<script setup lang="ts">
import successSvg from '@/app-teacher-personnel/static/payslip/success.svg';
import { ref, watch } from 'vue';

const props = defineProps({
  showModal: Boolean,
  seconds: Number,
});
const show = ref(props.showModal);

watch(
  () => props.showModal,
  val => {
    show.value = val;
  },
);
</script>

<style scoped lang="scss">
.modal-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 px2rpx(24) px2rpx(24) px2rpx(24);
  .modal-image {
    width: px2rpx(72);
    height: px2rpx(72);
  }
  .modal-desc1 {
    margin-top: px2rpx(12);
    @include title-3-medium;
    color: rgba($color-text-base, 0.88);
  }
  .modal-desc2 {
    margin: px2rpx(8) 0 px2rpx(24);
    @include body-regular;
    color: rgba($color-text-base, 0.45);
    text-align: center;
  }
}
</style>
