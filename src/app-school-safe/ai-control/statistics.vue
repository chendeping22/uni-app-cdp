<template>
  <view class="bg-fill-default">
    <c-tabs
      v-model:current="activeTabIndex"
      bg-color="white"
      :list="[{ name: '今日' }, { name: '本周' }, { name: '本月' }, { name: '全部' }]"
      @change="handleChangeTab"
    />
    <view class="scroll-content">
      <statistics-info
        :key="activeTabIndex"
        :total="statisticsInfoData.totalCount"
        :processed="statisticsInfoData.processedCount"
        :not-processed="statisticsInfoData.notProcessedCount"
      />
      <personnel-alarm
        :key="activeTabIndex"
        :data="personMonitorData.value"
        :total="statisticsInfoData.personMonitorCount"
        :denominator="statisticsInfoData.personDenominator"
      />
      <view class="data-box">
        <behavioral-alarm
          :key="activeTabIndex"
          :data="actionMonitorData.value"
          :total="statisticsInfoData.actionMonitorCount"
          :denominator="statisticsInfoData.actionDenominator"
        />
      </view>
      <alarm-ranking
        :key="activeTabIndex"
        :active-tab="activeTabIndex"
        :title="'告警地点排行'"
        :data="areaAlarmList.value"
        :denominator="areaDenominator"
        :alarm-type="'area'"
      />
      <view class="data-box">
        <alarm-ranking
          :key="activeTabIndex"
          :active-tab="activeTabIndex"
          :title="'告警时段分析'"
          :data="timeAlarmList.value"
          :denominator="areaDenominator"
          :alarm-type="'time'"
          :click-timer="clickTimer"
        />
      </view>
    </view>
    <tab-bar :current="0" />
  </view>
  <time-charts
    :time-range-modal="timeRangeModal"
    :info-data="timeInfo.data"
    :click-close="closePopup"
    :detail-data="detailData"
  />
</template>
<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, onMounted, reactive, ref } from 'vue';
import {
  IAlarmDataItem,
  IHourItem,
  IStatisticItem,
  getActionsStatistics,
  getAlarmAreaApi,
  getAlarmByHourApi,
  getAlarmTimeRangeApi,
  getFaceStatistics,
} from '../services/ai-control';
import AlarmRanking from './components/alarm-ranking/index.vue';
import BehavioralAlarm from './components/behavioral-alarm/index.vue';
import PersonnelAlarm from './components/personnel-alarm/index.vue';
import StatisticsInfo from './components/statistics-info/index.vue';
import TabBar from './components/tab-bar/index.vue';
import TimeCharts from './components/time-charts/index.vue';

const FORMAT = 'YYYY-MM-DD HH:mm:ss';
const activeTabIndex = ref(0);
const personMonitorData = reactive<{ value: IAlarmDataItem[] }>({
  value: [],
});
const actionMonitorData = reactive<{ value: IAlarmDataItem[] }>({
  value: [],
});
const areaAlarmList = reactive<{ value: IStatisticItem[] }>({
  value: [],
});
// 时段告警排行
const timeAlarmList = reactive<{ value: IStatisticItem[] }>({
  value: [],
});
const areaDenominator = ref(0);
const timeDenominator = ref(0);
const timeRangeModal = ref(false);
const timeInfo = reactive<{ data: { title: number; value: string } }>({
  data: { title: 0, value: '' },
});
const detailData = ref<IHourItem>({} as IHourItem);

const reqDate = () => {
  let startTime: string | null = dayjs().startOf('day').format(FORMAT);
  let endTime: string | null = dayjs().endOf('day').format(FORMAT);
  switch (activeTabIndex.value) {
    case 0:
      startTime = dayjs().startOf('day').format(FORMAT);
      endTime = dayjs().endOf('day').format(FORMAT);
      break;
    case 1:
      startTime = dayjs().startOf('week').format(FORMAT);
      endTime = dayjs().endOf('week').format(FORMAT);
      break;
    case 2:
      startTime = dayjs().startOf('month').format(FORMAT);
      endTime = dayjs().endOf('month').format(FORMAT);
      break;
    default:
      startTime = null;
      endTime = null;
      break;
  }
  return { startTime, endTime };
};

// 获取告警区域排行 4+1
const fetchAreaAlarmData = async () => {
  areaDenominator.value = 0;
  areaAlarmList.value = [];
  const { startTime, endTime } = reqDate();
  const reqData = {
    top: 5,
    startDate: startTime,
    endDate: activeTabIndex.value === 3 ? null : endTime,
  };
  const res = await getAlarmAreaApi(reqData);
  let monitorCount = 0;
  if (res?.length) {
    res.forEach(({ value }) => {
      monitorCount += value;
    });
  }
  areaDenominator.value = monitorCount;
  areaAlarmList.value = areaAlarmList.value.concat(res || []);
};

