<template>
  <imp-space gap-size="xs" :wrap="wrap" style="width: 100%">
    <view
      v-for="(d, inx) in calendars"
      :id="`calendar_${curKey}_${inx}`"
      :key="`calendar_${curKey}_${inx}`"
      class="calendar-outer mr-xs mb-xs"
      @click="handleClick(inx)"
    >
      <view v-if="d.isPast && isGuardian" :class="`status-banner status-${d.clockinStatus}`"></view>
      <view
        :class="[
          'calendar-wrap',
          d.isPast ? 'day-past' : 'day-future',
          {
            'day-today': d.monthDate === '今天',
            'day-active': activeInx === d.inx,
          },
        ]"
      >
        <view class="font-desc">{{ d.monthDate }}</view>
        <view class="font-title bold mt-s mb-s">{{ d.weekName }}</view>
        <view class="day-wrap font-desc text-nowrap">第{{ inx + 1 }}天</view>
      </view>
    </view>
  </imp-space>
</template>
<script lang="ts">
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { showInfo } from '@/utils/tools';
import { defineComponent, PropType } from 'vue';

export interface ICalendar {
  inx: number;
  weekName: string;
  monthDate: string; // 日期文本
  isPast: boolean; // 是否过时
  clockinDate: number;
  yearMonth: string; // 年月
  clockinStatus: 0 | 1;
}

export default defineComponent({
  components: { ImpSpace },
  props: {
    calendars: {
      type: Array as PropType<ICalendar[]>,
      default: () => [],
    },
    curKey: {
      type: String,
      default: () => 'a',
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    monthInx: {
      type: Number,
      default: -1,
    },
    activeInx: {
      type: Number,
      default: -1,
    },
  },
  emits: ['onClick'],
  setup(props, emits) {
    const isGuardian = loginStore().currentUserType == EUserType.guardian;

    const handleClick = (inx: number) => {
      const c = props.calendars[inx];
      if (!c.isPast && c.monthDate !== '今天') {
        showInfo(`${c.monthDate} 打卡未开始`);
        return;
      }
      emits.emit('onClick', { inx, monthInx: props.monthInx });
    };
    return { handleClick, isGuardian };
  },
});
</script>
<style scoped lang="scss">
.calendar-outer {
  flex-shrink: 0;
  width: 110rpx;
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
    padding: $ui-gap-xs;

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
      padding: $ui-gap-xxs;
    }
  }
}
</style>
