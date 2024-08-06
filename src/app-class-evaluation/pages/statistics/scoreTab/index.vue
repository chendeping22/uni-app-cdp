<script setup lang="ts">
import { getStatisticAnalyse } from '@/app-class-evaluation/services/report';
import { getSchemeDateInfo } from '@/app-class-evaluation/services/statistics';
import Transfer from '@/app-class-evaluation/static/transfer.svg';
import { schemeStore } from '@/app-class-evaluation/store/scheme-store';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, watch } from 'vue';
import StatisticalAnalysis from '../../../components/statistical-analysis/index.vue';
import { getCurrent } from './utils';

const props = defineProps<{ scrollTop: number }>();
const store = schemeStore();
const state = reactive<{
  loading: boolean;
  list: any[];
  schemes: any;
  timeType: string;
  monthInfoList: any[];
  weekInfoList: any[];
  info: string;
  analyseSource: any[];
  current: number;
  startDate: string;
  endDate: string;
  initialSchemeId: string;
}>({
  loading: false,
  list: [],
  schemes: {},
  timeType: 'week',
  monthInfoList: [],
  weekInfoList: [],
  info: '',
  analyseSource: [],
  current: 0,
  startDate: '',
  endDate: '',
  initialSchemeId: '',
});

const fetchAnalyData = async () => {
  try {
    const params = {
      initialSchemeId: state.initialSchemeId,
      type: state.timeType === 'week' ? 0 : 1,
      ...(state.timeType === 'week'
        ? {
            startDate: store.weekAndMonthMap.timeData.startDate,
            endDate: store.weekAndMonthMap.timeData.endDate,
          }
        : {
            evaluationYear: store.weekAndMonthMap.timeData.split('-')[0],
            evaluationMonth: store.weekAndMonthMap.timeData.split('-')[1],
          }),
    };
    const res: any = await getStatisticAnalyse(params);
    state.analyseSource = res;
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    uni.stopPullDownRefresh();
  }
};

const fetchData = async () => {
  try {
    const res: any = await getSchemeDateInfo({ schemeId: state.schemes.id });
    state.monthInfoList = res.monthInfoList.reverse();
    state.weekInfoList = res.weekInfoList.reverse();
    state.startDate = res.startDate;
    state.endDate = res.endDate;
    // 存储周月数据
    store.$setWeekAndMonthList({
      monthInfoList: state.monthInfoList,
      weekInfoList: state.weekInfoList,
      startDate: state.startDate,
      endDate: state.endDate,
    });
    // 获取
    state.current = getCurrent(
      state.timeType,
      state.timeType === 'week' ? state.weekInfoList : state.monthInfoList,
      res.startDate,
      res.endDate,
    );
    store.$setWeekAndMonth({
      initialSchemeId: state.initialSchemeId,
      timeData:
        state.timeType === 'week'
          ? state.weekInfoList[state.current]
          : state.monthInfoList[state.current],
      index: state.current,
    });
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    uni.stopPullDownRefresh();
  }
};

const selectTime = () => {
  uni.navigateTo({
    url: `/app-class-evaluation/pages/statistics/scoreTab/weekMonthSelect?type=${state.timeType}`,
  });
};

const timeTypeChange = () => {
  state.timeType = state.timeType === 'week' ? 'month' : 'week';
  state.current = getCurrent(
    state.timeType,
    state.timeType === 'week' ? state.weekInfoList : state.monthInfoList,
    state.startDate,
    state.endDate,
  );
  store.$setWeekAndMonth({
    initialSchemeId: state.initialSchemeId,
    timeData:
      state.timeType === 'week'
        ? state.weekInfoList[state.current]
        : state.monthInfoList[state.current],
    index: state.current,
  });
};

watch(
  () => store.weekAndMonthMap,
  () => {
    if (store.weekAndMonthMap) {
      const { timeData, initialSchemeId } = store.weekAndMonthMap;
      state.initialSchemeId = initialSchemeId;
      state.info =
        state.timeType === 'week'
          ? `第${timeData.week}周 ${timeData.startDate.replace(/-/g, '.')}-${
              dayjs(timeData.startDate).isSame(dayjs(timeData.endDate), 'year')
                ? timeData.endDate.slice(5).replace(/-/g, '.')
                : timeData.endDate.replace(/-/g, '.')
            }`
          : `${timeData.replace(/-/g, '年')}月`;
      fetchAnalyData();
    }
  },
);

watch(
  () => store.weekAndMonthListMap,
  () => {
    if (store.weekAndMonthListMap) {
      const { weekInfoList, monthInfoList, startDate, endDate } = store.weekAndMonthListMap;
      state.weekInfoList = weekInfoList;
      state.monthInfoList = monthInfoList;
      state.startDate = startDate;
      state.endDate = endDate;
    }
  },
);

watch(
  () => store.selectedSchemeMap,
  newV => {
    if (newV) {
      state.schemes = store.selectedSchemeMap;
    }
  },
);

onBeforeMount(() => {
  state.schemes = store.selectedSchemeMap;
  state.initialSchemeId = store.selectedSchemeMap.initialSchemeId;
  fetchData();
});
</script>

<template>
  <view class="main-wrap">
    <view class="main-header">
      <view class="main-header-left" @click="selectTime"
        ><view>{{ state.info }}</view
        ><u-icon name="arrow-down" color="#7D7D7D" size="32" style="margin-left: 16rpx"></u-icon>
      </view>
      <view class="main-header-right" @click="timeTypeChange">
        <u-image width="32rpx" height="32rpx" :src="Transfer" style="margin-right: 8rpx"></u-image
        >{{ state.timeType === 'week' ? '按周' : '按月' }}</view
      >
    </view>
    <StatisticalAnalysis
      :scrollTop="scrollTop"
      :source-data="state.analyseSource"
    ></StatisticalAnalysis>
  </view>
</template>

<style lang="scss" scoped>
.main-wrap {
  padding: 24rpx 32rpx;
}

.main-header {
  height: 96rpx;
  padding: 24rpx 32rpx;
  display: flex;
  justify-content: space-between;
  border-radius: 16rpx;
  background: #fff;
  align-items: center;
  &-left {
    flex: 1;
    display: flex;
    font-size: 32rpx;
    font-style: normal;
    color: #000000e0;
    .title-bold {
      font-weight: 550;
    }
  }
  &-right {
    height: 64rpx;
    padding: 16rpx;
    display: flex;
    align-items: center;
    border-radius: 16rpx;
    background: $color-primary;
    color: #fff;
    &:hover {
      background: $primary-hover;
    }
  }
}
</style>
