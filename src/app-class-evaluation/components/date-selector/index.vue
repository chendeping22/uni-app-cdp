<template>
  <view class="date-selector">
    <view
      class="date-selector-left"
      :class="state.disabledPre ? 'disabled-color' : 'normal-color'"
      @click="handlePreDate"
    >
      <u-icon name="arrow-left" size="32" />
    </view>
    <view
      class="date-selector-center"
      :class="isDay ? 'date-selector-center-week' : ''"
      @click="handleOpenDate"
    >
      <view v-if="isDay && state.weekNum" class="date-selector-center-top"
        >第{{ state.weekNum }}周</view
      >
      <view class="date-selector-center-txt"
        ><text>{{ state.dateStr }}</text
        ><text v-if="isDay">{{ state.weekday }}</text></view
      >
    </view>
    <view
      class="date-selector-right"
      :class="state.disabledNext ? 'disabled-color' : 'normal-color'"
      @click="handleNextDate"
    >
      <u-icon name="arrow-right" size="32" />
    </view>
  </view>
  <u-picker
    mode="time"
    v-model="state.show"
    :params="dateParams"
    :default-time="dayjs(state.valueDate).format('YYYY-MM-DD')"
    :start-year="state.startYear"
    :end-year="state.endYear"
    confirm-text="确定"
    @cancel="state.show = false"
    @confirm="handlePickerConfirm"
    safe-area-inset-bottom
  ></u-picker>
</template>

<script setup lang="ts">
import {
  getSchemeDateInfoByDate,
  getSchemeDateInfoFilterComment,
} from '@/app-class-evaluation/services/date-selector';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { isNil, padStart } from 'lodash-es';
import { computed, onBeforeMount, reactive, watch } from 'vue';
import { DateTypeEnum, LimitTypeEnum } from './type';

const dayTime = 24 * 60 * 60 * 1000;

const props = defineProps({
  modelValue: {
    type: Number,
  },
  dateType: {
    type: String,
    default: 'day',
  },
  /** 起始日期的判断依据 */
  limitType: {
    type: String,
    default: LimitTypeEnum.Scheme,
  },
});

const emits = defineEmits(['update:modelValue', 'onChange']);

const state = reactive<{
  weekNum?: number;
  dateStr?: string;
  weekday?: string;
  show?: boolean;
  valueDate: number;
  startYear?: string;
  endYear?: string;
  startDayRange?: string;
  startMonthRange?: string;
  disabledPre?: boolean;
  disabledNext?: boolean;
  weekList?: Record<string, any>[];
  startDay?: string;
}>({
  weekNum: 0,
  dateStr: dayjs().format('MM.DD'),
  weekday: dayjs().format('ddd'),
  valueDate: dayjs(dayjs().format('YYYY-MM-DD')).valueOf(),
  startYear: dayjs().format('YYYY'),
  endYear: dayjs().format('YYYY'),
  disabledPre: true,
  disabledNext: true,
  startDayRange: dayjs().format('YYYY-MM-DD'),
  startMonthRange: dayjs().format('YYYY-MM'),
});

const isDay = computed(() => props.dateType === DateTypeEnum.Day);

const dateParams = computed(() => ({
  year: true,
  month: true,
  day: props.dateType === DateTypeEnum.Day,
  hour: false,
  minute: false,
  second: false,
  timestamp: true,
}));

const currentDayStr = computed(() => dayjs().format('YYYY-MM-DD'));

const currentMonStr = computed(() => dayjs().format('YYYY-MM'));

const startDate = computed(() => {
  const range = isDay.value ? state.startDayRange : state.startMonthRange;
  return range ? dayjs(range).valueOf() : dayjs().valueOf();
});

const endDate = computed(() => {
  const range = isDay.value ? currentDayStr.value : currentMonStr.value;
  return dayjs(range).valueOf();
});

const handleOpenDate = () => {
  state.show = true;
};

const handleEmit = (date?: number) => {
  const startMonth = state.startDay ? dayjs(state.startDay).format('YYYY-MM') : undefined;
  emits('update:modelValue', date);
  emits('onChange', {
    data: date,
    startRange: isDay.value ? state.startDay : startMonth,
  });
};

const handleFormat = (date: number, showToast?: boolean) => {
  if (date < startDate.value || date > endDate.value) {
    const type = isDay.value ? 'YYYY-MM-DD' : 'YYYY-MM';
    const start = isDay.value
      ? dayjs(state.startDayRange).format(type)
      : dayjs(state.startMonthRange).format(type);
    if (!showToast) return;
    if (props.limitType === LimitTypeEnum.Scheme) {
      showInfo('已超出可点评的日期范围');
      return;
    }
    if (props.limitType === LimitTypeEnum.Evaluate && state.startDay) {
      date < startDate.value && showInfo(`该时间无评价记录。请选择${start}后的日期`);
      date > endDate.value && showInfo('超出时间范围');
    }
    return;
  }
  state.valueDate = date;
  state.dateStr = isDay.value ? dayjs(date).format('MM.DD') : dayjs(date).format('YYYY.MM');
  state.weekday = dayjs(date).format('ddd');
  state.disabledPre = startDate.value ? date <= startDate.value : true;
  state.disabledNext = date >= endDate.value;
  if (isDay.value) {
    getWeekCount(dayjs(date).format('YYYY-MM-DD'));
  }
  handleEmit(date);
};

