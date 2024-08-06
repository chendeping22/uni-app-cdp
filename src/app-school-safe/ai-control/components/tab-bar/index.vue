<template>
  <view class="tab-bar-container bg-white">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="tab-bar-item"
      @click="tabbarChange(item.path)"
    >
      <image v-if="current == index" class="item-img" :src="item.icon_a"></image>
      <image v-else class="item-img" :src="item.icon"></image>
      <view v-if="item.text" class="item-name" :class="{ active: current == index }">{{
        item.text
      }}</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import bar_icon_alarm_record_default from '@/app-school-safe/static/image/bar_icon_alarm_record_default.png';
import bar_icon_alarm_record_pitch from '@/app-school-safe/static/image/bar_icon_alarm_record_pitch.png';
import bar_icon_statistics_default from '@/app-school-safe/static/image/bar_icon_statistics_default.png';
import bar_icon_statistics_pitch from '@/app-school-safe/static/image/bar_icon_statistics_pitch.png';
interface IProps {
  current: number;
}

withDefaults(defineProps<IProps>(), {
  current: 0,
});

const list = [
  {
    text: '统计',
    icon: bar_icon_statistics_default,
    icon_a: bar_icon_statistics_pitch,
    path: '/app-school-safe/ai-control/statistics',
  },
  {
    text: '告警记录',
    icon: bar_icon_alarm_record_default, //未选中图标
    icon_a: bar_icon_alarm_record_pitch, //选中图片
    path: '/app-school-safe/ai-control/index', //页面路径
  },
];

const tabbarChange = (path: string) => {
  uni.redirectTo({
    url: path,
  });
};
</script>

<style lang="scss" scoped>
.active {
  color: $ui-color-blue !important;
}
.tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  height: calc(98rpx + calc(env(safe-area-inset-bottom) + $ui-gap-xxs));
  box-shadow: 0px 0px 20px 0px rgba(24, 25, 68, 0.05);
  padding-top: $ui-gap-xxs;
  padding-bottom: calc(env(safe-area-inset-bottom) + $ui-gap-xxs);
  box-sizing: border-box;
  .tab-bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 98rpx;
    .item-img {
      margin-bottom: $ui-gap-xxs;
      width: 48rpx;
      height: 40rpx;
    }
    .item-name {
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
    }
  }
}
</style>
