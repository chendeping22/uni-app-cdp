<template>
  <view>
    <view class="dept-container" @click="handleSelectDept">
      <text class="font-content mr-xxs">{{ currentDept.deptName }}</text>
      <u-icon style="margin-left: 10rpx" name="arrow-down-fill" size="20" color="placeholder" />
    </view>
    <view class="progress-content">
      <view class="statistics-card">
        <DashboardDatePicker :mode="'Day'" :default-date="dateObj.value" @change="changeDateObj">
          <u-cell-group :border="false">
            <u-cell-item
              title-style="fontSize: 34rpx; color: #000000e0;"
              value-style="fontSize: 34rpx; color: #000000a6;"
              :border-bottom="false"
              title="统计时间"
              :value="dateObj.label"
            >
            </u-cell-item>
          </u-cell-group>
        </DashboardDatePicker>
        <view class="arc-progress-container">
          <ArcProgress
            :attendance="statisticsData.arrivedNum"
            :should-arrive="statisticsData.totalNum"
            :attendance-text="'出勤人数'"
            :should-arrive-text="'应到人数'"
          />
        </view>
      </view>
      <view class="progress-card">
        <!-- <view v-if="statisticsData?.dataList?.length > 1"> -->
        <view v-if="attendanceTimes.length > 1" class="tabs-box">
          <u-tabs
            v-model="currentAttendanceTab"
            :list="attendanceTimes"
            :is-scroll="false"
            @change="onTagsChange"
          />
        </view>
        <view v-if="staticItems.length" class="attendance-tips">
          <view class="attendance-tips-con">
            <view
              v-for="(item, index) in staticItems"
              :key="index"
              :class="`tag ${item.value === selectedAction.value ? 'tag-select' : ''}`"
              @click="handleActionChange(item)"
              >{{ `${item.label}(${tagsData?.[item.code] || 0})` }}</view
            >
          </view>
        </view>
        <u-gap height="30" bg-color="#fff"></u-gap>
        <CFrefreshScroll
          ref="refreshScrollRef"
          class-name="scroll-box"
          :fetch-data-func="fetchDataFunc"
          :empty-line="100"
          :page-size="15"
          :auto-mount="false"
        >
          <empty v-if="!exceptionData?.length" :content="`暂无${selectedAction?.label}数据`" />
          <view
            v-for="(item, index) in exceptionData"
            v-else
            :key="`${item.attendanceTime}_${index}`"
            class="static-item"
          >
            <StatisticsCardItem :item="item" :selected-action="selectedAction" />
          </view>
        </CFrefreshScroll>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { concat } from '@/utils/lodash-es';
import dayjs from 'dayjs';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import CFrefreshScroll from '../../components/c-refresh-scroll.vue';
import ArcProgress from '../components/arcProgress.vue';
import empty from '../components/empty.vue';
import StatisticsCardItem from '../components/statisticsCardItem.vue';
import { statisticsEnum } from '../constants/exceptionTypeEnum';
import type { IDataListItem, IStatisticsData } from '../services/employeeAttendance';
import {
  fetchStaffAttendanceAccount,
  fetchStaffAttendanceData,
} from '../services/employeeAttendance';
import DashboardDatePicker from '/src/components/dashboard-date-picker/index.vue';

const TabsItemsName: Record<number, string> = {
  0: '一',
  1: '二',
  2: '三',
};

type IDdeptData = {
  deptId: string;
  deptName: string;
};
interface Props {
  deptData: IDdeptData;
}
const props = withDefaults(defineProps<Props>(), {
  deptData: (): IDdeptData => ({
    deptId: '',
    deptName: '',
  }),
});
const currentAttendanceTab = ref(0);
const dateObj = ref();
const selectedAction = ref({ label: '全部', value: -1 });
const currentDept = ref<IDdeptData>({
  deptId: '',
  deptName: '',
});
const statisticsData = ref<IStatisticsData>({} as IStatisticsData);
// 当前考勤频次
const timer = ref(0);
// 异常人员数据
const exceptionData = ref<IDataListItem[]>([]);
const refreshScrollRef = ref(null as any);

// 统计类型
const staticItems = computed(() => {
  const itemAll = [
    {
      label: '全部',
      value: -1,
      code: 'totalNum',
    },
  ];
  return concat(itemAll, statisticsEnum);
});

