<template>
  <picker-view
    v-if="columnList.length && state.valueArr"
    class="u-select__body__picker-view"
    :value="state.valueArr"
    :indicator-style="indicatorHeight ? `height: ${indicatorHeight}` : ''"
    @change="columnChange"
    @pickstart="pickstart"
    @pickend="pickend"
  >
    <picker-view-column v-for="(item, index) in columnList" :key="index">
      <view
        v-for="item1 in item"
        :key="item.value"
        class="u-select__body__picker-view__item"
        :style="
          indicatorHeight
            ? {
                height: indicatorHeight,
              }
            : {}
        "
      >
        <view class="u-line-1">
          <view class="u-line-1">{{ item1.label }}</view>
          <view v-if="item1.desc" class="u-line-1 footnote-regular desc">{{ item1.desc }} </view>
        </view>
      </view>
    </picker-view-column>
  </picker-view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { isEqual } from 'lodash-es';
import { computed, onBeforeMount, reactive, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    value?: string;
    list?: { label: string; value: string }[][];
    start?: string;
    end?: string;
    type?: 'day' | 'month'; // | 'week'
    indicatorHeight?: string;
  }>(),
  {
    indicatorHeight: '',
  },
);

const emit = defineEmits<{
  (e: 'moving', value: boolean): void;
  (e: 'update:value', value: string): void;
}>();

const column = reactive<any>({
  year: [],
  month: [],
  day: [],
});

const state = reactive<any>({
  valueArr: null,
  selectValue: [],
  defaultSelector: [],
});

const columnList = computed(() => {
  if (props.list) {
    return props.list;
  }

  if (props.type === 'month') {
    return [column.year, column.month];
  }

  return [column.year, column.month, column.day];
});

const pickstart = () => {
  // #ifdef MP-WEIXIN
  emit('moving', true);
  // #endif
};

const pickend = () => {
  // #ifdef MP-WEIXIN
  emit('moving', false);
  // #endif
};

const generateArray = (start, end) => {
  start = Number(start);
  end = Number(end);
  end = end > start ? end : start;
  // 生成数组，获取其中的索引，并剪出来
  return [...Array(end + 1).keys()].slice(start);
};

const columnChange = e => {
  // let index = null;
  let columnIndex = e.detail.value;
  // 由于后面是需要push进数组的，所以需要先清空数组
  const selectValue: any = [];
  // 初始默认选中值
  columnIndex.map((item, index) => {
    let data = columnList.value[index][item];
    if (data) {
      selectValue.push({
        ...data,
        index: item,
      });
    }
  });
  state.selectValue = selectValue;
  let _value = selectValue.reduce((_date, item) => {
    return `${_date}${_date ? '-' : ''}${item.value}`;
  }, '');

  if (props.type) {
    _value = dayjs(props.type === 'month' ? `${_value}-01` : _value).format('YYYY-MM-DD');
  }

  emit('update:value', _value);
};

watch(
  () => state.selectValue,
  (newVal, oldVal) => {
    if (!props.type || isEqual(newVal, oldVal)) {
      return;
    }

    let _valueArr;

    const _changeYear = newVal[0].value !== oldVal[0]?.value;

    // 年变更
    if (_changeYear) {
      // 选择的是不是最大的一年
      if (newVal[0].value >= endParams.value.year) {
        column.month = generateArray(startParams.value.month, endParams.value.month).map(i => {
          return { label: `${i}月`, value: i };
        });
        if (newVal[1].value > endParams.value.month) {
          _valueArr = [...state.valueArr];
          _valueArr.splice(1, 1, endParams.value.month);
        }
      } else if (column.month.length !== 12) {
        column.month = generateArray(1, 12).map(i => {
          return { label: `${i}月`, value: i };
        });
      }
    }
    // 月变更
    if (props.type === 'day' && (_changeYear || newVal[1].value !== oldVal[1]?.value)) {
      let _startD = 1;
      let maxDay = dayjs(`${newVal[0].value}-${newVal[1].value}-01`).endOf('month').date();
      if (newVal[0].value === endParams.value.year && newVal[1].value === endParams.value.month) {
        maxDay = endParams.value.day;
        _startD = startParams.value.day;
        if (newVal[2].value > endParams.value.day) {
          _valueArr = _valueArr || state.valueArr;
          _valueArr.splice(2, 1, endParams.value.day);
        }
      }
      column.day = generateArray(_startD, maxDay).map(i => {
        return { label: `${i}日`, value: i };
      });
    }

    if (_valueArr) {
      state.valueArr = _valueArr;
    }
  },
);

const endParams = computed(() => {
  const _day = dayjs(props.end || '2050-12-31');
  return {
    year: _day.year(),
    month: _day.month() + 1,
    day: _day.date(),
  };
});

const startParams = computed(() => {
  const _day = dayjs(props.start || '1950-01-01');
  return {
    year: _day.year(),
    month: _day.month() + 1,
    day: _day.date(),
  };
});

onBeforeMount(() => {
  if (props.list) {
    if (props.value !== undefined || props.value !== null) {
      let _valueArr: number[] = [];
      props.list.forEach((item, index) => {
        const _index = item.findIndex(i => i.value === props.value);
        _valueArr.push(_index >= 0 ? _index : 0);
      });
      state.valueArr = _valueArr;
    }
    return;
  }

  let _startY = startParams.value.year;
  let _endY = endParams.value.year;
  let _startM = 12;
  let _endM = 12;
  let _startD = 1;
  let _value = props.value;
  if (_value && props.end && dayjs(_value).isAfter(props.end)) {
    _value = props.end;
  }

  const _val = dayjs(_value || props.start || undefined);
  const year = _val.year();
  const month = _val.month() + 1;
  const day = _val.date();
  let maxDay = _val.endOf('month').date();
  let _valueArr: number[] = [];

  if (year === _startY) {
    _startM = startParams.value.month;
    if (month === _startM) {
      _startD = startParams.value.day;
    }
  }

  if (year === _endY) {
    _endM = endParams.value.month;
    if (month === _endM) {
      maxDay = endParams.value.day;
    }
  }

  let yearIndex = 0;

  column.year = generateArray(_startY, _endY).map((i, index) => {
    if (i === year) {
      yearIndex = index;
    }
    return { label: `${i}年`, value: i };
  });

  _valueArr.push(yearIndex);

  let monthIndex = 0;

  column.month = generateArray(_startM, _endM).map((i, index) => {
    if (i === month) {
      monthIndex = index;
    }
    return { label: `${i}月`, value: i };
  });

  _valueArr.push(monthIndex);

  if (props.type === 'day') {
    let dayIndex = 0;
    column.day = generateArray(_startD, maxDay).map((i, index) => {
      if (i === day) {
        dayIndex = index;
      }
      return { label: `${i}日`, value: i };
    });

    _valueArr.push(dayIndex);
  }

  state.valueArr = _valueArr;
});
</script>

<style scoped lang="scss">
.u-select {
  &__body {
    width: 100%;
    height: 500rpx;
    overflow: hidden;
    background-color: #fff;

    &__picker-view {
      height: 100%;
      box-sizing: border-box;

      &__item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        text-align: center;
        color: $u-main-color;
        padding: 0 32rpx;
        .desc {
          padding-top: 8rpx;
          color: $color-text-description;
        }
      }
    }
  }
}
</style>
