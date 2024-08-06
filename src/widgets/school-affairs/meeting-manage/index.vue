<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @pullDownRefresh="fetchList"
    @head-click="handleJump()"
    @show="handleOnMount"
  >
    <view v-if="true" class="content-top">
      <tmt-calendar
        :point-lists="hasMeetingPoint"
        :show="false"
        @changeDate="changeDate"
      ></tmt-calendar>
      <meeting-list :meetting-list="meettingList" />
    </view>
    <u-empty-custom
      v-else
      style="margin-top: 60rpx"
      card
      bg-type="fill-light"
      type="mini"
      class-name="mt-b ptb-b"
      text="暂无数据"
    />
  </widget-card>
</template>

<script lang="ts" setup>
import { meetingPoint, meetingPointDay } from '@/services/widgets';
import { ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';
import { onMounted, ref } from 'vue';
import meetingList from './components/meeting-list.vue';
import tmtCalendar from './components/tmt-calendar.vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}
const props = withDefaults(defineProps<IProps>(), {});
console.log('🚀 ~ props:', props);
const isLoad = ref(true);
const meettingList = ref<any>([]);
const getCurrentDayMeetingData = async d => {
  const date = {
    dateTime: dayjs(d).valueOf(),
  };
  const list = await meetingPointDay(date);
  //截取前三个展示
  meettingList.value = list.slice(0, 3);
};
const changeDate = async e => {
  const date = e.year + '-' + e.month + '-' + e.day;
  uni.setStorageSync('currentDate', date);
  getCurrentDayMeetingData(date);
};
const getCurrentMonthBeginAndEnd = (currentYear: any, currentMonth: any) => {
  const endDate = dayjs(`${currentYear}-${currentMonth}-01`).endOf('month').valueOf();
  const beginDate = dayjs(`${currentYear}-${currentMonth}-01`).startOf('month').valueOf();
  return {
    beginDate,
    endDate,
  };
};
const hasMeetingPoint = ref([]);
const getCurrentMonth = async (year: any, month: any) => {
  const params = getCurrentMonthBeginAndEnd(year, month);
  const result = (await meetingPoint(params)) as any;
  const data = result.filter(item => item.hasFlag);
  hasMeetingPoint.value = data.map(item => {
    return item.dayStr;
  });
  console.log('🚀 ~ getCurrentMonth ~ hasMeetingPoint.value:', hasMeetingPoint.value);
};

const fetchList = () => {
  getCurrentMonth(dayjs().format('YYYY'), dayjs().format('M'));
};

const handleJump = () => {
  const baseUrl = 'pages/meeting/meetingManage/index';
  const url = baseUrl;
  goToWebView(ETargetType.TargetTypeRelativeH5AtLowCode, url);
};
const handleOnMount = () => {
  getCurrentDayMeetingData(uni.getStorageSync('currentDate'));
};
onMounted(() => {
  fetchList();
});
</script>

<style lang="scss" scoped>
.content-top {
  padding-bottom: 30rpx;
}
</style>
