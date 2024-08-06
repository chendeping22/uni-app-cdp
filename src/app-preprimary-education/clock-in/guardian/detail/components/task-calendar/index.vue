<template>
  <imp-header title="打卡明细" extra-right>
    <template #extra>
      <view class="flex-inline no-bold" @click="handleClickHeader">
        <text class="">日历</text>
        <c-icon name="icon_arrow_right" size="48" color-type="placeholder" />
      </view>
    </template>
  </imp-header>
  <scroll-view
    scroll-x
    :scroll-into-view="inited ? '___' : `calendar_${t}_${Math.max(curCalendarInx - 2, 0)}`"
  >
    <!--不能使用封装的组件，否则滚动要失效-->
    <imp-space gap-size="xs">
      <view
        v-for="(d, inx) in calendars"
        :id="`calendar_${t}_${inx}`"
        :key="`calendar_${t}_${inx}`"
        class="calendar-outer mr-xs"
        @click="handleSelect(d.inx, true)"
      >
        <view
          v-if="isGuardian && d.isPast"
          :class="`status-banner status-${d.clockinStatus}`"
        ></view>
        <view
          :class="[
            'calendar-wrap',
            d.isPast ? 'day-past' : 'day-future',
            {
              'day-today': d.monthDate === '今天',
              'day-active': curCalendarInx === inx,
            },
          ]"
        >
          <view class="font-desc">{{ d.monthDate }}</view>
          <view class="font-title bold mt-s mb-s">{{ d.weekName }}</view>
          <view class="day-wrap font-desc text-ellipse">第{{ inx + 1 }}天</view>
        </view>
      </view>
    </imp-space>
  </scroll-view>
</template>
<script lang="ts">
import { ICalendar } from '@/app-preprimary-education/clock-in/guardian/task-calendar/components/calendars/index.vue';
import ImpHeader from '@/app-preprimary-education/components/imp-header/imp-header.vue';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { IGetClockInDetailRtn } from '@/app-preprimary-education/services/clock-in';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate, showInfo } from '@/utils/tools';
import { PropType, computed, defineComponent, onMounted, onUnmounted, ref, watchEffect } from 'vue';

const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default defineComponent({
  components: { ImpHeader, ImpSpace },
  props: {
    detail: { type: Object as PropType<IGetClockInDetailRtn>, default: () => {} },
  },
  emits: ['onSelectCalendar'],
  setup(props, emits) {
    const isGuardian = loginStore().currentUserType == EUserType.guardian;
    const t = Date.now();
    const curCalendarInx = ref(-1);
    const inited = ref(false); // 用于控制自动滚动,
    /** 转为零点的时间点 */
    const today = computed(() => {
      const { detail } = props;
      const d = new Date(detail.currentDate);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
    const statusName = (status: number) => (status === 0 ? '缺卡' : '已打');
    /** 日历 */
    const calendars = computed(() => {
      const { detail } = props;
      const res = detail.calendarVoList?.map(({ clockinStatus, clockinDate }, inx) => {
        const date = new Date(clockinDate);
        const compareDate = clockinDate - today.value.getTime();
        const weekName =
          (compareDate < 0 && isGuardian && statusName(clockinStatus)) ||
          (compareDate === 0 && isGuardian && clockinStatus === 1 && '已打') ||
          weeks[date.getDay()];
        const monthDate = compareDate === 0 ? '今天' : formatDate(clockinDate, 'MM/DD');
        return {
          inx,
          isPast: compareDate < 0,
          weekName,
          monthDate,
          yearMonth: formatDate(clockinDate, 'YYYY年MM月'),
          clockinStatus,
          clockinDate,
        } as ICalendar;
      });
      return res || [];
    });
    const handleClickHeader = () => {
      const str = encodeURIComponent(JSON.stringify(calendars.value));
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/guardian/task-calendar/index?activeInx=${curCalendarInx.value}&calendars=${str}`,
      });
    };

    const handleSelect = (inx: number, checkInx = false) => {
      if (checkInx && curCalendarInx.value === inx) return;
      const c = calendars.value[inx];
      if (!c.isPast && c.monthDate !== '今天') {
        showInfo(`${c.monthDate} 打卡未开始`);
        return;
      }
      curCalendarInx.value = inx;
      emits.emit('onSelectCalendar', c);
    };
    const handleCalendarChange = (inx: number) => {
      inited.value = false;
      setTimeout(() => {
        inited.value = true;
      }, 1000);
      handleSelect(inx);
    };

    onUnmounted(() => {
      uni.$off('onCalendarChange', handleCalendarChange);
    });
    onMounted(() => {
      uni.$on('onCalendarChange', handleCalendarChange);
      setTimeout(() => {
        inited.value = true;
      }, 1000);
    });
    /** 计算起始位置 */
    const stop = watchEffect(() => {
      const ls = calendars.value;

      if (!ls || ls.length < 1) return;
      // 1. 先取当天的位置
      const todayInx = ls.findIndex(r => r.monthDate === '今天');
      if (todayInx > -1) {
        handleSelect(todayInx);
        stop();
        return;
      }
      // 2. 取最近打卡的位置
      const pastInx = ls.findIndex(r => !r.isPast);
      if (pastInx > -1) {
        handleSelect(pastInx - 1);
        stop();
        return;
      } else {
        // 若为-1则说明任务已过期，且超过当天
        handleSelect(ls.length - 1);
        stop();
        return;
      }
    });
    return {
      t,
      inited,
      curCalendarInx,
      calendars,
      today,
      handleClickHeader,
      handleSelect,
      isGuardian,
    };
  },
});
</script>
<style scoped lang="scss">
.calendar-outer {
  flex-shrink: 0;
  text-align: center;
  overflow: hidden;
  position: relative;
  border-radius: $ui-radius-small;

  .status-banner {
    position: absolute;
    width: 60rpx;
    height: 40rpx;
    top: 0;
    left: 0;
    z-index: 1;
    transform-origin: 0 0;
    transform: rotate(-45deg) translate(-50%, -50%);

    &.status-1 {
      background-color: $ui-color-success;
    }
    &.status-0 {
      background-color: $ui-color-error;
    }
  }

  .calendar-wrap {
    padding: $ui-gap-xs $ui-gap-small;

    &.day-past {
      background: $ui-color-fill-default;
      .day-wrap {
        color: $ui-color-placeholder;
      }
    }

    &.day-future {
      background: $ui-color-fill-light;
      color: $ui-color-placeholder;
    }

    &.day-today {
      color: $ui-color-primary;
    }
    &.day-active {
      background-image: linear-gradient(
        135deg,
        rgba($ui-color-primary, 0.5),
        rgba($ui-color-primary, 1)
      );
      color: $ui-color-white;
      .day-wrap {
        background: rgba($ui-color-white, 0.2);
      }
      &.day-past {
        .day-wrap {
          color: $ui-color-white;
        }
      }
    }

    .day-wrap {
      background: $ui-color-white;
      border-radius: $ui-radius-small;
      padding: $ui-gap-xxs $ui-gap-xs;
    }
  }
}
</style>
