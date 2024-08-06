<script setup lang="ts">
import SchemeEmpty from '@/app-class-evaluation/components/scheme-empty.vue';
import {
  SortImgEnum,
  SortTypeEnum,
  getClassReportFormMonth,
} from '@/app-class-evaluation/services/report';
import sort from '@/app-class-evaluation/static/sort.svg';
import sort_asc from '@/app-class-evaluation/static/sort_asc.svg';
import sort_desc from '@/app-class-evaluation/static/sort_desc.svg';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { concat, debounce, map } from 'lodash-es';
import { computed, onBeforeMount, onBeforeUnmount, reactive, watch } from 'vue';

const sortImg = {
  [SortImgEnum.NORMAL]: sort,
  [SortImgEnum.DESC]: sort_desc,
  [SortImgEnum.ASC]: sort_asc,
};

const props = defineProps({
  date: {
    type: Number,
  },
});

const state = reactive<{
  /** 当前排序字段 */
  sortNameKey?: number;
  /** 当前排序类型 */
  sortImgType: number;
  /** 查询排序参数 */
  sortType: number;
  listDate: any[];
  tabList: string[];
  listItemKeys: string[];
  /** 无关联的评价方案 */
  noSchema: boolean;
}>({
  sortNameKey: 0,
  sortImgType: SortImgEnum.ASC,
  sortType: SortTypeEnum.CLAZZ,
  listDate: [],
  tabList: [],
  listItemKeys: [],
  noSchema: false,
});

const isSticky = computed(() => state.tabList.length > 4);

const thWidth = (label: string, index: number) => {
  const labelLength = (label?.length ?? 0) <= 3 ? 4 : label?.length ?? 0;
  let styleVal;
  if (index === 0) {
    styleVal = { width: '158rpx' };
  } else {
    styleVal = { width: index === 1 ? '148rpx' : `${labelLength * 28}rpx` };
  }
  return isSticky.value ? styleVal : {};
};

const handleToDetail = debounce((item: { classId?: string; clazz?: string }) => {
  uni.navigateTo({
    url: `/app-class-evaluation/pages/report/classDetail/index?id=${item?.classId}&value=${dayjs(
      props.date,
    ).format('YYYY-MM-DD')}&type=month`,
  });
}, 200);

const fetchList = async () => {
  try {
    uni.showLoading();
    const params = {
      /** 评价日期-月 */
      evaluationMonth: props?.date ? dayjs(props.date).format('M') : dayjs().format('M'),
      /** 评价日期-年 */
      evaluationYear: props?.date ? dayjs(props.date).format('YYYY') : dayjs().format('YYYY'),
      /** 排序参数 */
      sortType: state.sortType,
    };
    const res: any = await getClassReportFormMonth(params);
    state.listDate = [];
    uni.hideLoading();
    if (res === 'no_scheme') {
      state.noSchema = true;
      state.listDate = [];
      return;
    }
    state.noSchema = false;
    state.listDate = res?.monthReportFormDetail || [];
    const tab = res?.monthReportFormLabel ? res.monthReportFormLabel.sort().reverse() : [];
    state.tabList = concat(
      ['班级', '月平均分'],
      map(tab, v => `第${v}周`),
    );
    state.listItemKeys = concat(['abbreviation', 'totalScore'], tab);
  } catch (e: any) {
    uni.hideLoading();
    showInfo(e?.desc || '请求数据失败');
  } finally {
    uni.stopPullDownRefresh();
  }
};

const handleSortType = (asc: number, desc: number) => {
  let type = 1;
  if (![asc, desc].includes(state.sortType)) {
    type = desc;
    state.sortImgType = SortImgEnum.DESC;
  }
  if (state.sortType === desc) {
    type = asc;
    state.sortImgType = SortImgEnum.ASC;
  }
  if (state.sortType === asc) {
    type = desc;
    state.sortImgType = SortImgEnum.DESC;
  }
  state.sortType = type;
};

const handleSort = (index: number) => {
  state.sortNameKey = index;
  switch (index) {
    case 0: //班级
      state.sortType =
        state.sortType === SortTypeEnum.CLAZZ ? SortTypeEnum.CLAZZ_DESC : SortTypeEnum.CLAZZ;
      state.sortImgType =
        state.sortType === SortTypeEnum.CLAZZ ? SortImgEnum.ASC : SortImgEnum.DESC;
      break;
    case 1:
      handleSortType(SortTypeEnum.MONTH, SortTypeEnum.MONTH_DESC);
      break;
  }
  fetchList();
};

const getSortImg = (index: number) => {
  if (state.sortNameKey === index) {
    return sortImg[state.sortImgType];
  }
  return sortImg[0];
};

watch(
  () => props?.date,
  val => {
    if (!val) return;
    fetchList();
  },
  { immediate: true },
);
const formatTableValue = (list: any, line: any) => {
  const val = list[line] ?? list?.weekScore?.[line];
  if (val && String(val).indexOf('.') > -1) {
    const valMap = String(val)?.split('.');
    return `${valMap?.[0]}.${valMap?.[1]?.slice(0, 1)}`;
  }
  return val ?? '/';
};

