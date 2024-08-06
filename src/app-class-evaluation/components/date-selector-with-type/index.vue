<template>
  <slot name="trigger" :open="open">
    <view class="date-trigger" @click="open">
      <text class="date-trigger-title footnote-regular">{{ state.label }}</text>
      <u-image
        v-show="state.label"
        class="date-trigger-down"
        width="32rpx"
        height="32rpx"
        :fade="false"
        :show-loading="false"
        :src="arrow_down_filed"
      >
      </u-image>
    </view>
  </slot>

  <u-popup
    v-model="show"
    mode="bottom"
    safe-area-inset-bottom
    @close="close"
    :closeable="false"
    :border-radius="24"
  >
    <view class="u-flex date-popup-header" style="position: relative">
      <view class="date-popup-cancel body-regular" @click="close">取消</view>
      <view class="date-popup-title headline-regular">时间选择</view>
      <view class="date-popup-submit body-regular" @click="onOk">确定</view>
    </view>
    <view class="u-flex date-popup-wrapper">
      <view class="date-popup-filter">
        <view
          v-for="item in typeList"
          :class="['item', state.curType === item.value ? 'selected' : '']"
          @click="state.curType = item.value"
        >
          <view v-if="state.curType === item.value" class="icon"></view>
          <view class="text">{{ item.label }}</view>
        </view>
      </view>

      <view class="date-popup-content" v-if="state.startDate">
        <date-picker
          v-show="state.curType === 'day'"
          type="day"
          :end="state.endDate"
          :start="state.startDate"
          @moving="onMoving"
          v-model:value="values.day"
        ></date-picker>
        <date-picker
          v-show="state.curType === 'month'"
          type="month"
          :end="state.endDate"
          :start="state.startDate"
          v-model:value="values.month"
          @moving="onMoving"
        ></date-picker>
        <date-picker
          v-if="state.weekList.length"
          v-show="state.curType === 'week'"
          v-model:value="values.week"
          indicatorHeight="68px"
          :list="weekList"
          @moving="onMoving"
        ></date-picker>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { getSchemeDateInfoByDate } from '@/app-class-evaluation/services/date-selector';
import arrow_down_filed from '@/app-class-evaluation/static/arrow_down_filed.svg';
import dayjs from 'dayjs';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import DatePicker from './date-picker.vue';

const typeList = [
  { label: '按天', value: 'day' },
  { label: '按周', value: 'week' },
  { label: '按月', value: 'month' },
];

const typeMap = {
  week: 0,
  month: 1,
  day: 2,
};

const propsTypeMap = {
  week: 1,
  month: 2,
};

const props = defineProps<{
  type: string;
  defaultValue: string;
}>();

const emit = defineEmits<{
  (
    e: 'change',
    value: {
      type: number; // 0周，1月, 2天
      startDate: string;
      endDate: string;
      evaluationYear?: number;
      evaluationMonth?: number;
    },
  ): void;
}>();

const show = ref<boolean>(false);
const values = reactive<any>({
  day: '',
  week: '',
  month: '',
});

const state = reactive<any>({
  label: '',
  curType: props.type || 'week',
  weekList: [],
  startDate: '',
  endDate: '',
  thisWeek: '',
  moving: false,
  isOk: false,
  valuesSnapshot: null,
});

const weekList = computed(() => [state.weekList]);

const changeLabel = () => {
  let _label = state.label;
  if (state.curType === 'week') {
    _label = values.week === state.thisWeek ? '本周' : `第${values.week}周`;
  } else if (state.curType === 'month') {
    _label = dayjs(values.month).format('YYYY年MM月');
  } else {
    _label = dayjs(values.day).format('YYYY-MM-DD');
  }
  state.label = _label;
};

const onMoving = value => {
  state.moving = value;
};

const fetchSchemeDateInfoByDate = async (initEmit?: boolean) => {
  try {
    let type = 0;
    if (props.type) {
      type = propsTypeMap[props.type] || 0;
    }
    const res: any = await getSchemeDateInfoByDate(
      props.defaultValue
        ? dayjs(props.defaultValue).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      type,
    );
    state.startDate = res?.startDate;
    state.endDate = res?.endDate;
    if (res?.weekInfoList) {
      const dateVal = dayjs().startOf('date').valueOf();
      let defaultWeek;
      const _defaultValue = props.defaultValue ? dayjs(props.defaultValue).valueOf() : dateVal;

      state.weekList = res.weekInfoList.map(item => {
        let _thisWeek = '';

        if (item.startDate && item.endDate) {
          const startVal = dayjs(item.startDate).valueOf();
          const endVal = dayjs(item.endDate).endOf('date').valueOf();
          // 查询当前周
          if (!state.thisWeek && dateVal >= startVal && dateVal <= endVal) {
            _thisWeek = `${item.week}`;
            state.thisWeek = _thisWeek;
          }
          // 初始的时候emit当前周，所以现在找出来
          if (!defaultWeek && _defaultValue >= startVal && _defaultValue <= endVal) {
            defaultWeek = item;
          }
        }

        return {
          ...item,
          label: `第${item.week}周${_thisWeek ? '(本周)' : ''}`,
          desc: `${dayjs(item.startDate).format('YYYY.MM.DD')}-${
            dayjs(item.startDate).isSame(dayjs(item.endDate), 'year')
              ? dayjs(item.endDate).format('MM.DD')
              : dayjs(item.endDate).format('YYYY.MM.DD')
          }`,
          value: `${item.week}`,
        };
      });

      if (defaultWeek) {
        values.week = `${defaultWeek.week}`;
        if (initEmit) {
          emit('change', {
            type: typeMap.week,
            startDate: defaultWeek.startDate,
            endDate: defaultWeek.endDate,
          });
          changeLabel();
        }
      }

      if (!values.week) {
        values.week = state.weekList[state.weekList.length - 1].week;
      }
    }
    state.valuesSnapshot = JSON.stringify({ ...values, curType: state.curType });
  } catch (e: any) {}
};

