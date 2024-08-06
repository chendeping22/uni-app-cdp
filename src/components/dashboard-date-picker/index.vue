<template>
  <view @click="show">
    <slot></slot>
  </view>
  <u-popup ref="popup" v-model="popupShow" border-radius="32" mode="bottom" @maskClick="close">
    <view class="popup-body">
      <view class="header">
        <view class="btn" @click="close">取消</view>
        <view class="text">{{
          innerMode === dateModeCode.DATE
            ? '选择日期'
            : innerMode === dateModeCode.MONTH
            ? '选择月'
            : '选择周期'
        }}</view>
        <view class="btn" :class="{ 'btn-disabled': !isPickEnd }" @click="onSubmitHandle"
          >确定</view
        >
      </view>
      <picker-view
        :indicator-style="indicatorStyle"
        class="picker-view"
        :value="valueIndexs"
        immediate-change
        @change="bindChange"
        @pickstart="bindPickStart"
        @pickend="bindPickEnd"
      >
        <picker-view-column v-if="innerMode === dateModeCode.WEEK">
          <view v-for="(item, index) in weeks" :key="index" class="item">{{ item.label }}</view>
        </picker-view-column>
        <template v-else>
          <picker-view-column>
            <view v-for="(item, index) in years" :key="index" class="item">{{ item }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(item, index) in months" :key="index" class="item">{{ item }}月</view>
          </picker-view-column>
          <picker-view-column v-if="innerMode === dateModeCode.DATE">
            <view v-for="(item, index) in days" :key="index" class="item">{{ item }}日</view>
          </picker-view-column>
        </template>
      </picker-view>
    </view>
  </u-popup>
</template>
<script lang="ts">
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { defineComponent, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';

dayjs.extend(isoWeek);

export const enum dateModeCode {
  DATE = 'Day',
  WEEK = 'Week',
  MONTH = 'Month',
}

export default defineComponent({
  props: {
    mode: {
      // 可选择的类型，date:日期 month:月份 week:周
      type: String,
      default: () => dateModeCode.DATE,
    },
    defaultDate: {
      type: [Number, Object],
      default: () => dayjs().valueOf(), // 默认日期，仅初始化时有效
    },
    minDate: {
      type: [Number, Object],
      default: () => dayjs().subtract(5, 'M').valueOf(), // 默认近六个月
    },
    maxDate: {
      type: [Number, Object],
      default: () => dayjs().valueOf(), // 默认当天
    },
    visible: {
      // 日期选择器是否可见，双向绑定字段，方便外层业务知悉当前日期选择器弹窗是否可见
      type: Boolean,
      default: false,
    },
  },
  emits: ['change', 'update:visible'],
  setup(props, { emit }) {
    const { mode, minDate, maxDate, defaultDate } = reactive(props);
    const innerMode = ref<string>(mode);
    const innerMinDate = ref<number>(minDate);
    const innerMaxDate = ref<number>(maxDate);
    const innerCurrentDate = ref<number>(defaultDate);
    const valueIndexs = ref<number[]>();
    const isPickEnd = ref(true); // 是否滚动选择已结束, 用于处理快速滚动时未结束时点击确定获取不到最新的数据
    const currentValue = ref(defaultDate);
    const popup = ref();
    const year = ref(dayjs(maxDate).year());
    const month = ref(dayjs(maxDate).month() + 1);
    const date = ref(dayjs(maxDate).date());
    const week = ref(dayjs(maxDate).startOf('isoWeek'));
    const popupShow = ref(false);

    const { proxy } = getCurrentInstance();

    const onSubmitHandle = () => {
      if (!isPickEnd.value) return;
      let firstDate;
      if (innerMode.value === dateModeCode.WEEK) {
        const { weeks, valueIndexs } = proxy;
        const [weekIndex] = valueIndexs || [weeks.length - 1];
        firstDate = weeks[weekIndex];
      } else {
        const { years, months, days, valueIndexs } = proxy;
        const [yearIndex, monthIndex, dayIndex] = valueIndexs || [
          years.length - 1,
          months.length - 1,
          days.length - 1,
        ];

        const yearItem = years[yearIndex];
        const monthItem = months[monthIndex];
        const dayItem = days[dayIndex];
        firstDate = dayjs()
          .year(yearItem)
          .month(monthItem - 1)
          .date(dayItem)
          .startOf(innerMode.value === dateModeCode.DATE ? 'D' : 'M');
      }

      emit(
        'change',
        innerMode.value === dateModeCode.WEEK
          ? {
              value: firstDate.value,
              label: firstDate.label,
              mode: innerMode.value,
            }
          : {
              value: firstDate,
              label: firstDate.format(
                innerMode.value === dateModeCode.DATE ? 'YYYY-MM-DD' : 'YYYY-MM',
              ),
              mode: innerMode.value,
            },
      );
      proxy.close();
    };

    onMounted(() => {
      proxy.setCurrentDate();
      proxy.$nextTick(() => {
        onSubmitHandle();
      });
    });

    watch(
      () => props.mode,
      () => {
        innerMode.value = props.mode;
        proxy.setCurrentDate();
        proxy.$nextTick(() => {
          onSubmitHandle();
        });
      },
    );

    watch(
      () => props.defaultDate,
      () => {
        currentValue.value = props.defaultDate;
      },
    );

    return {
      dateModeCode,
      popup,
      innerMode,
      innerMinDate,
      innerMaxDate,
      innerCurrentDate,
      valueIndexs,
      isPickEnd,
      year,
      month,
      date,
      week,
      onSubmitHandle,
      indicatorStyle: 'height: 50px;',
      currentValue,
      popupShow,
    };
  },
  computed: {
    years: function () {
      const datas = [];
      let preYear;
      do {
        preYear = preYear ? dayjs(preYear).subtract(1, 'year') : dayjs(this.innerMaxDate);
        datas.push(preYear);
      } while (preYear.isAfter(dayjs(this.innerMinDate), 'year'));
      return datas.reverse().map(item => dayjs(item).year());
    },
    months: function () {
      const datas = [];
      const currentYear = dayjs().year(this.year);
      let minMonth = 1;
      let maxMonth = 12;
      if (dayjs(this.innerMinDate).isSame(currentYear, 'year')) {
        minMonth = dayjs(this.innerMinDate).month() + 1;
      }
      if (dayjs(this.innerMaxDate).isSame(currentYear, 'year')) {
        maxMonth = dayjs(this.innerMaxDate).month() + 1;
      }
      for (let i = minMonth; i <= maxMonth; i++) {
        datas.push(i);
      }
      return datas;
    },
    days: function () {
      const datas = [];
      const currentMonth = dayjs()
        .year(this.year)
        .month(this.month - 1);
      // 获取当前月的总天数
      let maxDay = currentMonth.daysInMonth();
      let minDay = 1;
      if (dayjs(this.innerMinDate).isSame(currentMonth, 'month')) {
        // 处于最小的月份, 获取当天日期
        minDay = Math.min(dayjs(this.innerMinDate).date(), currentMonth.date());
      }
      if (dayjs(this.innerMaxDate).isSame(currentMonth, 'month')) {
        // 当前月份 = 最大日期所在月份
        maxDay = dayjs(this.innerMaxDate).date();
      }
      for (let i = minDay; i <= maxDay; i++) {
        datas.push(i);
      }
      return datas;
    },
    weeks: function () {
      // 展示x年第x周
      const datas = [];
      this.years.forEach(year => {
        let minWeek = 1;
        let maxWeek = dayjs().year(year).endOf('year').isoWeek();
        if (dayjs(this.innerMinDate).year() === year) {
          // 处于当前最小日期所在年份, 获取最小日期所在第几周
          minWeek = dayjs(this.innerMinDate).isoWeek();
        }
        if (dayjs(this.innerMaxDate).year() === year) {
          // 处于当前最大日期所在年份, 获取最大日期所在第几周
          maxWeek = dayjs(this.innerMaxDate).isoWeek();
        }
        for (let i = minWeek; i <= maxWeek; i++) {
          const weekStartDate = dayjs().year(year).isoWeek(i).startOf('isoWeek');
          const weekEndDate = weekStartDate.add(6, 'd');
          const label = dayjs().startOf('isoWeek').isSame(weekStartDate, 'day')
            ? '本周'
            : `${year}年第${i < 10 ? `0${i}` : i}周(${weekStartDate.format(
                'MM.DD',
              )}~${weekEndDate.format('MM.DD')})`;
          datas.push({
            value: weekStartDate, // 当前周的第一天日期
            label,
          });
        }
      });
      return datas;
    },
  },
  methods: {
    close: function () {
      this.popup.close();
      this.popupShow = false;
      this.$emit('update:visible', false);
    },
    show: function () {
      this.popup.open();
      let cd;
      if (dayjs(this.currentValue).isBefore(dayjs(this.innerMinDate), 'date'))
        cd = dayjs(this.innerMinDate);
      else if (dayjs(this.currentValue).isAfter(dayjs(this.innerMaxDate), 'date'))
        cd = dayjs(this.innerMaxDate);
      else cd = dayjs(this.currentValue);
      this.year = cd.year();
      this.month = cd.month() + 1;
      this.date = cd.date();
      this.week = cd.startOf('isoWeek');
      this.$nextTick(() => {
        this.setValueIndexs();
      });
      this.$emit('update:visible', true);
      this.popupShow = true;
    },
    bindPickStart: function () {
      this.isPickEnd = false;
    },
    bindPickEnd: function () {
      this.isPickEnd = true;
    },
    bindChange: function (e) {
      // 控制因为列项数量变动时，二次触发change的事件
      if (this.innerMode === dateModeCode.WEEK) {
        const [preWeekIndex] = this.valueIndexs || [0];
        const [weekIndex = preWeekIndex] = e.detail.value;
        const weekItem = weekIndex !== null ? this.weeks[weekIndex] : null;
        if (weekItem !== null && !dayjs(weekItem.value).isSame(dayjs(this.week), 'd')) {
          this.week = weekItem.value;
        }
      } else {
        const [preYearIndex, preMonthIndex, preDayIndex] = this.valueIndexs || [0, 0, 0];

        const [yearIndex = preYearIndex, monthIndex = preMonthIndex, dayIndex = preDayIndex] =
          e.detail.value;

        // 小程序与app返回的值不同 ，app只返回有更改的列的下标，此处兼容处理
        const yearItem = yearIndex !== null ? this.years[yearIndex] : null;
        const monthItem = monthIndex !== null ? this.months[monthIndex] : null;
        const dayItem = dayIndex !== null ? this.days[dayIndex] : null;
        // 根据与前一次的数据比对，判断是哪列有了变更
        if (yearItem !== null && yearItem !== this.year) {
          this.year = yearItem;
        }
        if (monthItem !== null && monthItem !== this.year) {
          this.month = monthItem;
        }
        if (dayItem !== null && dayItem !== this.date) {
          this.date = dayItem;
        }
      }

      this.$nextTick(() => {
        this.setValueIndexs();
      });
    },

    setValueIndexs: function () {
      // 根据变更后的时间，获取在对应列的下标，未找到时，置为首位(主要针对当前系统时间所在的年月日时);
      if (this.innerMode === dateModeCode.WEEK) {
        const weekIndex = this.weeks.findIndex(item => dayjs(item.value).isSame(dayjs(this.week)));
        const indexs = [weekIndex !== -1 ? weekIndex : 0];
        this.valueIndexs = indexs;
      } else {
        const yearIndex = this.years.findIndex(item => item === this.year);
        const monthIndex = this.months.findIndex(item => item === this.month);
        const dayIndex = this.days.findIndex(item => item === this.date);
        const indexs = [
          yearIndex !== -1 ? yearIndex : 0,
          monthIndex !== -1 ? monthIndex : 0,
          dayIndex !== -1 ? dayIndex : 0,
        ];
        this.valueIndexs = indexs;
      }
    },

    setCurrentDate: function () {
      // 如果设定的时间小于最小时间，则使用最小时间
      let cd;
      if (dayjs(this.innerCurrentDate).isBefore(dayjs(this.innerMinDate), 'date'))
        cd = dayjs(this.innerMinDate);
      else if (dayjs(this.innerCurrentDate).isAfter(dayjs(this.innerMaxDate), 'date'))
        cd = dayjs(this.innerMaxDate);
      else cd = dayjs(this.innerCurrentDate);
      this.year = cd.year();
      this.month = cd.month() + 1;
      this.date = cd.date();
      this.week = cd.startOf('isoWeek');
      this.$nextTick(() => {
        this.setValueIndexs();
      });
    },
  },
});
</script>
<style lang="scss" scoped>
.popup-body {
  display: flex;
  flex-direction: column;

  .header {
    position: relative;
    height: 104rpx;
    text-align: center;
    line-height: 104rpx;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    padding: 0 32rpx;
    .text {
      font-size: 36rpx;
      color: #1d2129;
      font-weight: 600;
    }

    .btn {
      font-size: 28rpx;
      color: #176bfb;
    }

    .btn-disabled {
      // color: $ui-color-disabled;
    }
  }
  .picker-view {
    background-color: $uni-bg-color;
    height: 440rpx;

    .item {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 36rpx;
      color: #1d2129;
    }

    .item-month {
      flex: 2;
    }

    .item-split {
      flex: inherit;
      width: 20px;
    }
  }
}
</style>
