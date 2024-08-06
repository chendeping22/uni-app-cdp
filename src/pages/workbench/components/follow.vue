<template>
  <view class="follow-wrapper">
    <view class="over-follow">
      <image class="follow-image-left" :src="icon_follow" />
      <view class="follow-content">
        <view class="follow-content-title">麦塔校园</view>
        <view class="follow-content-desc">为避免错过学校重要通知, 请关注公众号</view>
      </view>
      <view class="follow-btn" @click="handleToFollowPage">关注</view>
    </view>
  </view>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import icon_follow from '/static/icon_follow.svg';
export default defineComponent({
  props: {
    hasFollow: {
      // 0-未关注, 1-已关注. 默认不展示故默认值为1
      type: Number as PropType<0 | 1>,
      default: 1,
    },
  },
  setup() {
    const handleToFollowPage = () => {
      const target = import.meta.env.VITE_FOLLOW_GUIDE_SRC;
      // 新基座webview地址
      const url = `/app-platform/webview/index?path=${encodeURIComponent(
        JSON.stringify(target),
      )}&title=麦塔校园`;
      uni.navigateTo({
        url,
      });
    };
    return { icon_follow, handleToFollowPage };
  },
});
</script>
<style scoped lang="scss">
.follow-wrapper {
  position: fixed;
  bottom: calc(112rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  z-index: 996;
}
.over-follow {
  height: 120rpx;
  bottom: 0;
  left: 0;
  position: absolute;
  z-index: 3;
  background: rgba($ui-color-black, 0.7);
  padding: 0 $ui-gap-large;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  right: 0;
  .follow-image-left {
    width: 88rpx;
    height: 88rpx;
    margin-right: $ui-gap-large;
    flex-shrink: 0;
  }
  .follow-content {
    flex-grow: 1;

    color: $ui-color-white;
    &-title {
      font-size: $ui-font-size-xt;
      margin-bottom: $ui-gap-xxs;
    }
    &-desc {
      font-size: $ui-font-size-secondary;
    }
  }

  .follow-btn {
    width: 120rpx;
    height: 64rpx;
    line-height: 64rpx;
    text-align: center;
    flex-shrink: 0;
    background: $ui-color-success;
    border-radius: $ui-radius-xl;
    color: $ui-color-white;
    font-size: $ui-font-size-content;
    font-weight: $ui-font-weight-bold;
    margin-left: $ui-gap-xs;
  }
}
</style>
