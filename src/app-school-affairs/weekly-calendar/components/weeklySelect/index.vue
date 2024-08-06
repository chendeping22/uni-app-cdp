<template>
  <!-- <swiper
    bg-color="#ffffff"
    :autoplay="false"
    :current="current"
    class="swiper"
    circular="true"
    @change="swiperEvent"
  > -->
  <!-- <swiper-item v-for="(items, index) in swiperItemList" :key="index"> -->
  <view class="content">
    <view
      v-for="(item, index) in allData"
      :key="index"
      class="box"
      @click="handleClick(item, index)"
    >
      <view class="top-content">{{ formatterWeek(index) }}</view>
      <view
        :class="[
          changeTime(item?.calendarDate) === getCurrentDay() ? 'current-day' : '',
          item?.active ? 'active' : 'center-content',
        ]"
        >{{ parseInt(item?.calendarDate.split('-')[2]) }}</view
      >
      <view>
        <view v-if="item?.calendars.length" class="bottom-dot"></view>
        <view v-else class="bottom-dot-empty"></view>
      </view>
    </view>
  </view>
  <!-- </swiper-item> -->
  <!-- </swiper> -->
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref, watch } from 'vue';

// const current = ref(0);
const emit = defineEmits(['update:cardList', 'updateWeekNo', 'currentDay']);
const haveCurrentDay = ref(false);
const props = defineProps({
  conditionData: {
    type: Array,
    default: () => [],
  },
  // weekNo: {
  //   type: Number,
  // },
  setCurrentday: {
    type: String,
  },
});
const allData = ref<any>(props.conditionData);
// const currentWeekNo = ref<any>(props.weekNo);
// const swiperItemList = ref<any>(50);
const setCurrentdays = ref<any>(props.setCurrentday);
watch(
  () => props.setCurrentday,
  val => {
    setCurrentdays.value = val;
  },
  { immediate: true },
);
watch(
  () => props.conditionData,
  val => {
    haveCurrentDay.value = false;
    if (setCurrentdays.value) {
      //之前有用户点击过日期
      allData.value = val.map((item: any) => {
        if (changeTime(item?.calendarDate) === changeTime(setCurrentdays.value)) {
          haveCurrentDay.value = true;
          emit('update:cardList', item);
          return {
            ...item,
            active: true,
          };
        } else {
          return {
            ...item,
            active: false,
          };
        }
      });
    } else {
      //之前没有用户点击过日期
      allData.value = val.map((item: any) => {
        if (
          changeTime(item?.calendarDate) === changeTime(setCurrentdays.value) ||
          changeTime(item?.calendarDate) === getCurrentDay()
        ) {
          haveCurrentDay.value = true;
          emit('update:cardList', item);
          return {
            ...item,
            active: true,
          };
        } else {
          return {
            ...item,
            active: false,
          };
        }
      });
      if (!haveCurrentDay.value) {
        allData.value = val.map((item: any, index) => {
          if (index === 0) {
            emit('update:cardList', item);
            return {
              ...item,
              active: true,
            };
          } else {
            return {
              ...item,
              active: false,
            };
          }
        });
      }
    }
  },
  { immediate: true },
);

// watch(
//   () => props.weekNo,
//   val => {
//     debugger
//     currentWeekNo.value = val;
//   },
//   { immediate: true },
// );
// watch(
//   () => current.value,
//   (val, old) => {
//     // if (Math.abs(val) > 10) {
//     //   swiperItemList.value = 20;
//     // }
//     if (val > old) {
//       emit('updateWeekNo', ++currentWeekNo.value);
//     } else {
//       emit('updateWeekNo', --currentWeekNo.value);
//     }
//   },
// );
// const swiperEvent = e => {
//   const index = e.detail.current;
//   current.value = index;
//   console.log('🚀 ~ swiperEvent ~ index:', index);
// };
const handleClick = (items: any, index: number) => {
  emit('currentDay', items.calendarDate);
  emit('update:cardList', items);
  allData.value.forEach((item: any, inx: number) => {
    if (inx === index) {
      item.active = true;
    } else {
      item.active = false;
    }
  });
};
const getCurrentDay = () => {
  const currentDate = dayjs().format('YYYY-MM-DD');
  const timestamp = dayjs(currentDate).valueOf();
  return timestamp;
};
const changeTime = (t: any) => {
  return dayjs(t).valueOf();
};
const formatterWeek = computed(() => (inx: number) => {
  switch (inx) {
    case 0:
      return '周一';
    case 1:
      return '周二';
    case 2:
      return '周三';
    case 3:
      return '周四';
    case 4:
      return '周五';
    case 5:
      return '周六';
    case 6:
      return '周日';
  }
});
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 0rpx 32rpx 24rpx;
  box-shadow: 0px 1px 2px 0px #0000000a;
}
.box {
  display: flex;
  flex-direction: column;
  font-size: 30rpx;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.top-content {
  color: #9a9a9a;
}
.center-content {
  color: #000;
  padding: 20rpx 0;
  margin: 10rpx 0;
}
.current-day {
  color: #1677ff;
}
.active {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background-color: #1677ff;
  color: #fff;
  padding: 20rpx 0;
  margin: 23.8rpx 0;
  box-sizing: border-box;
}
.bottom-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background-color: #1677ff;
}
.bottom-dot-empty {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background-color: #fff;
}
.swiper {
  height: 85px;
}
</style>