const lineStyle = (index: number, data?: string | number) => {
  const size = String(data)?.length > 4 ? 'mini-size' : 'normal-size';
  return index === 0 && data ? `clazz-statistics-table-txt ${size}` : '';
};

onBeforeMount(() => {
  uni.$on('onPullDownRefreshFromEvaluationPage', fetchList);
});

onBeforeUnmount(() => {
  uni.$off('onPullDownRefreshFromEvaluationPage', fetchList);
});
</script>

<template>
  <view class="clazz-statistics">
    <view class="clazz-statistics-content" v-if="state.listDate?.length">
      <view class="clazz-statistics-header">
        <view class="clazz-statistics-tab" :class="isSticky ? 'sticky-style' : 'normal-style'">
          <view
            v-for="(tab, index) in state.tabList"
            :key="tab"
            class="clazz-statistics-tab-item"
            :class="isSticky ? 'sticky-item' : 'normal-item'"
            :style="thWidth(tab, index)"
            @click="handleSort(index)"
          >
            <text :class="state.sortNameKey === index ? 'text-selected' : 'label-normal'">{{
              tab
            }}</text>
            <u-image
              v-if="[0, 1].includes(index)"
              :src="getSortImg(index)"
              :width="24"
              :height="24"
              :fade="false"
              :show-loading="false"
              :style="{ margin: '0 8rpx' }"
            ></u-image
          ></view>
        </view>
        <view v-if="!isSticky" class="tab-right"></view>
      </view>
      <view class="clazz-statistics-table">
        <view v-for="(list, index) in state.listDate">
          <view
            :key="list?.classId"
            class="clazz-statistics-table-item"
            :class="
              index > 0 && list.gradeId !== state.listDate[index - 1]?.gradeId
                ? `item-divider ${isSticky ? 'sticky-style' : ''}`
                : ''
            "
            @click.stop="handleToDetail(list)"
          >
            <view class="clazz-statistics-table-left">
              <view
                v-for="(line, index) in state.listItemKeys"
                :key="line + index"
                class="clazz-statistics-table-line"
                :style="thWidth(state.tabList[index], index)"
                :class="isSticky ? 'sticky-item' : 'normal-item'"
                ><view :class="lineStyle(index, list[line])">{{
                  formatTableValue(list, line)
                }}</view></view
              >
            </view>
            <view class="clazz-statistics-table-right">
              <view class="line-icon">
                <u-icon name="arrow-right" color="#00000073"></u-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <scheme-empty v-else-if="state.noSchema" />
    <view class="class-list-empty" v-else>
      <u-empty-custom text="暂无数据" mode="data"></u-empty-custom>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@mixin sticky-left {
  position: sticky;
  z-index: 2;
  background-color: $color-background-base;
}

.clazz-statistics {
  padding: 24rpx 0;
  height: 100%;
  width: 100%;
  margin-bottom: 90rpx;
  &-content {
    background-color: $color-bg-container;
    width: 100%;
    overflow: auto;
    border-radius: 16rpx;
    box-shadow: 0 1px 2px 0 $control-item-bg-hover;
    padding: 16rpx 0;
  }
  &-header {
    width: 100%;
    display: flex;
  }
  &-tab {
    display: flex;
    flex: 1;
    &-item {
      word-break: keep-all;
      color: $color-text-description;
      font-size: 26rpx;
      margin-bottom: 16rpx;
      margin: 0 16rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      &:last-child {
        margin-right: 0;
      }
      &:first-child {
        @include sticky-left();
        left: 0;
        margin: 0;
        justify-content: left;
        padding-left: 32rpx;
      }
      &:nth-child(2) {
        @include sticky-left();
        left: 158rpx;
        margin: 0;
      }
    }
  }
  &-table {
    width: 100%;
    &-item {
      display: flex;
      align-items: center;
      width: 100%;
    }
    &-left {
      display: flex;
      align-items: center;
      margin: 24rpx 0;
      flex: 1;
    }
    &-line {
      margin: 0 16rpx;
      word-break: keep-all;
      text-align: center;
      &:last-child {
        margin-right: 0;
      }
      &:first-child {
        @include sticky-left();
        margin: 0;
        padding-left: 32rpx;
        left: 0;
      }
      &:nth-child(2) {
        color: $color-primary;
        font-weight: 500;
        @include sticky-left();
        left: 158rpx;
        margin: 0;
        padding: 0 16rpx;
      }
    }
    &-txt {
      border-radius: 16rpx;
      background: $blue-02;
      min-width: 110rpx;
      min-height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
    }
    &-right {
      display: flex;
      position: sticky;
      right: 0;
      z-index: 2;
      background-color: $color-background-base;
      // align-self: stretch;
      .line-icon {
        margin: 0 12rpx;
        display: flex;
        align-items: center;
      }
    }
  }
  .item-divider {
    border-top: 8rpx solid $color-split;
  }
  .normal-item {
    flex: 1;
  }
  .sticky-item {
    flex: 0 0 auto;
  }
  .tab-right {
    width: 48rpx;
  }
  .class-list-empty {
    flex: 1;
    padding-top: 80rpx;
  }
}
.normal-size {
  font-size: 30rpx;
}
.mini-size {
  font-size: 24rpx;
}

.sticky-style {
  width: fit-content;
}
.normal-style {
  width: 100%;
}
</style>
