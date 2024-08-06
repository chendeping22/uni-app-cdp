<template>
  <view class="payslip-list safe-area-inset-bottom">
    <view class="total-card">
      <image class="total-bg" :src="listBgPng"></image>
      <view class="total-year" @click="handleShowPicker"
        ><text style="margin-right: 16rpx">{{ currentYear?.format('YYYY') }}年度</text>
        <u-icon name="arrow-down" :size="40"></u-icon
      ></view>
      <view class="total-sum">累计实发：¥ {{ allCount }}</view>
    </view>
    <view class="salary-wrap">
      <!-- <view v-if="!(list?.length > 0)" style="margin-top: 100rpx">
          <u-empty-custom text="暂无数据" />
        </view> -->
      <view v-for="monthIndex in monthList" :key="monthIndex" class="salary-block">
        <view class="title">{{ dayjs().set('month', monthIndex)?.format('MM') }}月</view>
        <template v-if="!hasData(monthIndex)">
          <view class="empty-card1 flex-center">暂无发放记录</view>
        </template>
        <template v-else>
          <view
            v-for="item in list?.filter(one => dayjs(one.payslipDate).month() === monthIndex)"
            :key="item.detailId"
            class="salary-card"
            @click="goDetailPage(item.detailId)"
          >
            <view class="date">{{
              item.publishTime ? dayjs(item.publishTime).format('MM-DD HH:mm') : '-'
            }}</view>
            <view class="">
              <view class="name">{{ item.payslipName }} </view>
              <!-- <view class="sum">实发：{{ item.actualAmount }} </view> -->
            </view>
            <view class="flex-between" style="margin-top: 16rpx">
              <view class="tag">
                <Tag
                  :text="readStatusText(item.readStatus)?.label"
                  :color="readStatusText(item.readStatus)?.color"
                  :style="{ fontSize: '26rpx', height: '48rpx' }"
                />
                <view style="margin-left: 24rpx; display: inline-block">
                  <Tag
                    :text="confirmStatusText(item.confirmStatus)?.label"
                    :color="confirmStatusText(item.confirmStatus)?.color"
                    :style="{ fontSize: '26rpx', height: '48rpx' }"
                  />
                </view>
              </view>
              <view class="sum">实发：{{ item.actualAmount }} </view>
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
  <!-- <u-picker
      v-model="showPicker"
      mode="time"
      :params="{ year: true }"
      :default-time="defaultTime"
      @confirm="handleConfirm"
    ></u-picker> -->
  <u-select
    v-model="showPicker"
    :list="years.map(one => ({ label: one, value: one }))"
    :default-value="defaultValue"
    @confirm="handleConfirm"
  ></u-select>
</template>

<script setup lang="ts">
import {
  countActualAmount,
  findDataYear,
  mePages,
} from '@/app-teacher-personnel/payslip/api/payslipDetail';
import { confirmStatus, readStatus } from '@/app-teacher-personnel/payslip/helper/enum';
import listBgPng from '@/app-teacher-personnel/static/payslip/list-bg.png';
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { map, max } from 'lodash-es';
import { computed, ref, watch } from 'vue';

const showPicker = ref(false);
// const defaultTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
const defaultValue = ref();
const currentYear = ref();
const list = ref();
const allCount = ref();
const years = ref([]);

// 生成一月到当前月的倒序数组
const monthList = computed(() => {
  const big = max(map(list.value, item => dayjs(item.payslipDate).month())) || 0;
  const bigger = Math.max(big, dayjs().month());
  return Array.from({ length: bigger + 1 }, (v, k) => k).reverse();
});

const readStatusText = val => {
  const text = readStatus.find(l => l.value === val);
  return text;
};

const confirmStatusText = val => {
  const text = confirmStatus.find(l => l.value === val);
  return text;
};