// 告警时段排行
const fetchAlarmTimeData = async () => {
  const { startTime, endTime } = reqDate();
  const reqData = {
    startDate: startTime,
    endDate: endTime,
  };
  let monitorCount = 0;
  let mergeData: IStatisticItem[] = [];
  let mergeNum = 0;
  const lastData: IStatisticItem[] = [];
  const res = await getAlarmTimeRangeApi(reqData);
  if (res?.length) {
    res.forEach(({ label, value }) => {
      if (['1', '2', '3', '4', '5', '6'].includes(label)) {
        mergeNum += value;
      } else {
        lastData.push({
          label: `${Number(label) - 1}~${label}`,
          value,
          key: [Number(label) - 1],
        });
      }
      monitorCount += value;
    });
    mergeData = [{ label: '0~6', value: mergeNum, key: [0, 1, 2, 3, 4, 5] }].concat(lastData);
  }
  timeDenominator.value = monitorCount;
  timeAlarmList.value = mergeData;
};

const getPageData = async () => {
  const { startTime, endTime } = reqDate();
  actionMonitorData.value = [];
  const resPersonData = await getFaceStatistics(startTime, endTime);
  const resActionData = await getActionsStatistics(startTime, endTime);
  fetchAlarmTimeData();
  fetchAreaAlarmData();
  personMonitorData.value = resPersonData;

  actionMonitorData.value = resActionData.map(item => {
    item.value = item.total;

    return item;
  });
};

const statisticsInfoData = computed(() => {
  let processedCount = 0;
  let notProcessedCount = 0;
  let personMonitorCount = 0;
  let personDenominator = 0;
  let actionMonitorCount = 0;
  let actionDenominator = 0;

  personMonitorData.value.forEach(item => {
    const { total, processed, notProcessed } = item;

    processedCount += processed;
    notProcessedCount += notProcessed;

    personMonitorCount += total;
    if (personDenominator < total) {
      personDenominator = total;
    }
  });
  actionMonitorData.value.forEach(item => {
    const { total, processed, notProcessed } = item;
    processedCount += processed;
    notProcessedCount += notProcessed;
    actionMonitorCount += total;
    if (actionDenominator < total) {
      actionDenominator = total;
    }
  });

  return {
    totalCount: personMonitorCount + actionMonitorCount,
    processedCount,
    notProcessedCount,
    personMonitorCount,
    personDenominator,
    actionMonitorCount,
    actionDenominator,
  };
});

const handleChangeTab = (inx: number) => {
  activeTabIndex.value = inx;
  getPageData();
};

// 告警时段 -- 小时详情
const fetchDetailsByHours = async (hours: number[] | undefined) => {
  let startTime = dayjs().startOf('day').format(FORMAT);
  let endTime = dayjs().endOf('day').format(FORMAT);

  if (activeTabIndex.value === 1) {
    startTime = dayjs().startOf('week').format(FORMAT);
    endTime = dayjs().endOf('week').format(FORMAT);
  }
  if (activeTabIndex.value === 2) {
    startTime = dayjs().startOf('month').format(FORMAT);
    endTime = dayjs().endOf('month').format(FORMAT);
  }
  const reqData = {
    startDate: startTime,
    endDate: endTime,
    hours,
  };
  const res = await getAlarmByHourApi(reqData);
  detailData.value = res || {};
};

const clickTimer = (item: IStatisticItem) => {
  fetchDetailsByHours(item?.key);
  timeInfo.data = {
    title: item?.value,
    value: `${item?.label}点`,
  };
  timeRangeModal.value = true;
};

const closePopup = () => {
  timeRangeModal.value = false;
  detailData.value = {
    alarmTypeDataList: [],
    spaceDataList: [],
  };
};

onMounted(() => {
  getPageData();
});
</script>

<style lang="scss" scoped>
.scroll-content {
  width: 100%;
  height: calc(100vh - 88rpx - var(--status-bar-height));
  padding: 0 32rpx;
  padding-bottom: $ui-gap-large * 6;
  overflow: auto;
  .data-box {
    margin: 24rpx 0;
  }
  .info {
    display: flex;
  }
  .tags {
    display: block;
    margin-bottom: $ui-gap-large;
  }
}
</style>
