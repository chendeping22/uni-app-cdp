<template>
  <CustomPage title="打卡日历" bg-type="white">
    <view v-for="(m, inx) in calendars.array" :key="`month_${m.month}`">
      <view class="month-bar">{{ m.month }}</view>
      <view class="calendar-wrap">
        <Calendars
          :active-inx="activeInx"
          :calendars="m.list"
          :month-inx="inx"
          wrap
          @onClick="handleClick"
        />
      </view>
    </view>
  </CustomPage>
</template>
<script lang="ts">
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, reactive, ref } from 'vue';
import Calendars, { ICalendar } from './components/calendars/index.vue';
export default defineComponent({
  components: { Calendars, CustomPage },
  setup() {
    const t = Date.now();
    const activeInx = ref(-1);

    const calendars = reactive({ array: [] } as {
      array: {
        month: string;
        list: ICalendar[];
      }[];
    });
    /** 按年月分类 */
    const classifyByMonth = (originList: ICalendar[]) => {
      if (!originList.length) return;
      const obj = {} as IObject<ICalendar[]>;
      originList.forEach(o => {
        !obj[o.yearMonth] && (obj[o.yearMonth] = []);
        obj[o.yearMonth].push(o);
      });
      calendars.array = Object.keys(obj).map(k => ({ month: k, list: obj[k] }));
    };

    const handleClick = (item: { inx: number; monthInx: number }) => {
      activeInx.value = item.inx;
      const prevMonths = calendars.array.slice(0, item.monthInx);
      // let realInx = 0;
      const prevSize = prevMonths.reduce((total, cur) => total + cur.list.length, 0);

      uni.$emit('onCalendarChange', prevSize + item.inx);
      uni.navigateBack({});
    };

    onBeforeMount(() => {
      const p = getPageParams<{
        activeInx: string;
        calendars: string;
      }>();
      activeInx.value = Number.parseInt(p.activeInx);
      try {
        const a = decodeURIComponent(p.calendars);
        const val = JSON.parse(a);
        classifyByMonth(val);
      } catch (e) {}
    });
    return { t, activeInx, calendars, handleClick };
  },
});
</script>
<style lang="scss" scoped>
.month-bar {
  line-height: 64rpx;
  height: 64rpx;
  color: $ui-color-placeholder;
  text-align: center;
  background: rgba($ui-color-base, 0.03);
}
.calendar-wrap {
  padding: $ui-gap-default $ui-gap-xs;
}
</style>
