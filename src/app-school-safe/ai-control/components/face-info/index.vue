<template>
  <view class="common-card components-face-info">
    <view class="similarity">
      <text class="title">相似度：</text>
      <text class="percent">{{ detail?.similarity }}%</text>
    </view>
    <view class="image-compare">
      <view class="img-item">
        <preview-image class-name="notification-face-info-image" :src="detail?.snapImageUrl" />
        <view class="img-title">抓拍图</view>
      </view>
      <view class="img-item">
        <preview-image class-name="notification-face-info-image" :src="detail?.personImageUrl" />
        <view class="img-title">底库图</view>
      </view>
    </view>
    <view class="user-info">
      <view class="common-item">
        <text class="common-label">姓名</text>
        <text class="common-value">{{ detail?.name || '/' }}</text>
      </view>
      <view class="common-item">
        <text class="common-label">身份</text>
        <text class="common-value">{{ detail?.personTypeName || '/' }}</text>
      </view>
      <view class="common-item">
        <text class="common-label">档案标签</text>
        <view v-if="detail?.archiveLabels?.length" class="common-value file-label">
          <text v-for="item in detail?.archiveLabels" :key="item" class="common-tag">{{
            item
          }}</text>
        </view>
        <view v-else class="common-value">/</view>
      </view>
    </view>
  </view>
</template>
<script lang="ts" setup>
import PreviewImage from '@/app-school-safe/components/preview-image/index.vue';
interface IProps {
  detail: any;
}

withDefaults(defineProps<IProps>(), {
  detail: () => {},
});
</script>
<style scoped lang="scss">
@import '@/app-school-safe/styles/alarm-card.scss';
.components-face-info {
  margin-top: $ui-gap-default;
  .similarity {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 88rpx;
    background: rgba($ui-color-base, 0.03);
    border-radius: $ui-radius-xl;
    font-size: $ui-font-size-xt;
    letter-spacing: 0;
    text-align: center;
    line-height: 34rpx;
    font-weight: 600;
    .title {
      color: $ui-color-base;
    }
    .percent {
      color: $ui-color-primary;
    }
  }
  .image-compare {
    display: flex;
    justify-content: space-between;
    margin-top: $ui-gap-large;
    .img-item {
      .img-title {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 262rpx;
        height: 72rpx;
        font-size: $ui-font-size-title;
        color: $ui-color-secondary;
        letter-spacing: 0;
        text-align: center;
        line-height: 30rpx;
        font-weight: 600;
        background: rgba($ui-color-base, 0.03);
        border-bottom-left-radius: $ui-radius-xl;
        border-bottom-right-radius: $ui-radius-xl;
      }
    }
  }
  .user-info {
    margin-top: $ui-gap-large;
    .file-label {
      :nth-child(n + 2) {
        margin-left: $ui-gap-small;
      }
    }
  }
}
</style>
