<template>
  <view class="">
    <uni-popup ref="unipopupRef" type="bottom" background-color="white">
      <view class="popup-content">
        <view class="popup-content--head">
          <text>{{ title }}</text>
          <view v-if="showClose" class="popup-close" @click="close">
            <zy-icons type="close" :size="48" />
          </view>
        </view>
        <scroll-view class="popup-content--main" :scroll-y="true">
          <view
            v-for="item in list"
            :key="item.value"
            :class="[
              'popup-content--item',
              { 'item-check': pageData.selectIndex == item.value && isActive },
            ]"
            @click="change(item)"
          >
            <text>{{ item.name }}</text>
            <zy-icons
              v-if="pageData.selectIndex == item.value && isActive"
              type="succeed"
              :size="48"
            />
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import UniPopup from '@/app-intelligent-iot/components/uni-popup/uni-popup.vue';
import { reactive, ref } from 'vue';
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  showClose: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(['change', 'close-popup']);
const pageData = reactive({
  selectIndex: '',
});
const unipopupRef = ref();
// 打开弹窗
const openPopup = index => {
  pageData.selectIndex = index || '';
  unipopupRef.value.open();
};
// 关闭弹窗
const close = () => {
  unipopupRef.value.close();
  emits('close-popup');
};
const change = e => {
  pageData.selectIndex = e.value;
  unipopupRef.value.close();
  emits('change', e);
};
defineExpose({
  openPopup,
});
</script>

<style lang="scss" scoped>
.popup-content {
  background: $zy-middle-color2;
  border-radius: 12rpx 12rpx 0 0;

  &--head {
    position: relative;
    padding: 20rpx;
    font-size: $zy-font-size34;
    text-align: center;
    border-bottom: 1rpx solid $zy-middle-color8;

    .popup-close {
      position: absolute;
      top: 20rpx;
      right: 30rpx;
    }
  }

  &--main {
    max-height: 90vh;
    overflow: scroll;
  }

  &--item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
  }

  .item-check {
    color: $zy-main-color;
    background: $zy-bg-color;
    backdrop-filter: blur(20rpx);
  }
}
</style>
