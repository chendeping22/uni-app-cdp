<script setup lang="ts">
import { getSchemeDateInfo } from '@/app-class-evaluation/services/statistics';
import Checkmark from '@/app-class-evaluation/static/checkmark.svg';
import { schemeStore } from '@/app-class-evaluation/store/scheme-store';
import { getPageParams } from '@/utils/tools';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref } from 'vue';
import SchemeSelection from '../components/schemeSelection.vue';
import { getCurrent } from './utils';

const store = schemeStore();
const open = ref<boolean>(false);
const state = reactive<{
  schemes: any;
  timeType: string;
  monthInfoList: any[];
  weekInfoList: any[];
  current: number;
  startDate: string;
  endDate: string;
  schemesList: any[];
}>({
  schemes: {},
  timeType: 'week',
  monthInfoList: [],
  weekInfoList: [],
  current: 0,
  startDate: '',
  endDate: '',
  schemesList: [],
});
const onClose = () => {
  open.value = false;
};

const fetchData = async () => {
  try {
    const res: any = await getSchemeDateInfo({ schemeId: state.schemes.id });
    state.monthInfoList = res.monthInfoList.reverse();
    state.weekInfoList = res.weekInfoList.reverse();
    state.startDate = res.startDate;
    state.endDate = res.endDate;
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
  }
};

const handleChange = (item, idx) => {
  state.current = idx;
  store.$setWeekAndMonth({
    initialSchemeId: state.schemes.initialSchemeId,
    timeData: item,
    index: idx,
  });
  uni.navigateBack({ delta: 1 });
};
const schemeChange = async schemesCurrent => {
  await fetchData();
  state.current = getCurrent(
    state.timeType,
    state.timeType === 'week' ? state.weekInfoList : state.monthInfoList,
    state.startDate,
    state.endDate,
  );
  store.$setWeekAndMonthList({
    weekInfoList: state.weekInfoList,
    monthInfoList: state.monthInfoList,
    startDate: state.startDate,
    endDate: state.endDate,
  });
  store.$setSelectedSchemeMap(schemesCurrent);
  store.$setWeekAndMonth({
    initialSchemeId: schemesCurrent.initialSchemeId,
    timeData:
      state.timeType === 'week'
        ? state.weekInfoList[state.current]
        : state.monthInfoList[state.current],
    index: state.current,
  });

  uni.navigateBack({ delta: 1 });
};
onBeforeMount(() => {
  const pageParams = getPageParams();
  state.schemesList = store.schemeMap;
  state.schemes = store.selectedSchemeMap;
  state.timeType = pageParams.type;
  state.current = store.weekAndMonthMap.index;

  state.monthInfoList = store.weekAndMonthListMap.monthInfoList;
  state.weekInfoList = store.weekAndMonthListMap.weekInfoList;
  uni.setNavigationBarTitle({
    title: state.timeType === 'week' ? '选择周次' : '选择月次', // 新标题内容
  });
});
</script>

<template>
  <view class="selector-wrap">
    <view class="selector-wrap-header">
      <view class="header-top" @click="open = true">
        <view class="header-top-left">{{ state.schemes.name }}</view>
        <u-icon name="arrow-right" color="#7D7D7D" size="32" style="margin-top: 8rpx"></u-icon>
      </view>
      <view class="header-bottom">
        <view class="header-bottom-left">{{ state.schemes.schoolYearName || '/' }}</view>
        <view class="header-bottom-tag tag-green" v-if="state.schemes.enabled === 0">启用</view>
        <view class="header-bottom-tag tag-red" v-else>禁用</view>
      </view>
    </view>
    <view class="selector-list">
      <view
        @click="handleChange(item, idx)"
        class="selector-item"
        v-for="(item, idx) in state.timeType === 'week' ? state.weekInfoList : state.monthInfoList"
      >
        <view class="selector-item-left">
          <view class="selector-item-title">{{
            state.timeType === 'week' ? `第${item.week}周` : `${item.replace(/-/g, '年')}月`
          }}</view>
          <view v-if="state.timeType === 'week'" class="selector-item-time">{{
            `${item.startDate.replace(/-/g, '.')}-${
              dayjs(item.startDate).isSame(dayjs(item.endDate), 'year')
                ? item.endDate.slice(5).replace(/-/g, '.')
                : item.endDate.replace(/-/g, '.')
            }`
          }}</view>
        </view>
        <view style="width: 48rpx; height: 48rpx">
          <u-image
            v-show="state.current === idx"
            width="48rpx"
            height="48rpx"
            :src="Checkmark"
          ></u-image
        ></view>
      </view>
    </view>
    <SchemeSelection
      v-model="state.schemes"
      :list="state.schemesList"
      :open="open"
      @onClose="onClose"
      @onChange="schemeChange"
    ></SchemeSelection>
  </view>
</template>

<style lang="scss" scoped>
.selector-wrap-header {
  padding: 24rpx 32rpx;
  background: #fff;
  box-shadow: 0 4rpx 8rpx 0 #00000014;
}
.header-top,
.header-bottom {
  display: flex;
}
.header-top {
  margin-bottom: 6rpx;
  align-items: flex-start;
}
.header-top-left,
.header-bottom-left {
  flex: 1;
  margin-right: 16rpx;
}
.header-top-left {
  color: #000000e0;
  font-family: 'PingFang SC';
  font-size: 32rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 44rpx;
}
.header-bottom-left {
  color: #00000073;
  font-family: 'PingFang SC';
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 36rpx;
}
.header-bottom-tag {
  height: 48rpx;
  padding: 4rpx 16rpx;
  align-items: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  font-style: normal;
  font-weight: 400;
}
.tag-green {
  background: #f6ffed;
  color: #52c41a;
}
.tag-red {
  background: #fff1f0;
  color: #ff4d4f;
}
.selector-list {
  padding: 24rpx 32rpx;
  .selector-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    background: #fff;
    &:not(:last-child) {
      &::after {
        content: '';
        display: block;
        position: absolute;
        background: #f5f5f5;
        height: 2rpx;
        bottom: 0;
        left: 32rpx;
        right: 0;
      }
    }
    &:first-child {
      border-top-left-radius: 16rpx;
      border-top-right-radius: 16rpx;
    }
    &:last-child {
      border-bottom-left-radius: 16rpx;
      border-bottom-right-radius: 16rpx;
    }
    .selector-item-left {
      flex: 1;
    }
    .selector-item-title {
      color: #000000e0;
      font-family: 'PingFang SC';
      font-size: 32rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 44rpx;
    }
    .selector-item-time {
      color: #00000073;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
}
</style>
