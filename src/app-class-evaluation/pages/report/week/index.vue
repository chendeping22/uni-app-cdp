<script setup lang="ts">
import SchemeEmpty from '@/app-class-evaluation/components/scheme-empty.vue';
import {
SortImgEnum,
SortTypeEnum,
getClassReportFormWeek,
} from '@/app-class-evaluation/services/report';
import sort from '@/app-class-evaluation/static/sort.svg';
import sort_asc from '@/app-class-evaluation/static/sort_asc.svg';
import sort_desc from '@/app-class-evaluation/static/sort_desc.svg';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue';

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

const tabList = ref<string[]>(['班级', '周总分', '当日加分', '当日失分']);

const state = reactive<{
  /** 当前排序字段 */
  sortNameKey?: number;
  /** 当前排序类型 */
  sortImgType: number;
  /** 查询排序参数 */
  sortType: number;
  listDate: any[];
  /** 无关联的评价方案 */
  noSchema: boolean;
}>({
  sortNameKey: 0,
  sortImgType: SortImgEnum.ASC,
  sortType: SortTypeEnum.CLAZZ,
  listDate: [],
  noSchema: false,
});

const listItemKeys = computed(() => ['abbreviation', 'totalScore', 'addScore', 'subtractScore']);

const handleToDetail = debounce((item: { classId?: string; className?: string }) => {
  uni.navigateTo({
    url: `/app-class-evaluation/pages/report/classDetail/index?id=${item?.classId}&value=${dayjs(
      props.date,
    ).format('YYYY-MM-DD')}&type=week`,
  });
}, 200);

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
      handleSortType(SortTypeEnum.WEEK, SortTypeEnum.WEEK_DESC);
      break;
    case 2:
      handleSortType(SortTypeEnum.ADD, SortTypeEnum.ADD_DESC);
      break;
    case 3:
      handleSortType(SortTypeEnum.SUBTRACT, SortTypeEnum.SUBTRACT_DESC);
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

const fetchList = async () => {
  try {
    uni.showLoading();
    const params = {
      evaluationDate: props?.date
        ? dayjs(props.date).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
      sortType: state.sortType,
    };
    const res: any = await getClassReportFormWeek(params);
    uni.hideLoading();
    if (res === 'no_scheme') {
      state.noSchema = true;
      state.listDate = [];
      return;
    }
    state.noSchema = false;
    state.listDate = res || [];
  } catch (e: any) {
    uni.hideLoading();
    showInfo(e?.desc || '请求数据失败');
  } finally {
    uni.stopPullDownRefresh();
  }
};

watch(
  () => props?.date,
  val => {
    if (!val) return;
    fetchList();
  },
  { immediate: true },
);

const lineStyle = (index: number, value?: string | number) => {
  if (index === 0) {
    const size = String(value)?.length > 4 ? 'mini-size' : 'normal-size';
    return value ? `clazz-statistics-table-txt ${size}` : '';
  }
  if ([2, 3].includes(index)) {
    return !value ? 'text-normal' : '';
  }
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
      <view class="clazz-statistics-tab">
        <view
          v-for="(tab, index) in tabList"
          :key="index"
          class="clazz-statistics-tab-item"
          @click="handleSort(index)"
        >
          <text :class="state.sortNameKey === index ? 'text-selected' : 'label-normal'">{{
            tab
          }}</text>
          <u-image
            :src="getSortImg(index)"
            :width="24"
            :height="24"
            :fade="false"
            :show-loading="false"
            :style="{ margin: '0 8rpx' }"
          ></u-image>
        </view>
      </view>
      <view class="clazz-statistics-table">
        <view
          v-for="(list, index) in state.listDate"
          :key="list?.classId"
          class="clazz-statistics-table-item"
          :class="
            index > 0 && list.gradeId !== state.listDate[index - 1]?.gradeId ? 'item-divider' : ''
          "
          @click.stop="handleToDetail(list)"
        >
          <view class="clazz-statistics-table-left">
            <view
              v-for="(line, index) in listItemKeys"
              :key="line + index"
              class="clazz-statistics-table-line"
              ><view :class="lineStyle(index, list[line])">{{
                index === 2 && list[line] ? `+${list[line]}` : list[line] ?? '/'
              }}</view></view
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
  overflow: auto;
  margin-top: 36rpx;
  flex: 1;
  margin-bottom: 90rpx;
  &-content {
    background-color: $color-bg-container;
    width: 100%;
    flex: 1;
    box-shadow: 0 1px 2px 0 $control-item-bg-hover;
    padding: 16rpx;
  }
  &-tab {
    display: flex;
    // width: 100%;
    margin: 0 24rpx 0 16rpx;
    background-color: $color-bg-container;
    align-items: center;
    &-item {
      flex: 1;
      word-break: keep-all;
      color: $color-text-description;
      font-size: 26rpx;
      margin-bottom: 16rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      &:last-child {
        margin-right: 0;
      }
      &:first-child {
        justify-content: left;
        width: 160rpx;
      }
    }
  }
  &-table {
    width: 100%;
    flex: 1;
    &-item {
      display: flex;
      align-items: center;
      border-bottom: 2rpx solid $color-split;
      &:last-child {
        border-bottom: none;
      }
    }
    &-left {
      display: flex;
      align-items: center;
      margin: 24rpx 0;
      flex: 1;
    }
    &-line {
      flex: 1;
      margin: 0 16rpx;
      word-break: keep-all;
      text-align: center;
      width: calc((100% - 64rpx) / 4);
      &:last-child {
        margin-right: 0;
      }
      &:nth-child(2) {
        color: $color-primary;
        font-weight: 500;
      }
      &:nth-child(3) {
        color: $color-error;
      }
      &:nth-child(4) {
        color: $color-success;
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
      background-color: $color-background-base;
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
  .text-normal {
    color: $color-text-label;
  }
  .text-selected {
    color: $color-primary;
  }
  .label-normal {
    color: $color-text-description;
  }
  .class-list-empty {
    flex: 1;
    padding-top: 80rpx;
  }
  .normal-size {
    font-size: 30rpx;
  }
  .mini-size {
    font-size: 24rpx;
  }
}
</style>
