<template>
  <view class="bg-white flex-plain">
    <view style="flex: 1">
      <view
        v-if="current > -1 && weekList.length > 0"
        class="h100 w100 flex-center flex-right"
        @click="handleSwiperPrev"
      >
        <u-icon
          class="icon-64 flex flex-center"
          name="arrow-left"
          :color="current > 0 ? '#86909c' : '#c9cdd4'"
        />
      </view>
    </view>
    <view class="swiper-wrapper">
      <swiper
        v-if="current > -1 && weekList.length > 0"
        bg-color="#ffffff"
        :autoplay="false"
        :current="current"
        class="swiper"
        :disable-touch="true"
      >
        <swiper-item v-for="(item, index) in weekList" :key="index" :catchtouchmove="'不能滑动'">
          <view class="h100 flex-column flex-center">
            <view class="week-info">{{ getWeekInfo(item) }}</view>
            <view class="semester-info color-placeholder">{{ semester }}</view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <view style="flex: 1">
      <view
        v-if="current > -1 && weekList.length > 0"
        class="h100 w100 flex-center flex-left"
        @click="handleSwiperNext"
      >
        <u-icon
          class="icon-64 flex flex-center"
          name="arrow-right"
          :color="current > -1 && current < weekList.length - 1 ? '#86909c' : '#c9cdd4'"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  semester: string;
  current: number;
  weekList: any[];
}>();
const emits = defineEmits(['change']);

function handleSwiperPrev() {
  if (props.current > 0) {
    emits('change', props.current - 1);
  }
}
function handleSwiperNext() {
  if (props.current > -1 && props.current < props.weekList.length - 1) {
    emits('change', props.current + 1);
  }
}
function getWeekInfo(week: any) {
  return `第${week.weekNo}周 ${week.startDate}至${week.endDate}`;
}
</script>

<style lang="scss" scoped>
.swiper-wrapper {
  width: 452rpx;
  height: 116rpx;
  .swiper {
    height: 116rpx;
  }
}
.week-info {
  font-size: 26rpx;
  white-space: nowrap;
  text-align: center;
}
.semester-info {
  margin-top: 4rpx;
  font-size: 26rpx;
  white-space: nowrap;
  text-align: center;
}
</style>
