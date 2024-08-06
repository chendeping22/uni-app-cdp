<template>
  <uni-popup ref="popup" type="bottom" @maskClick="onCancelHandle">
    <view class="popup-body">
      <view class="header">
        <view class="btn" @click="onCancelHandle">取消</view>
        <view class="text">选择时间</view>
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
        <!-- <picker-view-column class="item-month">
          <view v-for="(item, index) in months" :key="index" class="item">{{ item.label }}</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(item, index) in days" :key="index" class="item">{{ item }}日</view>
        </picker-view-column> -->
        <picker-view-column>
          <view v-for="(item, index) in hours" :key="index" class="item">{{ item }}时</view>
        </picker-view-column>
        <picker-view-column class="item-split">
          <view class="item">：</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(item, index) in minutes" :key="index" class="item">{{ item }}分</view>
        </picker-view-column>
      </picker-view>
    </view>
  </uni-popup>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
export default defineComponent({
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    currentDate: {
      type: Number,
      default: () => dayjs(), // 默认当天
    },
    minDate: {
      type: Number,
      default: () => dayjs(), // 默认当天
    },
    maxDate: {
      type: Number,
      // default: () => dayjs().add(7, 'day'), // 默认相差7天
      default: () => dayjs(), // 默认当天
    },
  },
  emits: ['onClose', 'changeTime'],
  setup(props, ctx) {
    const { minDate, currentDate } = reactive(props);
    const _currentDate = ref<number>(currentDate);
    const isPickEnd = ref(true); // 是否滚动选择已结束, 用于处理快速滚动时未结束时点击确定获取不到最新的数据
    const valueIndexs = ref<number[]>([0, 0, 0]);
    const popup = ref();
    const year = ref(dayjs(minDate).year());
    const month = ref(dayjs(minDate).month());
    const date = ref(dayjs(minDate).date());

    const onCancelHandle = () => {
      ctx.emit('onClose');
    };
    onMounted(() => {
      if (props.visible) popup.value.open();
    });
    const hours = computed(() => {
      const datas = [];
      let minHour = 0;
      let maxHour = 23;
      //大于当前小时的小时不展示
      if (dayjs(_currentDate.value).isSame(dayjs(), 'date')) {
        // 当天
        maxHour = dayjs().hour();
      }
      // if (dayjs(this._minDate).isSame(currentDay, 'date')) {
      //   // 处于最小的日期, 获取当前小时
      //   maxHour = currentDay.hour();
      // }
      // // if (dayjs(this._maxDate).isSame(currentDay, 'date')) {
      // //   // 当天与最大日期为同一天
      // //   maxHour = dayjs(this._maxDate).hour();
      // // }
      for (let i = minHour; i <= maxHour; i++) {
        datas.push(i < 10 ? `0${i}` : `${i}`);
      }
      return datas;
    });
    const minutes = computed(() => {
      const datas = [];
      // const currentHour = dayjs().year(this.year).month(this.month).date(this.date).hour(this.hour);
      let minMinute = 0;
      let maxMinute = 59;
      // if (dayjs(this._minDate).isSame(currentHour, 'hour')) {
      //   // 处于最小的小时, 获取当前分钟
      //   minMinute = currentHour.minute();
      // }
      // if (dayjs(this._maxDate).isSame(currentHour, 'hour')) {
      //   // 当天与最大日期为同一天
      //   maxMinute = dayjs(this._maxDate).minute();
      // }
      for (let i = minMinute; i <= maxMinute; i++) {
        datas.push(i < 10 ? `0${i}` : `${i}`);
      }
      return datas;
    });
    const onSubmitHandle = () => {
      if (!isPickEnd.value) return;
      const selectedTime = dayjs()
        .year(year.value)
        .month(month.value)
        .date(date.value)
        .hour(valueIndexs.value[0])
        .minute(valueIndexs.value[2]);
      ctx.emit('changeTime', selectedTime);
      ctx.emit('onClose');
    };
    watch(
      () => props.visible,
      isOpen => {
        if (isOpen) {
          popup.value.open();
        } else {
          popup.value.close();
        }
      },
    );
    return {
      onCancelHandle,
      _currentDate,
      indicatorStyle: 'height: 50px;',
      isPickEnd,
      valueIndexs,
      onSubmitHandle,
      popup,
      hours,
      minutes,
      year,
      month,
      date,
    };
  },
  methods: {
    bindPickStart: function () {
      this.isPickEnd = false;
    },
    bindPickEnd: function () {
      this.isPickEnd = true;
    },
    bindChange: function (e) {
      this.valueIndexs = e.detail.value;
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
    border-radius: $ui-radius-xl $ui-radius-xl 0 0;
    background-color: $uni-bg-color;
    display: flex;
    justify-content: space-between;
    padding: 0 $ui-gap-large;
    .text {
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
      font-weight: $ui-font-weight-bold;
    }

    .btn {
      font-size: $ui-font-size-title;
      color: $ui-color-primary;
    }

    .btn-disabled {
      color: $ui-color-disabled;
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
      font-size: $ui-font-size-xt;
      color: $ui-color-base;
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
