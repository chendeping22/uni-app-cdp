<template>
  <c-card>
    <view class="box">
      <view class="title">
        <view class="title-size">{{ title }}</view>
      </view>
      <view class="mt-b">
        <c-empty v-if="!props?.data?.length" content="暂无数据" top="0" />
        <view v-else class="bar-container">
          <view class="list-wrapper">
            <view
              v-for="(item, idx) in props?.data"
              :key="idx"
              class="item-wrapper"
              @click="handleShowDetail(item)"
            >
              <view class="rank-value">
                <view class="flex-grow">{{ item?.label }}</view>
                <view>
                  <text class="value-strong">{{ item.value }}</text>
                </view>
              </view>
              <view :key="item.value + idx" class="rank-bar">
                <view
                  class="value-bar not-processed"
                  :style="{
                    width: `${((item.value || 0) * 100) / denominator}%`,
                  }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </c-card>
</template>

<script lang="ts" setup>
type IStatisticItem = {
  label: string;
  value: number;
  code?: string;
  key?: number[];
};

import { PropType } from 'vue';

const props = defineProps({
  data: {
    type: Array as PropType<Array<IStatisticItem>>,
    default() {
      return [];
    },
  },
  denominator: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '告警区域排行',
  },
  alarmType: {
    type: String,
    default: 'area',
  },
  activeTab: {
    type: Number,
    default: 0,
  },
  clickTimer: {
    type: Function,
    default: () => {},
  },
});

const handleShowDetail = (item: IStatisticItem) => {
  if (props.alarmType === 'area') {
    return;
  }
  if (!item.value) {
    return;
  }
  props?.clickTimer && props.clickTimer(item);
};
</script>

<style lang="scss" scoped>
.box {
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #1d2129;
    .title-size {
      font-size: 34rpx;
      font-weight: 600;
    }
    .sub-title-size {
      font-size: 30rpx;
    }
  }
}
.bar-container {
  .legend-container {
    font-size: $ui-font-size-secondary;
    color: $ui-color-placeholder;
    display: flex;
    margin-bottom: $ui-gap-default;

    .legend-item {
      display: flex;
      align-items: center;
      margin-right: $ui-gap-large;
    }
    .icon {
      width: $ui-gap-small;
      height: $ui-gap-small;
      border-radius: 50%;
      margin-right: $ui-gap-small;
    }

    .processed {
      background: $ui-color-blue-light-1;
    }

    .not-processed {
      background: #f96e11;
    }
  }

  .list-wrapper {
    .item-wrapper {
      .rank-value {
        box-sizing: border-box;
        display: flex;
        align-items: center;

        .flex-grow {
          flex-grow: 1;

          font-size: $ui-font-size-secondary;
          color: $ui-color-placeholder;
        }
        .value-strong {
          font-family: PingFangSC-Semibold;
          // font-size: $ui-font-size-title;
          font-weight: $ui-font-weight-bold;
          font-size: $ui-font-size-secondary;
          color: $ui-color-base;
        }
      }
      .rank-bar {
        margin-top: $ui-gap-xxs;
        margin-bottom: $ui-gap-default;
        width: 100%;
        background: #f2f3f4;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 8rpx;
        .value-bar {
          height: 16rpx;
        }
        .processed {
          background-image: linear-gradient(269deg, #a4c3ff 0%, #4080fb 100%);
        }
        .not-processed {
          background-image: linear-gradient(270deg, #ffbb8b 0%, #f96e11 100%);
        }
      }
    }
  }
}
</style>