const handlePickerConfirm = (data: any) => {
  const date = data.timestamp * 1000;
  handleFormat(date, true);
};

const handlePreDate = () => {
  if (state.disabledPre) return;
  const preDay = state.valueDate - dayTime;
  const year = dayjs(state.valueDate).format('YYYY');
  const month = dayjs(state.valueDate).format('M');
  const newYear = +month - 1 < 1 ? +year - 1 : +year;
  const newMonth = +month - 1 < 1 ? 12 : padStart(`${+month - 1}`, 2, '0');
  const preData = isDay.value ? preDay : dayjs(`${newYear}-${newMonth}`).valueOf();
  handleFormat(preData, false);
};

const handleNextDate = () => {
  if (state.disabledNext) return;
  const nextDay = state.valueDate + dayTime;
  const year = dayjs(state.valueDate).format('YYYY');
  const month = dayjs(state.valueDate).format('M');
  const newYear = +month + 1 > 12 ? +year + 1 : +year;
  const newMonth = +month + 1 > 12 ? 1 : padStart(`${+month + 1}`, 2, '0');
  const nextData = isDay.value ? nextDay : dayjs(`${newYear}-${newMonth}`).valueOf();
  handleFormat(nextData, false);
};

const getWeekCount = (date?: string) => {
  const rangeWeek = state.weekList?.find(v => {
    const innerStart = v?.startDate
      ? dayjs(date).isAfter(v.startDate) || dayjs(date).isSame(v.startDate)
      : undefined;
    const innerEnd = v?.endDate
      ? dayjs(date).isBefore(v.endDate) || dayjs(date).isSame(v.endDate)
      : undefined;
    return innerStart && innerEnd;
  });
  state.weekNum = rangeWeek?.week || 0;
};

const fetchSchemeDateInfoByDate = async (data: string | number) => {
  try {
    uni.showLoading();
    const api =
      props.limitType === LimitTypeEnum.Scheme
        ? getSchemeDateInfoByDate
        : getSchemeDateInfoFilterComment;
    const res: any = await api(data);
    const start = res?.startDate ? res.startDate : dayjs().format('YYYY-MM-DD');
    state.startYear = dayjs(start).format('YYYY');
    state.startDayRange = start;
    state.startMonthRange = dayjs(start).format('YYYY-MM');
    state.startDay = res?.startDate;
    if (isDay.value) {
      state.weekList = res?.weekInfoList;
      getWeekCount(currentDayStr.value);
    }
    handleDisableDate();
    const currentDateVal = dayjs(currentDayStr.value).valueOf();
    handleEmit(currentDateVal);
  } catch (e: any) {
  } finally {
    uni.hideLoading();
  }
};
onBeforeMount(() => {
  fetchSchemeDateInfoByDate(currentDayStr.value);
});

const handleDisableDate = () => {
  const currentVal = isDay.value ? currentDayStr.value : currentMonStr.value;
  const startRange = isDay.value ? state.startDayRange : state.startMonthRange;
  const type = isDay.value ? 'day' : 'month';
  const compareStart = dayjs(currentVal).isBefore(startRange) || dayjs().isSame(startRange, type);
  // 时间限制取最早评价日期时，没有时间范围则禁止选择过往时间
  if (props.limitType === LimitTypeEnum.Evaluate) {
    state.disabledPre = startRange ? compareStart : true;
  }
  if (props.limitType === LimitTypeEnum.Scheme) {
    state.disabledPre = compareStart;
  }
  state.disabledNext = true;
};

watch(
  () => props.dateType,
  val => {
    const day = val === DateTypeEnum.Day;
    state.dateStr = day ? dayjs().format('MM.DD') : dayjs().format('YYYY.MM');
    const type = day ? currentDayStr.value : currentMonStr.value;
    state.valueDate = dayjs(type).valueOf();
    handleEmit(state.valueDate);
    handleDisableDate();
  },
);

watch(
  () => props.modelValue,
  val => {
    if (isNil(val)) return;
    state.valueDate = val;
  },
);
</script>

<style lang="scss" scoped>
.date-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  &-center {
    margin: 0 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &-top {
      color: $color-text-description;
    }
    &-txt {
      color: #000000a6;
      font-weight: 500;
      font-size: 26rpx;
    }
    &-week {
      width: 140rpx;
    }
  }
  &-left {
    color: $color-icon;
  }
}
.disabled-color {
  color: $color-text-disabled;
}
.normal-color {
  color: $color-icon;
}
</style>
