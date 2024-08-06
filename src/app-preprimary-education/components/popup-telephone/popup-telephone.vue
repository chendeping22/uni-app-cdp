<template>
  <uni-popup ref="popupRef" type="bottom" @maskClick="handleMaskClick">
    <view class="popup-list-wrapper" :style="{ paddingBottom: paddingBottom }">
      <view v-if="hasTitle" class="popup-list-title">
        <view></view>
        <view class="title-content">{{ title }}</view>
        <view class="icon-wrap" @click="handleMaskClick">
          <uni-icons type="closeempty" color="#696985" size="24" />
        </view>
      </view>
      <view class="popup-list-content">
        <view class="list-items">
          <text class="center">{{ detail }}</text>
        </view>
        <view class="list-items" @click="handleSelect">
          <text class="center call">呼叫</text>
        </view>
      </view>
      <view v-if="hasCancel" class="popup-list-foot"> </view>
    </view>
  </uni-popup>
</template>
<script lang="ts">
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
  watch,
} from 'vue';

export interface IPopupList {
  label: string;
  value: any;
}
export default defineComponent({
  props: {
    hasTitle: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '详情',
    },
    detail: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    showPopup: {
      type: Boolean,
      default: false,
    },

    hasCancel: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onClose'],
  setup(props, ctx) {
    const popupRef = ref();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;

    const paddingBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom;

    onMounted(() => {
      popupRef.value = proxy?.$refs['popupRef'];
    });
    watch(
      () => props.showPopup,
      isOpen => {
        if (isOpen) popupRef.value.open();
        else popupRef.value.close();
      },
    );
    const handleMaskClick = () => {
      ctx.emit('onClose');
    };
    const handleSelect = () => {
      uni.makePhoneCall({
        phoneNumber: props.phone,
      });
      ctx.emit('onClose');
    };
    return {
      popupRef,
      paddingBottom,
      handleMaskClick,
      handleSelect,
    };
  },
});
</script>
<style lang="scss" scoped>
.popup-list-wrapper {
  background-color: $ui-color-white;
  border-top-left-radius: $ui-radius-large;
  border-top-right-radius: $ui-radius-large;
  .popup-list-title {
    position: relative;
    display: flex;
    align-items: center;

    height: 88rpx;
    border-bottom: 1px solid $ui-color-line-default;

    .title-content {
      flex-grow: 1;
      text-align: center;
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
      font-weight: bold;
    }

    .icon-wrap {
      position: absolute;
      right: 32rpx;
    }
  }
  .popup-list-content {
    .list-items {
      display: flex;
      align-items: center;
      border-bottom: 1px solid $ui-color-line-default;
      box-sizing: border-box;
      height: 88rpx;
      padding: 0 $ui-gap-large;
      text {
        flex-grow: 1;
        color: $ui-color-secondary;
        font-size: $ui-font-size-xt;
        &.call {
          color: $ui-color-primary;
          font-size: $ui-font-size-xt;
        }
        &.center {
          text-align: center;
        }
      }
      .list-checked {
        width: 80rpx;
        height: 80rpx;
      }
    }
  }
}
</style>
