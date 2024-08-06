<template>
  <view class="detail">
    <view class="detail-header" :style="{ height: 352 + statusBarHeight * 2 + 'rpx' }">
      <view :style="{ height: statusBarHeight * 2 + 'rpx' }"></view>
      <view class="detail-header-nav">
        <u-image
          @click="goBack"
          :src="arrowLeft"
          width="48rpx"
          height="48rpx"
          :show-loading="false"
          :fade="false"
        ></u-image>
        <view class="detail-header-title">{{ store.clazzInfo.clazzName || '' }}统计详情</view>
      </view>
      <view class="detail-header-content">
        <view class="header-left">
          <view class="header-left-name">{{ store.clazzInfo?.clazzName || '/' }}</view>
          <view class="header-left-person">
            <view class="header-left-teacher">
              <view class="header-left-type">班主任</view>
              <view class="header-left-txt">{{ store.clazzInfo?.clazzTeacherName || '/' }}</view>
            </view>
            <view>
              <view class="header-left-type">学生</view>
              <view class="header-left-txt">{{ store.clazzInfo?.studentNum ?? 0 }}人</view>
            </view>
          </view>
        </view>
        <view class="header-right">
          <view class="header-right-img">
            <u-image
              v-if="rank <= 3 && rank > 0"
              width="96rpx"
              height="96rpx"
              :src="rankingTypeMap[rank]"
            ></u-image>
            <view v-else-if="rank >= 0" class="ranking-normal">{{ rank }}</view>
          </view>
          <view class="header-right-name">年级排名</view>
        </view>
      </view>
    </view>
    <view
      class="detail-header-placeholder"
      :style="{
        paddingTop: 356 + statusBarHeight * 2 + 'rpx',
      }"
    ></view>
    <view class="detail-list">
      <view v-for="item in listData" class="detail-list-item" v-if="listData?.length">
        <view class="detail-list-left">
          <view class="detail-list-left-week" v-if="item?.data > 0">第{{ item?.data }}周</view>
          <view class="detail-list-left-time">{{ formatTime(item) }}</view>
        </view>
        <view class="detail-list-right">
          <u-image
            width="96rpx"
            height="96rpx"
            :src="item?.iconFileInfo?.url"
            v-if="item?.iconFileInfo?.url"
          ></u-image>
          <view class="detail-list-right-name">{{ item?.honoraryTitle }}</view>
        </view>
      </view>
      <view class="class-list-empty" v-else>
        <u-empty-custom text="暂无数据" mode="data"></u-empty-custom>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getClassStatisticsDetail } from '@/app-class-evaluation/services/statistics';
import arrowLeft from '@/app-class-evaluation/static/arrow_left.svg';
import ranking1 from '@/app-class-evaluation/static/ranking1.png';
import ranking2 from '@/app-class-evaluation/static/ranking2.png';
import ranking3 from '@/app-class-evaluation/static/ranking3.png';

import { useStatisticsClazzStore } from '@/app-class-evaluation/store/use-statistics-clazz-store';
import { getPageParams, log, showInfo } from '@/utils/tools';

import { computed, onMounted, ref } from 'vue';

const store = useStatisticsClazzStore();

// insert statusbar
const statusBarHeight = ref();
onMounted(() => {
  //获取手机系统信息
  const info = uni.getSystemInfoSync();
  log('systemInfo : ', info);
  // #ifdef APP-PLUS
  const agentInfo = plus.navigator.getUserAgent();
  log('agentInfo : ', agentInfo);
  // #endif
  //设置状态栏高度
  statusBarHeight.value = info.statusBarHeight;
});

const listData = ref<Record<string, any>[]>([]);

const rank = computed(() => store.clazzInfo?.rank ?? 0);

const rankingTypeMap = {
  1: ranking1,
  2: ranking2,
  3: ranking3,
};

const goBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};

const formatTime = (val: Record<string, any>) => {
  const startMap = val?.startDate ? val?.startDate?.split('-') : [];
  const endMap = val?.endDate ? val?.endDate?.split('-') : [];
  const start = startMap.join('.');
  const end = endMap?.[0] === startMap?.[0] ? endMap?.slice(1, 3)?.join('.') : endMap.join('.');
  return `${start}-${end}`;
};

const fetchStatisticsDetail = async params => {
  try {
    uni.showLoading();
    const res: any = await getClassStatisticsDetail(params);
    console.log('🚀 ~ fetchStatisticsDetail ~ res:', res);
    listData.value = res;
    uni.hideLoading();
  } catch (e: any) {
    uni.hideLoading();
    showInfo(`${e?.desc || '获取数据失败'}`);
  }
};

onMounted(() => {
  const pageParams = getPageParams();
  fetchStatisticsDetail({ clazzId: pageParams?.clazzId, evaluationSchemeId: pageParams?.schemeId });
});
</script>

<style lang="scss" scoped>
.detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  padding: 48rpx;
  color: $color-text-inverse;
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('@/app-class-evaluation/static/bg_Invitation.svg');
  position: fixed;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  &-placeholder {
    padding-top: 344rpx;
  }
  &-nav {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    margin-left: -12rpx;
  }
  &-title {
    flex: 1;
    text-align: center;
    margin-left: -48rpx;
    width: calc(100% - 80rpx);
    @include ellipsis();
    padding-left: 54rpx;
    padding-right: 16rpx;
  }
  &-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.header-left {
  margin-right: 32rpx;
  flex: 1;
  &-name {
    font-size: 44rpx;
    margin-bottom: 32rpx;
    font-weight: 500;
  }
  &-person {
    display: flex;
  }
  &-teacher {
    margin-right: 64rpx;
  }
  &-type {
    font-size: 26rpx;
    opacity: 0.8;
    margin-bottom: 8rpx;
  }
  &-txt {
    font-weight: 500;
  }
}
.header-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &-name {
    margin-top: 8rpx;
    font-size: 26rpx;
    font-weight: 500;
  }
  &-img {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.ranking-normal {
  width: 72rpx;
  height: 84rpx;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('@/app-class-evaluation/static/otherRanking.svg');
  color: $color-text-description;
  font-size: 48rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-list {
  flex: 1;
  padding: 24rpx 32rpx;
  &-item {
    background: $color-background-base;
    box-shadow: 0 1px 2px 0 $control-item-bg-hover;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    padding: 36rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-text-description;
  }
  &-left {
    margin-right: 64rpx;
    &-week {
      color: $color-text;
      margin-bottom: 8rpx;
      font-size: 32rpx;
    }
    &-time {
      font-size: 26rpx;
    }
  }
  &-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    &-name {
      font-size: 22rpx;
      word-break: break-all;
      max-width: 176rpx;
      text-align: right;
    }
  }
}
.class-list-empty {
  flex: 1;
  padding-top: 80rpx;
}
</style>
