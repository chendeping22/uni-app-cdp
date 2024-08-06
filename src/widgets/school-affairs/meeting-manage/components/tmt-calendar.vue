<template>
  <view class="container" :style="{ background }">
    <view class="tmt-header">
      <view class="select-wrap" :style="{ color: actionColor }">
        <view class="p20" @click="changMonth(-1)">
          <view
            class="arrow-left"
            :style="[{ 'border-left-color': actionColor }, { 'border-bottom-color': actionColor }]"
          ></view>
        </view>
        <view class="time">
          {{
            `${currentYearMonth.year}年${
              currentYearMonth.month >= 10 ? currentYearMonth.month : '0' + currentYearMonth.month
            }月`
          }}
        </view>
        <view class="p20" @click="changMonth(1)">
          <view
            class="arrow-right"
            :style="[{ 'border-left-color': actionColor }, { 'border-right-color': actionColor }]"
          ></view>
        </view>
      </view>
      <view class="back" @click="init(true)"> 今天 </view>
    </view>
    <view class="tmt-content">
      <view class="tmt-week-wrap">
        <view
          v-for="(item, index) in week"
          :key="index"
          class="cell week-item"
          :style="{ color: weekColor }"
          >{{ item.label }}</view
        >
      </view>
      <view
        class="tmt-day-wrap"
        :style="[{ height: unfold ? contentHeight : '88rpx' }, { color: dayColor }]"
      >
        <view
          :class="['tmt-day-wrap2', !unfold ? 'move' : '']"
          :style="[
            { height: contentHeight },
            { color: dayColor },
            { marginTop: !unfold ? clickRow * -88 + 'rpx' : '0' },
          ]"
        >
          <view v-for="index of blankDay" :key="index" class="cell blankDay"></view>
          <view v-for="(item, index) in daysArr" :key="index" class="cell">
            <view
              class="dayText"
              :style="
                current.year == item.year && current.month == item.month && current.day == item.day
                  ? 'background:' + selectBg
                  : ''
              "
              @click="changeDay(item)"
            >
              <view
                :style="
                  current.year == item.year &&
                  current.month == item.month &&
                  current.day == item.day
                    ? 'color:#fff;'
                    : ''
                "
                :class="[item.today ? 'today' : '']"
                >{{ item.day }}</view
              >

              <view v-if="item.point" class="point" :style="{ background: pointColor }"></view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="showBtn" class="tmt-footer">
      <view class="arrow-box" @click="toggle">
        <view
          :class="['arrow-down', { on: unfold }]"
          :style="[
            { 'border-left-color': unfoldBtnColor },
            { 'border-bottom-color': unfoldBtnColor },
          ]"
        >
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Calendar',
  props: {
    pointLists: {
      type: Array,
      default() {
        return [];
      },
    },
    defaultDate: {
      type: String,
      default() {
        return '';
      },
    },
    showBtn: {
      type: Boolean,
      default() {
        return true;
      },
    },
    show: {
      type: Boolean,
      default() {
        return true;
      },
    },
    background: {
      type: String,
      default() {
        return 'linear-gradient(45deg, #fafafa 0%, #fafafa 100%)';
      },
    },
    weekColor: {
      type: String,
      default() {
        return '#8a8a8a';
      },
    },
    dayColor: {
      type: String,
      default() {
        return '#000';
      },
    },
    selectBg: {
      type: String,
      default() {
        return 'linear-gradient(180deg, #1677ff 0%, #1677ff 100%)';
      },
    },
    pointColor: {
      type: String,
      default() {
        return '#1677ff';
      },
    },
    backColor: {
      type: String,
      default() {
        return '#fff';
      },
    },
    backBg: {
      type: String,
      default() {
        return 'rgba(255, 255, 255, 0.19)';
      },
    },
    actionColor: {
      type: String,
      default() {
        return '#8a8a8a';
      },
    },
    unfoldBtnColor: {
      type: String,
      default() {
        return '#8a8a8a';
      },
    },
  },
  data() {
    return {
      clickRow: 0,
      pointList: [],
      unfold: true,
      week: [
        {
          label: '周一',
          value: 1,
        },
        {
          label: '周二',
          value: 2,
        },
        {
          label: '周三',
          value: 3,
        },
        {
          label: '周四',
          value: 4,
        },
        {
          label: '周五',
          value: 5,
        },
        {
          label: '周六',
          value: 6,
        },
        {
          label: '周日',
          value: 7,
        },
      ],
      dayNum: 0, //几号
      blankDay: 0, //空白天数
      today: {}, //当天
      current: {}, //当前的年月
      daysArr: [],
      list: [], //需要下标的日期
      currentYearMonth: {}, //当前年月
    };
  },
  computed: {
    contentHeight() {
      let height = Math.ceil((this.blankDay + this.daysArr.length) / 7) * 88;
      return height + 'rpx';
    },
  },
  watch: {
    pointLists(val) {
      this.pointList = val;
      this.list = val;
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      this.makeCalendar(year, month);
    },
  },

  created() {
    this.unfold = this.show;
    this.list = this.pointList;
    const today = new Date();
    this.dayNum = today.getDate();
    this.fomatePointTime();
    this.init(this.defaultDate == '');
    this.getCurrentRow();
  },
  methods: {
    toggle() {
      this.unfold = !this.unfold;
    },
    getCurrentRow() {
      // 计算点击位置所在的行数
      const currentRow = Math.ceil((this.dayNum + this.blankDay) / 7);
      this.clickRow = currentRow - 1 > 0 ? currentRow - 1 : 0;
    },
    changMonth(num) {
      const { year, month } = this.getMonthYear(num);
      this.makeCalendar(year, month);
      //定位到下个月的几号
      const nextDayNum = this.getDays(year, month);
      if (this.dayNum > nextDayNum) {
        this.current = { year, month, day: 1 };
        this.dayNum = 1;
      } else {
        this.current = { year, month, day: this.dayNum };
      }
      this.$emit('changeDate', this.current);
      this.getCurrentRow();
    },
    // 获取前几个月,未来几个月的年份和月份
    getMonthYear(num) {
      let month = this.currentYearMonth.month;
      let year = this.currentYearMonth.year;
      let year2 = year;
      let month2 = month + num;
      if (month + num <= 0) {
        // 之前年份
        year2 = year - 1 - parseInt(Math.abs(month2) / 12);
        month2 = 12 - (Math.abs(month2) % 12);
      } else if (month2 / 12 > 1) {
        // 之后年份
        year2 = year + (month2 % 12 == 0 ? 0 : parseInt(month2 / 12));
        month2 = parseInt(month2 % 12) == 0 ? 12 : parseInt(month2 % 12);
      }
      return {
        year: year2,
        month: month2,
      };
    },

    changeDay(item) {
      this.current = item;
      let { year, month, day } = item;
      this.dayNum = day;
      this.$emit('changeDate', { year, month, day });
      this.getCurrentRow();
      // 获取日历区域的高度
      // const calendarHeight = document.querySelector('.tmt-day-wrap').offsetHeight;
      //当前月有几行
      // const rowNumber = Math.floor(calendarHeight / 44);
    },
    // 获取某年某月的天数
    getDays(year, month) {
      let now = new Date(year, month, 0);
      return now.getDate();
    },
    //获取某一天为星期几
    getWeekByDay(time) {
      let day = new Date(Date.parse(time.replace(/-/g, '/'))); //将日期值格式化
      return day.getDay() == 0 ? 7 : day.getDay();
    },
    init(nowTime) {
      let setTime = nowTime ? new Date() : new Date(this.defaultDate);
      let year = setTime.getFullYear();
      let month = setTime.getMonth() + 1;
      let day = setTime.getDate();
      if (!(this.defaultDate != '' && nowTime)) {
        this.current = {
          year,
          month,
          day,
        };
        this.$emit('changeDate', this.current);
      }
      this.today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
      };
      this.makeCalendar(year, month);
      this.$emit('changeDate', this.today);
      this.dayNum = day;
      this.getCurrentRow();
    },
    fomatePointTime() {
      let pointList = this.list;
      pointList = pointList.map(item => {
        item = item.replace(/-/g, '/'); //期值格式化
        let timeArr = item.split('/');
        let timeStr = '';
        timeArr.map(time => {
          time = parseInt(time);
          timeStr += time;
          return time;
        });
        return timeStr;
      });
      this.list = pointList;
    },
    makeCalendar(year, month) {
      let today = this.today;
      let days = this.getDays(year, month); //当月天数
      let firstDayWeek = this.getWeekByDay(`${year}-${month}-1`); //获取每个月第一天的星期
      let weekIndex = this.week.findIndex(item => {
        return item.value == firstDayWeek;
      });
      let daysArr = [];
      for (let i = 1; i <= days; i++) {
        let point =
          this.list.findIndex(item => {
            return (
              item ==
              String(year) + '-' + String(month).padStart(2, '0') + '-' + String(i).padStart(2, '0')
            );
          }) != -1;
        daysArr.push({
          year,
          month,
          day: i,
          point,
          today: year == today.year && month == today.month && i == today.day,
        });
      }
      this.currentYearMonth = {
        year,
        month,
      };
      this.daysArr = daysArr;
      this.blankDay = weekIndex == -1 ? 0 : weekIndex;
    },
  },
};
</script>

