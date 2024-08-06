<script setup lang="ts">
import { getSemesterSummary } from '@/app-class-evaluation/services/statistics';
import { useStatisticsClazzStore } from '@/app-class-evaluation/store/use-statistics-clazz-store';
import { showInfo } from '@/utils/tools';
import { concat, find, map } from 'lodash-es';
import { computed, reactive, watch } from 'vue';
import SchemeSelection from '../components/schemeSelection.vue';

const props = defineProps<{ schemesList: any[] }>();

const store = useStatisticsClazzStore();

const state = reactive<{
  open: boolean;
  schemes: Record<string, any>;
  tabList: string[];
  listDate: any[];
  listItemKeys: string[];
}>({
  open: false,
  schemes: {},
  tabList: [],
  listDate: [],
  listItemKeys: [],
});

const isSticky = computed(() => state.tabList.length > 4);

const thWidth = (label: string, index: number) => {
  const length = label?.length ?? 0;
  const labelLength = length <= 3 || length > 5 ? 4 : length;
  const styleVal = { width: index === 0 ? '158rpx' : `${labelLength * 34}rpx` };
  return isSticky.value ? styleVal : {};
};

const handleToDetail = (item: Record<string, any>) => {
  store.$setClazzInfo(item);
  uni.navigateTo({
    url: `/app-class-evaluation/pages/statistics/classTab/detail?clazzId=${
      item?.clazzId || ''
    }&schemeId=${state.schemes?.initialSchemeId || ''}`,
  });
};

const getList = async (evaluationSchemeId: string) => {
  try {
    uni.showLoading();
    const res: any = await getSemesterSummary(evaluationSchemeId);
    console.log('🚀 ~ getList ~ res:', res);
    uni.hideLoading();
    const tabKeys = res?.honorMap ? Object.keys(res.honorMap) : [];
    const honorColumns = map(tabKeys, v => res.honorMap[v]);
    state.listDate = res?.clazzSemesterSummaryRespList?.length
      ? map(res?.clazzSemesterSummaryRespList, v => ({ ...v, ...v?.honorCountMap }))
      : [];
    state.tabList = concat(['班级', '学期平均分', '荣誉次数'], honorColumns);
    state.listItemKeys = concat(['abbreviation', 'semesterAvg', 'honorTotal'], tabKeys);
  } catch (e: any) {
    uni.hideLoading();
    showInfo(e?.desc || '请求数据失败');
  } finally {
    uni.stopPullDownRefresh();
  }
};

watch(
  () => props.schemesList,
  () => {
    state.schemes = find(props.schemesList, { isDefault: true });
    if (!state.schemes?.initialSchemeId) return;
    getList(state.schemes?.initialSchemeId);
  },
  { immediate: true },
);

watch(
  () => state.schemes,
  val => {
    if (!val?.initialSchemeId) return;
    getList(val?.initialSchemeId);
  },
);

const lineStyle = (index: number, data?: number | string) => {
  const size = String(data)?.length > 4 ? 'mini-size' : 'normal-size';
  return index === 0 && data ? `clazz-statistics-table-txt ${size}` : '';
};
</script>

