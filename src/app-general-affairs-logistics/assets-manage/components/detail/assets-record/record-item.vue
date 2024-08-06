<template>
  <view class="record-item">
    <view class="record-item-title">{{ listItem?.label }}</view>
    <view class="record-item-content">
      <view class="item-left"
        ><view v-if="listItem?.from?.name">
          <view class="use-info">
            <view>
              <image
                :src="listItem?.from?.imgUrl || icon_avatar"
                class="use-info-img"
                mode="scaleToFill"
              />
            </view>
            <view class="use-info-name">
              {{ listItem?.from?.name }}
            </view>
          </view>
        </view>
        <view v-else>{{ listItem?.from || '无' }}</view>
      </view>
      <view class="item-center arrow-icon">
        <u-icon name="arrow-rightward" color="#aaa" />
      </view>
      <view v-if="listItem?.to?.name" class="item-right">
        <view class="use-info">
          <view>
            <image
              :src="listItem?.to?.imgUrl || icon_avatar"
              class="use-info-img"
              mode="scaleToFill"
            />
          </view>
          <view class="use-info-name">
            {{ listItem?.to?.name }}
          </view>
        </view>
      </view>
      <view v-else class="item-right">{{ listItem?.to || '无' }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';
import { IBizInfo } from '../constants';
import icon_avatar from '/static/avatar.png';

const props = defineProps({
  info: {
    type: Object as PropType<IBizInfo>,
  },
});

const listItem = computed(() => props?.info);
</script>

<style scoped lang="scss">
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.record-item {
  margin-top: 24rpx;
  .record-item-title {
    margin-bottom: 8rpx;
  }
  .item-left {
    background-color: $fillDefaultColor;
    color: $textLabelColor;
  }
  .item-right {
    background-color: $colorPrimaryLightBg;
    color: $colorPrimaryBase;
  }
  .item-left,
  .item-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8rpx 16rpx;
    text-align: center;
    line-height: 32rpx;
    border-radius: 8rpx;
    min-height: 80rpx;
  }
  .item-center {
    width: 56rpx;
    text-align: center;
  }
  .record-item-content {
    display: flex;
    align-items: center;
    .arrow-icon {
      transform: scaleY(-0.8);
    }
  }
  .use-info {
    display: flex;
    align-items: center;
  }
  .use-info-img {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
  }
  .use-info-name {
    text-align: left;
    margin-left: 16rpx;
  }
}
</style>
