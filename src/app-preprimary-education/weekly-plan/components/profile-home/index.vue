<template>
  <view :class="[className, 'top-area']" v-if="curClazz.title">
    <view class="flex-inline ml-xl" @click="showPicker = true">
      <text class="font-xt ml-l mr-s bold">{{ curClazz.title || '/' }}</text>
      <c-icon name="icon_arrow_down" :size="48" color-type="placeholder" />
    </view>
  </view>
  <view class="time-range bg-white">
    <c-icon
      name="icon_arrow_right_fill"
      size="48"
      :color-type="currentWeekNum.value === startWeekNum ? 'disabled' : 'placeholder'"
      @click="handleChangeWeek(-1)"
    />
    <view class="plr-xl" @click="showTimePicker = true">
      {{ timeListOpts.find(item => item.checked === true)?.text }}
    </view>
    <c-icon
      name="icon_arrow_collapse"
      size="48"
      :color-type="currentWeekNum.value === endWeekNum ? 'disabled' : 'placeholder'"
      @click="handleChangeWeek(1)"
    />
  </view>
  <view class="plr-l ptb-s flex-between button-area"> </view>
  <ClazzPicker
    v-model:show="showPicker"
    v-model:value="curSelectClazz"
    @onLoadPicker="handleLoadPicker"
  />
  <c-select
    v-model:show="showTimePicker"
    v-model:list="timeListOpts"
    :auto-close-after-select="true"
    :show-check-icon="true"
    title="请选择"
    title-type="icon"
    @onSelect="handleTimeRangeChange"
  />
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { showInfo } from '../../../utils/tools';
import ClazzPicker, { IPicker } from '../clazz-picker/index.vue';
interface IClazz {
  title: string;
  clazzId: string;
}
interface IProps {
  className?: string | string[];
  curClazz: IClazz;
}
dayjs.extend(weekOfYear);
dayjs.locale('zh-cn');
const TOTAL_WEEK = 13;

const props = withDefaults(defineProps<IProps>(), {
  className: '',
});
console.log('🚀 ~ props ~ props:', props);
const emits = defineEmits(['update:curClazz', 'update:curWeek', 'onLoadClazz']);

const showPicker = ref(false);
const curClazz = ref(props.curClazz || ({} as IClazz));
const curSelectClazz = ref([] as { value: any; label?: string }[]);

const staticWeekNum = dayjs().week();

const showTimePicker = ref(false); // 周选择

const currentWeekNum = reactive({ value: staticWeekNum }); // 当前的周数

// 最早的周数
const startWeekNum = computed(() => {
  return staticWeekNum - TOTAL_WEEK;
});
// 最后的周数
const endWeekNum = computed(() => {
  return staticWeekNum + TOTAL_WEEK;
});
// 周数选择项
const timeListOpts = computed(() => {
  const weekIdx: any[] = [];
  for (let i = -TOTAL_WEEK; i <= TOTAL_WEEK; i++) {
    weekIdx.push(i + staticWeekNum);
  }
  const opts = weekIdx.map((idx: number) => {
    const start = dayjs().week(idx).startOf('week');
    const end = dayjs().week(idx).endOf('week');
    const year = start.year();
    const weekNum = start.week();
    return {
      text: `${year}-第${weekNum}周(${start.format('MM-DD')}~${end.format('MM-DD')})`,
      checked: idx === staticWeekNum,
      weekNum: idx,
    };
  });
  return opts;
});
/** 初始化默认班级 */
const handleLoadPicker = async (data: IPicker[]) => {
  if (!data.length) {
    showInfo('暂无可查看班级');
    return;
  }
  const col_1 = data[0];
  const col_2 = col_1.children[0];
  const col_3 = col_2.children[0];
  curSelectClazz.value = [
    { value: col_1.value, label: col_1.label },
    { value: col_2.value, label: col_2.label },
    { value: col_3.value, label: col_3.label },
  ];
};

const handleChangeWeek = (flag: 1 | -1) => {
  if (
    (currentWeekNum.value === startWeekNum.value && flag === -1) ||
    (currentWeekNum.value === endWeekNum.value && flag === 1)
  )
    return;
  const curCheckedIdx = timeListOpts.value.findIndex(item => item.checked === true);
  const newIdx = curCheckedIdx + flag;
  timeListOpts.value.splice(curCheckedIdx, 1, {
    ...timeListOpts.value[curCheckedIdx],
    checked: false,
  });
  timeListOpts.value.splice(newIdx, 1, {
    ...timeListOpts.value[newIdx],
    checked: true,
  });
  currentWeekNum.value = timeListOpts.value[newIdx].weekNum;
};

const handleTimeRangeChange = (idx: number) => {
  const curCheckedIdx = timeListOpts.value.findIndex(item => item.checked === true);
  timeListOpts.value.splice(curCheckedIdx, 1, {
    ...timeListOpts.value[curCheckedIdx],
    checked: false,
  });
  timeListOpts.value.splice(idx, 1, {
    ...timeListOpts.value[idx],
    checked: true,
  });
  currentWeekNum.value = timeListOpts.value[idx].weekNum;
};

watch(currentWeekNum, () => {
  emits('update:curWeek', currentWeekNum.value);
  emits('onLoadClazz');
});

/** 设置当前选中班级对象 */
watchEffect(() => {
  if (curSelectClazz.value.length > 0) {
    curClazz.value = {
      title: curSelectClazz.value[2].label || '',
      clazzId: curSelectClazz.value[2].value || '',
    };
    // emits('update:curClazz', curClazz.value);
    emits('update:curClazz', curSelectClazz.value);
    emits('onLoadClazz');
  }
});
</script>
<style lang="scss" scoped>
.top-area {
  display: flex;
  width: 100%;
  height: 232rpx;
  background: url(../../../static/image/background_weekly_plan.png) no-repeat;
  background-size: 100% 100%;
}
.time-range {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  font-size: $ui-font-size-content;
  color: $ui-color-font-base;
  height: 88rpx;
}
</style>