const attendanceTimes = computed(() => {
  const items = (statisticsData?.value?.dataList || []).map((item, index) => ({
    name: `第${TabsItemsName[index]}次考勤`,
    value: index + 1,
  }));
  return items || [];
});

const tagsData = computed(() => {
  if (statisticsData?.value?.dataList?.length) {
    const itemData = statisticsData?.value?.dataList[timer.value];
    return itemData;
  }
  return [];
});

onBeforeMount(() => {
  dateObj.value = {
    value: dayjs(),
  };
  if (props.deptData && props.deptData.deptId) {
    currentDept.value = props.deptData;
  }
  uni.$on('onSelectDept', onSelectDept);
});

// 获取统计数据
const fetchData = async () => {
  const date = dayjs(dateObj.value.value).startOf('d').valueOf();
  const reqData = {
    attendanceDate: date,
    deptId: currentDept.value.deptId,
  };
  const res = await fetchStaffAttendanceAccount(reqData);
  statisticsData.value = res;
};
const onTagsChange = (val: number) => {
  timer.value = val;
  exceptionData.value = [];
  selectedAction.value = { label: '全部', value: -1 };
};

const changeDateObj = (date: any) => {
  dateObj.value = date;
  exceptionData.value = [];
  selectedAction.value = { label: '全部', value: -1 };
  loadData();
};

const handleActionChange = (actionItem: { value: number; label: string; colorType?: string }) => {
  if (selectedAction.value.value === actionItem?.value) {
    return;
  }
  selectedAction.value = actionItem;
  exceptionData.value = [];
  refreshScrollRef.value?.initData();
};

const fetchDataFunc = async (pager: any, loadType: string) => {
  const { pageSize, pageNum } = pager;
  const date = dayjs(dateObj.value.value).startOf('d').valueOf();
  const res = await fetchStaffAttendanceData({
    pageNum,
    pageSize,
    attendanceStatus: selectedAction.value?.value,
    attendanceDate: date,
    deptId: currentDept.value.deptId,
    frequency: timer.value + 1,
  });
  if (loadType === 'new') {
    exceptionData.value = [];
  }
  exceptionData.value.push(...(res?.result || []));
  return {
    pagination: { total: res.total },
    ...res,
  };
};
const handleSelectDept = () => {
  showSelector({
    type: SelectorTypeEnum.department,
    multiple: false,
    value: currentDept.value.deptId,
    callback: (value, data) => {
      console.log('res', data);
      loadData();
      currentDept.value = {
        deptName: data.name,
        deptId: data.id,
      };
    },
  });
};

watch(
  () => [timer.value],
  () => {
    loadData();
  },
);

//重新加载全部数据
function loadData() {
  fetchData();
  refreshScrollRef.value?.initData();
}

const onSelectDept = (item: { id: string; departmentName: string }) => {
  const { id, departmentName } = item;
  if (!departmentName) {
    return;
  }
  const data = { deptId: id, deptName: departmentName };
  currentDept.value = data;
  selectedAction.value = { label: '全部', value: -1 };
  timer.value = 0;
  statisticsData.value = { arrivedNum: 0, totalNum: 0, dataList: [] };
  fetchData();
};

onBeforeUnmount(() => {
  uni.$off('onSelectDept', onSelectDept);
});
</script>

<style lang="scss" scoped>
.progress-content {
  padding: 32rpx;
}
.progress-card {
  padding: 10rpx 32rpx 80rpx;
  background: #fff;
  justify-content: center;
  box-shadow: 0px 0px 40rpx 0px rgba(29, 33, 41, 0.05);
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.scroll-box {
  height: calc(100vh - 900rpx);
  overflow: auto;
}
.tabs-box {
  border-bottom: 2rpx solid #ededed;
}
.statistics-card {
  padding-bottom: 80rpx;
  background: #fff;
  justify-content: center;
  box-shadow: 0px 0px 40rpx 0px rgba(29, 33, 41, 0.05);
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}
.attendance-tips {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: auto;
  margin-top: 10rpx;
  margin-bottom: 20rpx;
}
.tag {
  margin-right: 20rpx;
  background: #f8f8f8;
  color: #4e5969;
  border: 2rpx solid #f5f5f5;
  padding: 0 16rpx;
  height: 48rpx;
  font-size: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10rpx;
}
.tag-select {
  background-color: #176bfb;
  color: #fff;
  border: 2rpx solid #176bfb;
}
.attendance-tips-con {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
}
.dept-container {
  padding: 24rpx 0;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