<template>
  <view class="clazz-statistics">
    <view class="clazz-statistics-header" @click="state.open = true">
      <view class="clazz-statistics-header-left">{{ state.schemes?.schoolYearName }}</view>
      <u-icon name="arrow-right" color="#7D7D7D" size="32"></u-icon>
    </view>
    <view class="clazz-statistics-content" v-if="state.listDate?.length">
      <view class="clazz-statistics-tab" :class="isSticky ? 'sticky-style' : 'normal-style'">
        <view
          v-for="(tab, index) in state.tabList"
          :key="index"
          class="clazz-statistics-tab-item"
          :class="isSticky ? 'sticky-item' : 'normal-item'"
          :style="thWidth(tab, index)"
          >{{ tab }}</view
        >
      </view>
      <view class="clazz-statistics-table">
        <view
          v-for="(list, index) in state.listDate"
          :key="list.clazzId"
          class="clazz-statistics-table-item"
          :class="
            index > 0 && list.gradeId !== state.listDate[index - 1]?.gradeId
              ? `item-divider ${isSticky ? 'sticky-style' : ''}`
              : ''
          "
          @click="handleToDetail(list)"
        >
          <view class="clazz-statistics-table-left">
            <view
              v-for="(line, index) in state.listItemKeys"
              :key="index"
              class="clazz-statistics-table-line"
              :style="thWidth(state.tabList[index], index)"
              :class="isSticky ? 'sticky-item' : 'normal-item'"
              ><view :class="lineStyle(index, list[line])">{{ list[line] ?? '/' }}</view></view
            >
          </view>
          <view class="clazz-statistics-table-right">
            <view class="line-divider"></view>
            <view class="line-icon">
              <u-icon name="arrow-right" color="#00000073"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="class-list-empty" v-else>
      <u-empty-custom text="暂无数据" mode="data"></u-empty-custom>
    </view>
  </view>
  <SchemeSelection
    v-model="state.schemes"
    :list="schemesList"
    :open="state.open"
    @onClose="state.open = false"
  ></SchemeSelection>
</template>

<style lang="scss" scoped>
@mixin sticky-left {
  position: sticky;
  z-index: 2;
  background-color: $color-background-base;
  align-self: stretch;
  display: flex;
  align-items: center;
}

@mixin card {
  background-color: $color-bg-container;
  border-radius: 16rpx;
  box-shadow: 0 1px 2px 0 $control-item-bg-hover;
}

.clazz-statistics {
  padding: 24rpx 32rpx;
  height: 100%;
  width: 100%;
  overflow: auto;
  &-header {
    @include card();
    margin-bottom: 24rpx;
    padding: 26rpx 32rpx;
    display: flex;
    justify-content: space-between;
    &-left {
      color: $color-text;
      font-size: 32rpx;
    }
  }
  &-content {
    width: 100%;
    overflow: auto;
    flex: 1;
    @include card();
    padding: 16rpx 0;
  }
  &-tab {
    display: flex;
    margin-right: 32rpx;
    align-items: center;
    &-item {
      word-break: keep-all;
      color: $color-text-description;
      font-size: 26rpx;
      text-align: center;
      @include ellipsis;
      &:last-child {
        margin-right: 0;
      }
      &:first-child {
        @include sticky-left();
        left: 0;
        margin: 0;
        padding-left: 32rpx;
        text-align: left;
        min-width: 160rpx;
      }
      &:nth-child(2) {
        @include sticky-left();
        left: 160rpx;
        margin: 0;
        min-width: 170rpx;
        justify-content: center;
      }
      &:nth-child(3) {
        @include sticky-left();
        left: 330rpx;
        margin: 0;
        padding: 0 16rpx;
        min-width: 140rpx;
        justify-content: center;
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
      padding: 0 16rpx;
      word-break: keep-all;
      text-align: center;
      font-size: 30rpx;
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
        left: 160rpx;
        margin: 0;
        padding: 0 16rpx;
        font-size: 32rpx;
        justify-content: center;
      }
      &:nth-child(3) {
        color: $color-warning;
        font-weight: 500;
        font-size: 32rpx;
        @include sticky-left();
        left: 330rpx;
        justify-content: center;
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
      align-self: stretch;
      .line-divider {
        width: 8rpx;
        background: linear-gradient(90deg, #00000000 0%, #00000014 82.2%, #00000033 100%);
      }
      .line-icon {
        margin-right: 16rpx;
        margin-left: 20rpx;
        display: flex;
        align-items: center;
      }
    }
  }
  .item-divider {
    border-top: 8rpx solid $color-split;
  }
  .class-list-empty {
    flex: 1;
    padding-top: 80rpx;
  }
  .normal-item {
    flex: 1;
    &:first-child {
      flex: none;
    }
  }
  .sticky-item {
    flex: 0 0 auto;
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
}
</style>
