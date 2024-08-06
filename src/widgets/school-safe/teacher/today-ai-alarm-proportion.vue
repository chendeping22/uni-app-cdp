<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pull-down-refresh="fetchData"
    @show="fetchData"
  >
    <u-empty-custom v-if="listData.data?.length === 0" card text="暂无数据" />
    <template v-else>
      <view class="data-box">
        <chart-circle :width="110" :height="110" :data="listData.data"> </chart-circle>
        <view class="item-box">
          <view v-for="t in listData.data" :key="t.label" class="item">
            <view class="item-label">
              <view class="badge" :style="{ backgroundColor: t.color }" />
              <view>{{ t?.label }}</view>
            </view>
            <view class="item-num">{{ `${parseInt((t?.total / denominator) * 100)}%` }}</view>
          </view>
        </view>
      </view>
    </template>
  </widget-card>
</template>
<script lang="ts" setup>
import ChartCircle from '@/components/chart/circle.vue';
import { getAiAlarmProportionApi } from '@/services/widgets';
import type { IWidget } from '@/store/modules/workbench';
import { formatDate } from '@/utils/tools';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, reactive, ref } from 'vue';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

type IDataItem = {
  label: string;
  total: number;
  value: number;
  color: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});
const colorList = ['#176BFB', '#FE7C00', '#F53F3F', '#F7BA1E', '#00B42A'];
const denominator = ref<number>(0);
const listData = reactive<{ data: IDataItem[] }>({ data: [] });

const isLoad = ref(false);

const handleClickNavigator = () => {
  uni.navigateTo({
    url: `/app-school-safe/ai-control/statistics`,
  });
};

const fetchData = async () => {
  const reqData = {
    date: formatDate(new Date(), 'YYYY-MM-DD'),
    size: 5,
    timeScope: 'day',
  };
  const res = await getAiAlarmProportionApi(reqData);
  isLoad.value = true;
  const newData: IDataItem[] = [];
  let count = 0;
  (res || []).forEach((item, index) => {
    newData.push({ ...item, color: colorList[index], value: item?.total });
    count += item?.total;
  });
  denominator.value = count;
  listData.data = newData;
};

onMounted(() => {
  fetchData();
});
</script>
<style lang="scss" scoped>
.data-box {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 24rpx;
  .chart-num {
    font-size: 32rpx;
    color: #1d2129;
    font-weight: 600;
    text-align: center;
  }
  .chart-subTitle {
    font-size: 24rpx;
    text-align: center;
    color: #4e5969;
  }
  .item-box {
    .item {
      color: #4e5969;
      font-size: 28rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .item-label {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .badge {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }
      }

      .item-num {
        font-size: 28rpx;
        color: #1d2129;
        font-weight: 600;
        margin-left: 32rpx;
      }
    }
  }
}
</style>
