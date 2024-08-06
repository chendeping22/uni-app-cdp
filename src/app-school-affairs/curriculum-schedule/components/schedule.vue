<template>
  <view class="flex-stretch flex-column-plain relative">
    <view
      class="scroll-x w100 content-wrapper"
      :class="list && list.length > 0 ? '' : 'flex-stretch'"
    >
      <view :style="{ width: weekLength * 148 + 48 + 'rpx' }">
        <view class="flex flex-left bg-fill-default border-top border-line-default">
          <view
            class="w-48 h-88 font-content bold border-left border-right border-bottom border-line-default flex-column flex-center"
          >
            <view>节</view>
            <view>次</view>
          </view>
          <view
            v-for="date in dates"
            :key="date.week"
            class="h-88 w-148 border-right border-bottom border-line-default flex-column flex-center"
          >
            <view class="font-content bold">{{ date.week }}</view>
            <view class="font-secondary">{{ date.day }}</view>
          </view>
        </view>
        <template v-if="list && list.length > 0">
          <view v-for="(section, i) in list" :key="section.sectionType">
            <u-gap v-if="i > 0" height="8" bg-color="#f5f5f5" />
            <view
              v-for="(course, j) in section.sectionCourses"
              :key="course.startTime"
              class="flex flex-left"
              :class="i > 0 && j === 0 ? 'border-top border-line-default' : ''"
            >
              <view
                class="w-48 h-128 border-left border-right border-bottom border-line-default bg-fill-default flex-center font-content bold"
              >
                {{ sectionIndexes[`${i}_${j}`] }}
              </view>
              <view
                v-for="(date, k) in dates"
                :key="date.week"
                class="h-128 w-148 border-right border-bottom border-line-default relative"
                :style="{ background: getBackgroundColor(k, course.courseCells) }"
                @click="handleShowDetail(date, sectionIndexes[`${i}_${j}`], k, course.courseCells)"
              >
                <view v-if="getClassSwitched(k, course.courseCells)" class="class-switched">
                  <view class="bg"></view>
                  <text class="font-secondary color-white text">调</text>
                </view>
                <view v-if="getClassSubstitute(k, course.courseCells)" class="class-substitute">
                  <view class="bg"></view>
                  <text class="font-secondary color-white text">代</text>
                </view>
                <view class="h100 w100 flex-column flex-center">
                  <slot name="cell" :cell-data="getCellData(k, course.courseCells)" />
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>
    <slot name="footer"></slot>
    <view v-if="list && list.length === 0" class="empty-wrapper flex-center">
      <u-empty-custom mode="search" class="color-base" text="暂无数据" />
    </view>
  </view>
</template>
<script lang="ts" setup>
import { deepClone } from '@/utils/tools';
import dayjs from 'dayjs';
import { computed, unref } from 'vue';

const props = defineProps<{
  list?: any[];
  weekInfo: any;
  showColor?: boolean;
}>();
const emits = defineEmits(['showDetail']);
const weekTexts = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const weekLength = computed(() => {
  if (!props.weekInfo || !props.weekInfo.endDate || !props.weekInfo.startDate) {
    return 0;
  }

  const end = dayjs(props.weekInfo.endDate);
  return end.diff(props.weekInfo.startDate, 'day') + 1;
});

const sectionIndexes = computed(() => {
  const indexMap: any = {};
  let index = 0;
  props?.list?.forEach((ii: any, i: number) => {
    ii.sectionCourses.forEach((jj: any, j: number) => {
      index += 1;
      indexMap[`${i}_${j}`] = index;
    });
  });
  return indexMap;
});

const dates = computed(() => {
  const res: any[] = [];
  const start = dayjs(props.weekInfo.startDate);

  for (let i = 0; i < weekLength.value; i += 1) {
    res.push({
      week: weekTexts[i],
      day: start.add(i, 'day').format('MM-DD'),
    });
  }
  return res;
});
function getCellData(index: number, courseCells: any[]) {
  const list = unref(courseCells);
  const cellData = list.find(i => i.dayOfWeek === index + 1);
  return cellData ? deepClone(cellData) : null;
}
function getBackgroundColor(index: number, courseCells: any[]) {
  if (!props.showColor) {
    return '';
  }

  const cell = courseCells.find(i => i.dayOfWeek === index + 1);
  if (cell?.color) {
    return '#' + cell?.color;
  }
  return '';
}
function getClassSwitched(index: number, courseCells: any[]) {
  const cell = courseCells.find(i => i.dayOfWeek === index + 1);
  return cell?.courseType === 1;
}
function getClassSubstitute(index: number, courseCells: any[]) {
  const cell = courseCells.find(i => i.dayOfWeek === index + 1);
  return cell?.courseType === 2;
}
function handleShowDetail(date: any, courseIndex: number, index: number, courseCells: any[]) {
  const data = getCellData(index, courseCells);
  if (data) {
    data.week = date.week;
    data.day = date.day;
    data.courseIndex = courseIndex;
    emits('showDetail', data);
  }
}
</script>

<style lang="scss" scoped>
.class-switched,
.class-substitute {
  position: absolute;
  left: 0;
  top: 0;
  height: 56rpx;
  width: 56rpx;
  overflow: hidden;
  .bg {
    position: absolute;
    left: -40rpx;
    top: -40rpx;
    height: 80rpx;
    width: 80rpx;
    transform: rotate(45deg);
  }
  .text {
    position: absolute;
    top: 0;
    left: 2rpx;
  }
}
.class-switched .bg {
  background-color: #faad14;
}
.class-substitute .bg {
  background-color: #52c41a;
}
.content-wrapper {
  position: relative;
  z-index: 2;
}
.empty-wrapper {
  position: absolute;
  top: 90rpx;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