function hasData(month) {
  return list.value?.some?.(item => dayjs(item.payslipDate).month() === month);
}
function goDetailPage(id) {
  uni.navigateTo({
    url: `/app-teacher-personnel/payslip/detail/index?id=${id}&pass=1`,
  });
}

function handleShowPicker() {
  showPicker.value = true;
}

function handleConfirm(arr) {
  console.log('🚀ccc ~ handleConfirm ~ arr:', arr);
  let { value: year, index } = arr[0] || {};
  console.log('🚀ccc ~ handleConfirm ~ year:', year);
  // const { year } = e || {};
  const newDay = dayjs().set('year', year);
  currentYear.value = newDay;
  // defaultValue.value = [index];
  // const newDayStr = newDay?.format('YYYY-MM-DD HH:mm:ss');
  // defaultTime.value = newDayStr;
  // formState.value.materials[currentClickIndex.value].deadline = newDay;
}

async function getCurrentYearData() {
  if (!currentYear.value) {
    return;
  }
  const params = {
    fromDate: currentYear.value.startOf('year').valueOf(),
    toDate: currentYear.value.endOf('year').valueOf(),
    pageNum: 1,
    pageSize: 1000,
  };

  try {
    const res = await mePages(params);
    const { result = [] } = res || {};
    list.value = result;
    // list.value = groupBy(result, 'payslipDate');
  } catch (error) {}
}

async function getTotalSalary() {
  const params = {
    fromDate: currentYear.value.startOf('year').valueOf(),
    toDate: currentYear.value.endOf('year').valueOf(),
  };

  try {
    const res = await countActualAmount(params);
    allCount.value = res.count || 0;
  } catch (error) {}
}
async function getYears() {
  try {
    const res = await findDataYear();
    years.value = res || [];
    if (res?.includes?.(+dayjs().year())) {
      currentYear.value = dayjs();
    } else {
      currentYear.value = dayjs(res?.[0], 'YYYY');
    }
  } catch (error) {}
}

onShow(() => {
  getCurrentYearData();
});

watch(
  () => currentYear.value,
  val => {
    getCurrentYearData();
    getTotalSalary();
    let index = years.value?.findIndex(one => one == val.year());
    if (index < 0) {
      index = 0;
    }
    defaultValue.value = [index];
  },
);

onLoad(() => {
  getYears();
});
</script>

<style scoped lang="scss">
.payslip-list {
  padding: px2rpx(12) px2rpx(16);
  .total-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    height: px2rpx(106);
    padding-left: px2rpx(24);
    background: linear-gradient(180deg, #ffe58f 0%, #fff 100%);
    border-radius: px2rpx(8);

    .total-bg {
      position: absolute;
      right: 0;
      bottom: 0;
      height: px2rpx(90);
      width: px2rpx(90);
    }
    .total-year {
      @include title-3-medium;
      color: #874d00;
    }
    .total-sum {
      margin-top: px2rpx(12);
      @include subheadline-regular;
      color: rgba($color-text-base, 0.65);
    }
  }
  .salary-wrap {
    margin-bottom: px2rpx(24);
    .salary-block {
      .title {
        margin: px2rpx(18) 0 px2rpx(8);
      }
      .salary-card {
        & + .salary-card {
          margin-top: px2rpx(12);
        }
        padding: px2rpx(12) px2rpx(16);
        background-color: #fff;
        border-radius: px2rpx(8);
        .date {
          @include footnote-regular;
          color: rgba($color-text-base, 0.45);
          margin-bottom: px2rpx(8);
        }
        .name {
          @include body-medium;
          color: rgba($color-text-base, 0.88);
        }
        .sum {
          @include body-regular;
          font-size: px2rpx(14);
          color: rgba($color-text-base, 0.65);
        }
      }
      .empty-card1 {
        height: px2rpx(88rpx);
        background-color: #fff;
        border-radius: px2rpx(8);
        @include subheadline-regular;
        color: rgba($color-text-base, 0.45);
      }
    }
  }
}
</style>
