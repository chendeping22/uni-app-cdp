<template>
  <page class="home-page" custom-overflow="visible">
    <view class="detail-header-box" :style="{ height: 524 + statusBarHeight * 2 + 'rpx' }">
      <view class="detail-header">
        <view :style="{ height: statusBarHeight * 2 + 'rpx' }"></view>
        <u-image
          class="bg-image"
          width="100%"
          :height="348 + statusBarHeight * 2 + 'rpx'"
          :src="bg_Invitation"
          :show-loading="false"
          :fade="false"
        ></u-image>
        <view class="detail-header-nav">
          <u-image
            @click="goBack"
            :src="arrowLeft"
            width="48rpx"
            height="48rpx"
            :show-loading="false"
            :fade="false"
          ></u-image>
          <view class="detail-header-title">{{ state.totalSource.className }}</view>
          <view></view>
        </view>
        <view class="detail-header-content">
          <view class="header-left">
            <view class="header-left-name">{{ state.totalSource.className || '/' }}</view>
            <view class="header-left-person">
              <view class="header-left-teacher">
                <view class="header-left-type">班主任</view>
                <view class="header-left-txt">{{ state.totalSource.headTeacherNames || '/' }}</view>
              </view>
              <view style="flex-shrink: 0">
                <view class="header-left-type">学生</view>
                <view class="header-left-txt">{{ state.totalSource.classStudents || 0 }}人</view>
              </view>
            </view>
          </view>
          <switch-grade
            v-model:value="state.gradeSelect"
            :multiple="false"
            :is-class="true"
            type="report"
          >
            <template #trigger="{ open }">
              <view class="header-right" @click="open">
                <u-image
                  width="32rpx"
                  height="32rpx"
                  :src="Transfer"
                  style="margin-right: 8rpx"
                ></u-image
                >切换班级</view
              >
            </template>
          </switch-grade>
        </view>
      </view>
      <view style="background: #fff">
        <u-tabs :list="list" :is-scroll="false" v-model="current" @change="change"></u-tabs>
        <view class="list-filter">
          <view class="list-filter-item">
            <date-selector-with-type
              v-if="state.timeType"
              :type="state.timeType"
              :defaultValue="state.defaultValue"
              @change="changeDate"
            ></date-selector-with-type>
          </view>
          <target-popup
            v-model:value="state.ruleIds"
            style="flex: 2"
            @change="changeType"
            :list="state.indicatorList"
          ></target-popup>
          <evaluator-selector
            v-model:value="state.evaluationIds"
            style="flex: 2"
            @change="changeEvaluator"
            :evaluator-data="state.evaluatorData"
          ></evaluator-selector>
        </view> </view
    ></view>
    <view
      class="detail-header-placeholder"
      :style="{
        height: 524 + statusBarHeight * 2 + 'rpx',
      }"
    ></view>
    <view class="scroll-view">
      <template v-if="current === 0">
        <StatisticalTotal :type="state.type" :totalSource="state.totalSource"></StatisticalTotal>
        <StatisticalAnalysis
          :scrollTop="scrollTop"
          :sourceData="state.analyseSource"
        ></StatisticalAnalysis>
      </template>
      <template v-if="current === 1">
        <template v-if="state.recordList.length">
          <EvaluationRecords :list="state.recordList"></EvaluationRecords>
          <u-loadmore
            :status="state.status"
            margin-top="48"
            margin-bottom="48"
            @loadmore="loadMore"
          />
        </template>
        <view v-else style="padding-top: 48rpx">
          <u-empty-custom v-if="empty" text="暂无数据" mode="data"></u-empty-custom>
        </view> </template
    ></view>
  </page>
</template>

