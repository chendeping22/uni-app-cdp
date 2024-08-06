<template>
  <view class="">
    <view class="item-card" style="padding: 0">
      <view class="suggest-head">
        <image
          src="@/app-intelligent-iot/static/image/img_suggest.png"
          style="width: 100%"
          mode="widthFix"
        />
        <div class="suggest-head--content">
          <text class="suggest-head--border-left" />
          <text class="text-size34">护眼建议</text>
          <text class="suggest-head--border-right" />
        </div>
      </view>
      <view class="zy-padding-bottom suggest-list">
        <view v-for="(item, index) in suggestList" :key="index" class="suggest-item">
          <view class="suggest-item--head">
            <text class="suggest-item--head-index">{{
              index < 9 ? '0' + (index + 1) : index + 1
            }}</text>
            <text>{{ item.title }}</text>
          </view>
          <view class="text-size28" style="line-height: 44rpx">
            {{ item.content }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
const suggestList = [
  {
    title: '保障睡眠与营养',
    content:
      '保障睡眠时间，小学生每天不少于10小时；初中生达到每天9小时；高中生达到每天8小时。合理饮食，营养均衡，控制甜食、油炸食品的摄入量，少喝碳酸饮料。多吃鱼类、水果、绿色蔬菜等有益于视力健康的营养膳食。',
  },
  {
    title: '控制电子产品使用',
    content:
      '尽量减少使用电子产品，非学习目的的电子产品使用单次不宜超过15分钟，每天累计不宜超过1小时，使用电子产品学习30-40分钟后，应休息远眺放松10分钟。',
  },
  {
    title: '避免不良用眼行为',
    content:
      '连续长时间的读写等近距离用眼活动不宜超过40分钟；保证正确读写姿势做到“一拳一尺一寸”；不在走路时、吃饭时、卧床时、晃动的车厢内、光线暗弱或阳光直射等情况下看书或使用电子产品。',
  },
  {
    title: '增加户外活动与锻炼',
    content:
      '积极参加体育锻炼和户外活动。在户外阳光下活动每天2小时以上或每周10小时以上的时间，能有效预防和控制近视。',
  },
  {
    title: '改善视觉环境',
    content:
      '书桌应放在室内采光最好的位置，白天学习时应充分利用自然光线进行照明，注意避免光线直射在桌面上。晚上学习时除台灯照明外，还应使用适当的背景辅助光源，以减少室内明暗差，使桌面局部光线与周围环境保持和谐。要时常注意室内通风换气。避免室内积聚大量二氧化碳，使人感到头昏，头痛，增加视疲劳的症状。配置与孩子的身高相匹配课桌椅，避免孩子被动养成不良的阅读、书写习惯。',
  },
  {
    title: '时刻关注视力健康',
    content:
      '了解到孩子出现需要坐到课堂前排才能看清黑板、看近视时凑近屏幕、抱怨头痛或眼睛疲劳、经常揉眼、眯眼等迹象时，及时带其到眼科医疗机构检查。',
  },
];
</script>

<style lang="scss" scoped>
.suggest-head {
  text-align: center;
  // padding: 36rpx 0;
  border-radius: 12rpx 12rpx 0 0;
  // background: url(@/app-intelligent-iot/static/image/img_suggest.png);
  // background-size: 100% 100%;
  position: relative;

  &--content {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    padding: 36rpx 0;
  }

  &--border-left {
    display: inline-block;
    position: relative;
    left: -40rpx;
    top: -10rpx;
    width: 8rpx;
    height: 12rpx;
    border-radius: 4rpx;
    background: $zy-spare-color4;
    transform: rotate(-30deg);
    vertical-align: bottom;

    &:before {
      content: '';
      position: relative;
      top: -14rpx;
      left: 15rpx;
      display: inline-block;
      width: 8rpx;
      height: 30rpx;
      border-radius: 4rpx;
      background: $zy-main-color;
      transform: rotate(0deg);
      vertical-align: bottom;
    }
  }

  &--border-right {
    display: inline-block;
    position: relative;
    left: 40rpx;
    top: -10rpx;
    width: 8rpx;
    height: 12rpx;
    border-radius: 4rpx;
    background: $zy-spare-color4;
    transform: rotate(30deg);
    vertical-align: bottom;

    &:before {
      content: '';
      position: relative;
      top: -14rpx;
      left: -15rpx;
      display: inline-block;
      width: 8rpx;
      height: 30rpx;
      border-radius: 4rpx;
      background: $zy-main-color;
      transform: rotate(0deg);
      vertical-align: bottom;
    }
  }
}

.suggest-list {
  position: relative;
  z-index: 9;
  margin-top: -150rpx;
}

.suggest-item {
  margin: 0 30rpx;

  &--head {
    margin: 20rpx 0;

    &-index {
      display: inline-block;
      width: 48rpx;
      height: 40rpx;
      text-align: center;
      line-height: 40rpx;
      background: $zy-main-color;
      color: $zy-middle-color2;
      border-radius: 12rpx 12rpx 22rpx 12rpx;
      margin-right: 20rpx;
      font-size: $zy-font-size24;
    }
  }
}
</style>
