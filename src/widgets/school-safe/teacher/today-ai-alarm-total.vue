<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="getData"
    @show="getData"
  >
    <view class="bar-container mt-b">
      <view v-if="list.length === 0">
        <u-empty-custom card text="暂无数据" />
      </view>
      <view v-else class="list-wrapper">
        <view
          v-for="(item, idx) in list"
          :key="idx"
          class="item-wrapper"
          @click="handleDetail(item)"
        >
          <view class="rank-value">
            <view class="flex-grow">{{ item?.label }}</view>
            <view>
              <text class="value-strong">{{ item.total }}</text>
            </view>
          </view>
          <view class="rank-bar">
            <view
              class="value-bar not-processed"
              :style="{
                width: `${((item.total || 0) * 100) / denominator}%`,
              }"
            ></view>
          </view>
        </view>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getAiAlarmProportionApi, type AlarmDataItem } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { formatDate } from '@/utils/tools';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);
const list = ref<AlarmDataItem[]>([]);
const denominator = ref(0);

/** 调用API，获取真实数据 */
const fetchData = async () => {
  const reqData = {
    date: formatDate(new Date(), 'YYYY-MM-DD'),
    size: 5,
    timeScope: 'day',
  };
  const res = await getAiAlarmProportionApi(reqData);
  return res || [];
};

const handleClickNavigator = () => {
  uni.navigateTo({
    url: `/app-school-safe/ai-control/index?viewType=all`,
  });
};

const getData = async () => {
  list.value = await fetchData();
  let count = 0;
  if (list.value?.length) {
    list.value.forEach(({ total }) => {
      count += total;
    });
  }
  denominator.value = count;
  isLoad.value = true;
};

const handleDetail = (item: AlarmDataItem) => {
  uni.navigateTo({
    url: `/app-school-safe/ai-control/index?alarmType=${item?.alarmType}&typeCode=${item?.typeCode}&timeScope=today&viewType=item`,
  });
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.bar-container {
  padding-bottom: 24rpx;
  min-height: 260rpx;
  .legend-container {
    font-size: 24rpx;
    color: #86909c;
    display: flex;
    margin-bottom: 24rpx;

    .legend-item {
      display: flex;
      align-items: center;
      margin-right: 32rpx;
    }
    .icon {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      margin-right: 16rpx;
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
          font-size: 24rpx;
          color: #86909c;
        }
        .value-strong {
          font-family: PingFangSC-Semibold;
          font-weight: 600;
          font-size: 24rpx;
          color: #1d2129;
        }
      }
      .rank-bar {
        margin-top: 8rpx;
        margin-bottom: 24rpx;
        width: 100%;
        background: #f2f3f4;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        padding: 8rpx;
        .value-bar {
          height: 16rpx;
        }
        .not-processed {
          background-image: linear-gradient(270deg, #ffbb8b 0%, #f96e11 100%);
        }
      }
    }
  }
}
</style>