<script setup lang="ts">
import DateSelectorWithType from '@/app-class-evaluation/components/date-selector-with-type/index.vue';
import StatisticalAnalysis from '@/app-class-evaluation/components/statistical-analysis/index.vue';
import TargetPopup from '@/app-class-evaluation/components/target-popup/index.vue';
import {
  ITotalScore,
  getEvaluationRecords,
  getEvaluators,
  getIndicators,
  getStatisticAnalyse,
  getStatisticTotal,
} from '@/app-class-evaluation/services/report';
import arrowLeft from '@/app-class-evaluation/static/arrow_left.svg';
import bg_Invitation from '@/app-class-evaluation/static/bg_Invitation.svg';
import Transfer from '@/app-class-evaluation/static/transfer.svg';
import { getPageParams, log } from '@/utils/tools';
import { onPageScroll, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { concat, filter, flattenDeep, map } from 'lodash-es';
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue';
import SwitchGrade from '../../../components/switch-grade/index.vue';
import EvaluationRecords from './evaluation-records.vue';
import EvaluatorSelector from './evaluator-selector.vue';
import StatisticalTotal from './statistical-total.vue';

const state = reactive<{
  classId: string;
  gradeSelect: any;
  loading: boolean;
  totalSource: ITotalScore;
  analyseSource: any;
  startDate: string;
  endDate: string;
  indicatorList: any[];
  evaluatorData: any;
  pageNum: number;
  pageSize: number;
  recordList: any[];
  type: number;
  evaluationYear: number;
  evaluationMonth: number;
  timeType: string;
  defaultValue: string;
  evaluationIds: any[];
  ruleIds: any[];
  status: string;
  total: number;
}>({
  classId: '',
  gradeSelect: {},
  loading: false,
  totalSource: {},
  analyseSource: null,
  startDate: '2024-07-01',
  endDate: '2024-07-13',
  indicatorList: [],
  evaluatorData: { studentVOS: [], teacherVOS: [] },
  pageNum: 1,
  pageSize: 15,
  recordList: [],
  type: 0,
  evaluationYear: 0,
  evaluationMonth: 0,
  timeType: '',
  defaultValue: dayjs().format('YYYY-MM-DD'),
  evaluationIds: [],
  ruleIds: [],
  status: 'loadmore',
  total: 0,
});
// insert statusbar
const statusBarHeight = ref();
const scrollTop = ref<number>(1);

onPageScroll(e => {
  scrollTop.value = e.scrollTop;
});
onMounted(() => {
  //获取手机系统信息
  const info = uni.getSystemInfoSync();
  log('systemInfo : ', info);
  // #ifdef APP-PLUS
  const agentInfo = plus.navigator.getUserAgent();
  log('agentInfo : ', agentInfo);
  // #endif
  //设置状态栏高度
  statusBarHeight.value = info.statusBarHeight;
});
const goBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};
const empty = computed(() => {
  return state.status !== 'loading' && state.pageNum === 1 && state.recordList.length === 0;
});
const list = [{ name: '统计分析' }, { name: '评价记录' }];
const current = ref<number>(0);
const change = (index: number) => {
  console.log('index', index);
};

const fetchData = async () => {
  const params = {
    classId: state.classId,
    type: state.type,
    ...(state.type === 1
      ? {
          evaluationYear: state.evaluationYear,
          evaluationMonth: state.evaluationMonth,
        }
      : {
          startDate: state.startDate,
          endDate: state.endDate,
        }),

    ...(filter(state.evaluationIds, i => i !== '').length
      ? { evaluationIds: filter(state.evaluationIds, i => i !== '') }
      : {}),
    ...(state.ruleIds.length ? { ruleIds: state.ruleIds } : {}),
  };
  try {
    state.loading = true;
    state.totalSource = await getStatisticTotal(params);
    state.analyseSource = await getStatisticAnalyse(params);
    uni.setNavigationBarTitle({ title: state.totalSource.className });
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
  }
};
const fetchFilterData = async () => {
  const params = {
    clazzId: state.classId,
    start: state.startDate,
    end: state.endDate,
  };
  try {
    state.indicatorList = await getIndicators(params);
    state.evaluatorData = await getEvaluators(params);
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.loading = false;
  }
};

