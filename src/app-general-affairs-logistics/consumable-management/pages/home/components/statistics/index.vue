<script setup lang="ts">
import down from '@/app-general-affairs-logistics/static/assets-manage/down.svg';
import up from '@/app-general-affairs-logistics/static/assets-manage/up.svg';
import { ref } from 'vue';
import { colorList } from '../../constants';
const props = defineProps({
  sourceData: {
    /** 卡片数据 */
    type: Object,
    default: () => {},
  },
});
const showAll = ref<boolean>(false);
const list = [
  {
    name: '按分类',
  },
  {
    name: '按仓库',
  },
];
const current = ref<number>(1);
</script>
<template>
  <view class="list-wrap">
    <view class="list-head">
      <view class="list-title">耗材统计</view>
      <view style="width: 260rpx">
        <u-subsection font-size="26" v-model="current" :list="list" mode="button"></u-subsection
      ></view>
    </view>
    <view class="list-top">
      <view v-if="sourceData?.count" class="list-top-wrap">
        <view class="list-top-head">
          <view class="list-top-title">耗材总数</view>
          <view class="list-top-con">{{ current ? sourceData?.count : sourceData?.count }}</view>
        </view>
        <view class="list-chart-wrap">
          <template v-if="current ? sourceData?.pieItems?.length : sourceData?.lineItems?.length">
            <view
              v-for="(item, index) in current ? sourceData?.lineItems : sourceData?.pieItems"
              :key="item.name"
              class="chart-item"
              :style="{
                width: `${item.percent}`,
                background: colorList[index % 8],
              }"
            ></view>
          </template>
        </view>

        <view class="list-main">
          <template v-if="current ? sourceData?.pieItems?.length : sourceData?.lineItems?.length">
            <view
              v-for="(item, index) in current
                ? showAll
                  ? sourceData?.lineItems
                  : sourceData?.lineItems.slice(0, 3)
                : showAll
                ? sourceData?.pieItems
                : sourceData?.pieItems.slice(0, 3)"
              :key="item.name"
              class="list-item"
            >
              <view class="item-con">
                <view class="item-con-left">
                  <view
                    class="item-icon"
                    :style="{
                      borderColor: colorList[index % 8],
                      background: `${colorList[index % 8]}1A`,
                    }"
                  ></view>
                  <view class="item-title">{{ item.name }}</view>
                  <view class="item-percent">({{ item.percent }})</view>
                </view>
                <view class="item-con-right">{{ item.value }}</view>
              </view>
            </view>
          </template>
          <view
            v-if="current ? sourceData?.pieItems?.length > 3 : sourceData?.lineItems?.length > 3"
            class="up-down"
            @click="showAll = !showAll"
          >
            <u-image
              v-if="showAll"
              :src="up"
              width="40"
              height="40"
              :show-loading="false"
              :fade="false"
            ></u-image>
            <u-image
              v-else
              :src="down"
              width="40"
              height="40"
              :show-loading="false"
              :fade="false"
            ></u-image>
          </view>
        </view>
      </view>
      <u-empty-custom v-else mode="data" style="padding-bottom: 24rpx"></u-empty-custom>
    </view>
  </view>
</template>
<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.list-wrap {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.04);
}
.list-head {
  padding: 0 32rpx;
  height: 96rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  font-family: 'PingFang SC';
  .list-title {
    color: #000000;
    font-size: 32rpx;
  }
  .list-type {
    color: #1677ff;
    font-size: 30rpx;
  }
}

.list-top {
  padding: 0 24rpx;
  .list-top-wrap {
    display: flex;
    padding-top: 24rpx;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24rpx;
    align-self: stretch;
    border-radius: 16rpx;
    .list-top-head {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      line-height: 20px;
    }
    .list-chart-wrap {
      width: 100%;
      background: #fff;
      height: 32rpx;
      display: flex;
      gap: 2rpx;
      border-radius: 10rpx;
      overflow: hidden;
    }
  }
}
.list-main {
  width: 100%;
  padding: 0;
}
.up-down {
  width: 100%;
  height: 56rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.list-item {
  position: relative;
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  .item-con {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    .item-con-left {
      display: flex;
      align-items: center;
      margin-right: 16rpx;
      overflow: hidden;
      .item-icon {
        flex-shrink: 0;
        margin-right: 16rpx;
        width: 16rpx;
        height: 40rpx;
        border-radius: 8rpx;
        border: 1px solid #faad14;
        background: rgba(250, 219, 20, 0.1);
      }
      .item-title {
        color: rgba(0, 0, 0, 0.88);
        font-family: 'PingFang SC';
        font-size: 30rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 20px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-percent {
        color: rgba(0, 0, 0, 0.45);
        font-size: 24rpx;
      }
    }
    .item-con-right {
      color: rgba(0, 0, 0, 0.45);
      text-align: right;
      font-family: 'PingFang SC';
      font-size: 26rpx;
      font-style: normal;
      font-weight: 400;
      line-height: 36rpx;
    }
  }
  &::after {
    position: absolute;
    content: '';
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1rpx;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.06);
  }
}
</style>
