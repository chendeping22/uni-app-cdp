<script setup lang="ts">
import {
  getRankingHonorStatisticsList,
  getRankingStatisticssList,
} from '@/app-class-evaluation/services/statistics';
import dayjs from 'dayjs';
import { find, omit } from 'lodash-es';
import { reactive, ref, watch } from 'vue';
import SchemeSelection from '../components/schemeSelection.vue';
import ClassList from './classList.vue';

const pages = getCurrentPages();
const p = pages[pages.length - 1] as any;
const eventChannel = p.getOpenerEventChannel();

const props = defineProps<{ schemesList: any[] }>();
const open = ref<boolean>(false);
const currentMonth = ref<number | string>(0);
const currentWeek = ref<number | string>(0);
const state = reactive<{
  loading: boolean;
  list: any[];
  schemes: {};
}>({
  loading: false,
  list: [],
  schemes: {},
});
const onClose = () => {
  open.value = false;
};
const getHonorList = async (params: {
  evaluationSchemeId: string;
  year: string;
  month: string;
  week: number;
}) => {
  try {
    const res = await getRankingHonorStatisticsList(params);
    state.list.forEach(m => {
      if (m.month === params.month) {
        m.childCycles.forEach(w => {
          if (w.week === params.week) {
            w.list = res;
          }
        });
      }
    });
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
const fetchData = async () => {
  const params = {
    evaluationSchemeId: state.schemes?.initialSchemeId,
  };
  try {
    state.loading = true;
    state.list = await getRankingStatisticssList(params);
    if (state.list.length) {
      getHonorList(omit(state.list?.[0]?.childCycles[0], ['endDate', 'startDate', 'type']));
    }
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
    uni.stopPullDownRefresh();
  }
};
const handleMonth = (monthData, idx) => {
  if (currentMonth.value === idx) {
    currentMonth.value = '';
  } else {
    currentMonth.value = idx;
    currentWeek.value = 0;
    getHonorList(omit(monthData.childCycles[0], ['endDate', 'startDate', 'type']));
  }
};
const handleWeek = (weekData, idx) => {
  if (currentWeek.value === idx) {
    currentWeek.value = '';
  } else {
    currentWeek.value = idx;
    getHonorList(omit(weekData, ['endDate', 'startDate', 'type']));
  }
};

watch(
  () => props.schemesList,
  () => {
    state.schemes = find(props.schemesList, { isDefault: true });
  },
  { immediate: true },
);
watch(
  () => state.schemes,
  newVal => {
    if (state.schemes?.initialSchemeId) {
      fetchData();
      currentMonth.value = 0;
      currentWeek.value = 0;
    }
  },
  { immediate: true },
);
</script>

<template>
  <view class="main-wrap">
    <view class="main-header" @click="open = true">
      <view class="main-header-left"> {{ state.schemes?.schoolYearName }} </view>
      <u-icon name="arrow-right" color="#7D7D7D" size="32"></u-icon>
    </view>
    <view class="main-content" v-if="state.list.length">
      <view class="month-wrap" v-for="(Mdata, mIdx) in state.list">
        <view class="month-header" @click="handleMonth(Mdata, mIdx)">
          <view class="month-header-text">{{ `${Mdata.year}年${Mdata.month}月` }}</view>
          <u-icon v-if="currentMonth === mIdx" name="arrow-down" color="#7D7D7D" size="32"></u-icon>
          <u-icon v-else name="arrow-up" color="#7D7D7D" size="32"></u-icon>
        </view>
        <template v-if="Mdata.childCycles.length && mIdx === currentMonth">
          <view class="week-wrap" v-for="(Wdata, wIdx) in Mdata.childCycles">
            <view class="week-header" @click="handleWeek(Wdata, wIdx)">
              <view class="week-header-text">{{
                `第${Wdata.week}周 ${Wdata.startDate.replace(/-/g, '.')}-${
                  dayjs(Wdata.startDate).isSame(dayjs(Wdata.endDate), 'year')
                    ? Wdata.endDate.slice(5).replace(/-/g, '.')
                    : Wdata.endDate.replace(/-/g, '.')
                }`
              }}</view>
              <u-icon
                v-if="mIdx === currentMonth && wIdx === currentWeek"
                name="arrow-down"
                color="#7D7D7D"
                size="32"
              ></u-icon>
              <u-icon v-else name="arrow-up" color="#7D7D7D" size="32"></u-icon
            ></view>
            <template v-if="mIdx === currentMonth && wIdx === currentWeek">
              <ClassList v-if="Wdata?.list && Wdata?.list.length" :list="Wdata?.list"></ClassList>
              <view class="no-data" v-else>
                <u-empty-custom
                  :text="[
                    '暂无数据',
                    `当前统计方式按【周发放荣誉】，统计周期为每周的周一至周日，计算结果将在当周的周日24：00自动统计。如显示“暂无数据”则统计时间还未到达。`,
                  ]"
                  card
                ></u-empty-custom> </view
            ></template>
          </view>
        </template>

        <!-- <ClassList v-if="false"></ClassList>
        <view class="no-data" v-else>
          <u-empty-custom
            :text="[
              '暂无数据',
              '当前统计方式按【月发放荣誉】。统计周期为每月的第一周至下个月第一个周一为一个统计周期，计算结果将在最后一周的周日24:00自动统计。',
            ]"
            card
          ></u-empty-custom>
        </view> -->
      </view>
    </view>
    <view v-else style="padding-top: 80rpx">
      <u-empty-custom text="暂无数据" mode="data"></u-empty-custom>
    </view>
    <SchemeSelection
      v-model="state.schemes"
      :list="schemesList"
      :open="open"
      @onClose="onClose"
    ></SchemeSelection>
  </view>
</template>

<style lang="scss" scoped>
.main-wrap {
  height: 100%;
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
  }
}
.main-content {
  height: 100%;
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}
.month-header,
.week-header {
  height: 96rpx;
  margin-left: 32rpx;
  padding-right: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
  &-text {
    color: #000000e0;
    font-family: 'PingFang SC';
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
  }
}
.no-data {
  padding: 48rpx 32rpx;
}
</style>