<style lang="scss">
.p20 {
  padding: 20rpx;
}

.container {
  position: relative;
  padding: 16rpx 20rpx 0rpx;
  border-radius: 16rpx;
}

.tmt-header {
  display: flex;
  justify-content: center;
  .select-wrap {
    display: flex;
    align-items: center;

    .arrow-left {
      width: 18rpx;
      height: 18rpx;
      transform: rotate(45deg);
      border-left-width: 4rpx;
      border-bottom-width: 4rpx;
      border-left-style: solid;
      border-bottom-style: solid;
    }

    .time {
      margin: 0 20rpx;
      font-size: 32rpx;
      font-weight: 500;
    }

    .arrow-right {
      width: 18rpx;
      height: 18rpx;
      transform: rotate(45deg);
      border-top-width: 4rpx;
      border-right-width: 4rpx;
      border-top-style: solid;
      border-right-style: solid;
    }
  }

  .back {
    font-size: 30rpx;
    color: #1677ff;
    position: absolute;
    top: 22rpx;
    right: 32rpx;
  }
}

.cell {
  width: 14.28%;
  height: 88rpx;
  text-align: center;
  line-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .point {
    width: 12rpx;
    height: 12rpx;
    position: absolute;
    bottom: 3rpx;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
  }

  .dayText {
    width: 56rpx;
    height: 56rpx;
    text-align: center;
    line-height: 56rpx;
    border-radius: 50%;

    &.on {
      background: linear-gradient(180deg, #ff855e 0%, #ed6337 100%);
    }
  }
}

.tmt-content {
  padding-bottom: 20rpx;

  .tmt-week-wrap {
    display: flex;

    .week-item {
      font-size: 30rpx;
    }
  }

  .tmt-day-wrap {
    display: flex;
    flex-wrap: wrap;
    transition: height 0.3s;
    overflow: hidden;
  }
  .tmt-day-wrap2 {
    display: flex;
    flex-wrap: wrap;
    transition: all 0.3s;
    overflow: hidden;
  }
}

.tmt-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  margin-top: -36rpx;

  .arrow-down {
    width: 18rpx;
    height: 18rpx;
    transform: rotate(-45deg);
    border-left-width: 4rpx;
    border-bottom-width: 4rpx;
    border-left-style: solid;
    border-bottom-style: solid;
    transition: all 0.3s;

    &.on {
      transform: rotate(135deg);
    }
  }
}
.today {
  color: #1677ff;
}
.move {
  margin-top: 0;
  transition: all 0.3s;
}
.arrow-box {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