const close = () => {
  // #ifdef MP-WEIXIN
  if (state.moving) return;
  // #endif
  // 确定也会走这里 所以加个 isOk
  if (!state.isOk && state.valuesSnapshot) {
    const _valuesSnapshot = JSON.parse(state.valuesSnapshot);
    values.week = _valuesSnapshot.week;
    values.day = _valuesSnapshot.day;
    values.month = _valuesSnapshot.month;
    state.curType = _valuesSnapshot.curType;
  }
  show.value = false;
};

const open = () => {
  state.valuesSnapshot = JSON.stringify({ ...values, curType: state.curType });
  show.value = true;
  state.isOk = false;
};

const onOk = () => {
  // #ifdef MP-WEIXIN
  if (state.moving) return;
  // #endif

  state.isOk = true;

  let startDate;
  let endDate;
  let evaluationYear;
  let evaluationMonth;

  if (state.curType === 'week') {
    const _cur = state.weekList.find(i => i.value === values.week);
    startDate = _cur.startDate;
    endDate = _cur.endDate;
  } else if (state.curType === 'month') {
    const _date = dayjs(values.month);
    startDate = _date.startOf('month').format('YYYY-MM-DD');
    endDate = _date.endOf('month').format('YYYY-MM-DD');
    evaluationYear = _date.year();
    evaluationMonth = _date.month() + 1;
  } else if (state.curType === 'day') {
    startDate = values.day;
    endDate = values.day;
  }

  emit('change', {
    type: typeMap[state.curType],
    startDate,
    endDate,
    evaluationYear,
    evaluationMonth,
  });

  changeLabel();

  show.value = false;
};

onBeforeMount(() => {
  state.curType = props.type || 'week';
  const _date = dayjs(props.defaultValue || undefined);
  const _day = _date.format('YYYY-MM-DD');
  values.month = _day;
  values.day = _day;

  if (['week', 'month'].includes(props.type)) {
    if (props.type === 'month') {
      emit('change', {
        type: typeMap['month'],
        startDate: _date.startOf('month').format('YYYY-MM-DD'),
        endDate: _date.endOf('month').format('YYYY-MM-DD'),
        evaluationYear: _date.year(),
        evaluationMonth: _date.month() + 1,
      });
      changeLabel();
    }
  } else {
    emit('change', {
      type: typeMap['week'],
      startDate: dayjs().day(1).format('YYYY-MM-DD'),
      endDate: dayjs().day(7).format('YYYY-MM-DD'),
    });
    state.label = '本周';
  }

  fetchSchemeDateInfoByDate(props.type === 'week');
});
</script>

<style lang="scss" scoped>
.date-popup {
  &-header {
    display: flex;
    align-items: center;
    height: 96rpx;
    text-align: center;
    border-bottom: 1px solid $color-border-secondary;
  }
  &-title {
    flex: 1;
  }
  &-cancel {
    color: $color-text-label;
    width: 128rpx;
  }
  &-submit {
    color: $color-primary;
    width: 128rpx;
  }
}
.date-popup-main {
  display: flex;
}
.date-popup-wrapper {
  height: 400rpx;
  background-color: #fff;
}
.date-popup-content {
  margin-left: 32rpx;
  flex: 1;
  height: 100%;
}
.date-popup-filter {
  width: 206rpx;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
  .item {
    position: relative;
    border-radius: 0 8rpx 8rpx 0;
    display: flex;
    align-items: center;
    height: 104rpx;
    padding: 0 32rpx;
    border-radius: 8rpx;

    .icon {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      display: block;
      width: 6rpx;
      height: 28rpx;
      background-color: $color-primary;
      border-radius: 10rpx;
    }

    &.selected {
      background-color: #fff;
      border-radius: 0;
      color: $color-primary;

      &::before,
      &::after,
      .text::before,
      .text::after {
        content: '';
        position: absolute;
        right: 0;
        display: block;
        width: 18rpx;
        height: 18rpx;
      }

      &::before,
      &::after {
        top: -18rpx;
      }
      &::before {
        background-color: #fff;
      }
      &::after {
        background-color: #f5f5f5;
        border-radius: 0 0 99rpx 0;
      }

      .text {
        flex: auto;
        width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 30rpx;
        font-weight: 500;

        &::before,
        &::after {
          bottom: -18rpx;
        }
        &::before {
          background-color: #fff;
        }
        &::after {
          background-color: #f5f5f5;
          border-radius: 0 99rpx 0 0;
        }
      }
    }
  }
}
.date-trigger {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  &-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
    color: $color-text-heading;
  }
  &-down {
    margin-left: 8rpx;
  }
}
</style>