const fetchRecords = async () => {
  const params = {
    classId: state.classId,
    pageNum: state.pageNum,
    pageSize: state.pageSize,
    startTime: state.startDate,
    endTime: state.endDate,
    ...(state.evaluationIds.length ? { userIdList: state.evaluationIds } : {}),
    ...(state.ruleIds.length ? { primaryIndicatorList: state.ruleIds } : {}),
  };
  try {
    state.status = 'loading';
    const res = await getEvaluationRecords(params);
    if (state.pageNum === 1) {
      state.recordList = [];
    }
    state.recordList = concat(
      state.recordList,
      flattenDeep(map(res.records, item => item.evaluationRecordList)),
    );
    state.total = res.total || 0;
  } catch (error: any) {
    uni.showToast({
      title: error?.desc || '请求数据出错',
      icon: 'none',
      mask: false,
      duration: 3000,
    });
  } finally {
    state.status = state.recordList.length >= state.total ? 'nomore' : 'loadmore';
    state.loading = false;
  }
};
const common = () => {
  fetchData();
  fetchFilterData();
  fetchRecords();
  uni.stopPullDownRefresh();
};
const changeDate = value => {
  state.evaluationIds = [];
  state.ruleIds = [];
  if (value.type === 1) {
    state.evaluationYear = value.evaluationYear;
    state.evaluationMonth = value.evaluationMonth;
  }
  state.startDate = value.startDate;
  state.endDate = value.endDate;
  state.type = value.type;
  common();
};
const changeType = value => {
  common();
};
const changeEvaluator = value => {
  common();
};
onBeforeMount(() => {
  const pageParams = getPageParams();
  const { id, type, value, tab } = pageParams;
  state.timeType = type || 'week';
  state.defaultValue = value;
  state.classId = id;
  state.gradeSelect = { id };
  current.value = tab || 0;
});
watch(
  () => state.gradeSelect,
  () => {
    if (state.classId != state.gradeSelect.id) {
      state.classId = state.gradeSelect.id;
      common();
    }
  },
);
const loadMore = () => {
  if (state.status === 'loadmore' && current.value === 1) {
    state.pageNum = state.pageNum + 1;
    fetchRecords();
  }
};
// 上拉加载
onReachBottom(() => {
  loadMore();
});

onPullDownRefresh(() => {
  state.pageNum = 1;
  common();
});
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.detail-header-box {
  position: fixed;
  z-index: 996;
  width: 100%;
  background: #fff;
}
.bg-image {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -1;
}
.detail-header {
  width: 100%;
  color: $color-text-inverse;
  position: relative;
  &-content {
    padding: 48rpx 48rpx 32rpx;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    overflow: hidden;
  }
  &-nav {
    // margin-top: 96rpx;
    position: relative;
    padding: 0 32rpx;
    height: 96rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &-title {
    position: absolute;
    left: 70px;
    right: 70px;
    color: #ffffff;
    text-align: center;
    font-family: 'PingFang SC';
    font-size: 32rpx;
    font-style: normal;
    font-weight: bold;
    line-height: 60rpx;
  }
  &-placeholder {
    flex-shrink: 0;
  }
}
.header-left {
  margin-right: 32rpx;
  flex: 1;
  overflow: hidden;
  &-name {
    font-size: 44rpx;
    margin-bottom: 32rpx;
    font-weight: 500;
  }
  &-person {
    display: flex;
  }
  &-teacher {
    margin-right: 64rpx;
    overflow: hidden;
  }
  &-type {
    font-size: 26rpx;
    opacity: 0.8;
    margin-bottom: 8rpx;
  }
  &-txt {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.header-right {
  height: 64rpx;
  padding: 16rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  color: #fff;
  background: #ffffff3d;
  box-shadow: 0 2rpx 4rpx 0 #0000000a;
}
.list-filter {
  padding: 0 16rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  background: #fff;
  &-item {
    display: flex;
    justify-content: center;
    flex: 2;
    margin-left: 16rpx;
    color: $color-text;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 400;
    overflow: hidden;
    &-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }
    &-down {
      margin-left: 8rpx;
    }
    &:first-child {
      margin-left: 0;
    }
  }
}
.scroll-view {
  padding: 0 32rpx 24rpx;
}

:deep(.table-wrap) {
  padding: 0 32rpx;
  .u-table {
    border-radius: 16rpx !important;
    border-right: 2rpx solid rgb(225, 225, 225) !important;
    overflow: hidden;
  }
  .u-th {
    height: 68rpx;
    color: #00000073;
    font-family: 'PingFang SC';
    font-size: 26rpx;
    font-style: normal;
    font-weight: 500;
  }
  .u-th,
  .u-td {
    overflow: hidden !important;
    border-right: none !important;
  }
  .u-td {
    height: 88rpx;
    color: #000000a6;
    font-family: 'PingFang SC';
    font-size: 30rpx;
    font-style: normal;
    font-weight: 400;
  }
}

:deep(.u-drawer-bottom) {
  background: $color-bg-layout;
}
</style>
