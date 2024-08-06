<template>
  <uni-popup ref="popupRef" type="bottom" background-color="white" @maskClick="handleMaskClick">
    <view class="popup-list-wrapper" :style="{ paddingBottom: paddingBottom }">
      <view v-if="hasTitle" class="popup-list-title">
        <view></view>
        <view class="title-content">{{ title }}</view>
        <!-- <image :src="Icon_close" @click="handleMaskClick"></image> -->
        <view class="icon-wrap" @click="handleMaskClick">
          <uni-icons type="closeempty" color="#696985" size="24" />
        </view>
      </view>
      <scroll-view v-if="listData?.length" class="popup-list-content" scroll-y>
        <view
          v-for="(item, index) in listData ?? []"
          :key="item.value"
          class="list-items"
          @click="handleSelect(item, index)"
        >
          <text :class="{ checked: item.value === defaultValue }">{{ item.label }}</text>

          <c-icon
            v-if="`${item.value}` === `${defaultValue}`"
            name="icon_succeed"
            size="36"
            color-type="primary"
          />
        </view>
      </scroll-view>
      <slot name="popup-content"></slot>
      <view v-if="hasCancel" class="popup-list-foot"> </view>
    </view>
  </uni-popup>
</template>
<script lang="ts">
import UniPopup from '@/app-preprimary-education/components/uni-popup/uni-popup.vue';
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';

export interface IPopupList {
  label: string;
  value: any;
}
export default defineComponent({
  components: { UniPopup },
  props: {
    hasTitle: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: '请选择',
    },
    showPopup: {
      type: Boolean,
      default: false,
    },

    hasCancel: {
      type: Boolean,
      default: false,
    },
    listData: {
      type: Array as PropType<IPopupList[]>,
      default: [] as IPopupList[],
    },
    defaultValue: {
      type: String,
      default: '',
    },
  },
  emits: ['onClose', 'onSelect'],
  setup(props, ctx) {
    const popupRef = ref();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const paddingBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom ?? 0;

    onMounted(() => {
      popupRef.value = proxy?.$refs['popupRef'];
      if (props.showPopup) popupRef.value.open();
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
    const handleSelect = (value: Record<string, any>, index: number) => {
      ctx.emit('onSelect', value, index);
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
  height: auto;
  overflow: auto;
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
    max-height: 400rpx;
    overflow: auto;
    .list-items {
      display: flex;
      align-items: center;
      border-bottom: 1px solid $ui-color-line-default;
      box-sizing: border-box;
      height: 88rpx;
      padding: 0 $ui-gap-large;
      text {
        flex-grow: 1;
        color: $ui-color-base;
        font-size: $ui-font-size-xt;
        &.checked {
          color: $ui-color-primary;
        }
      }
    }
  }
}
</style>
