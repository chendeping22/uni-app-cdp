<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
  >
    <u-empty-custom v-if="info.voList?.length === 0" card text="暂无数据" :icon-size="120" />
    <view v-else class="flex mt-b pb-b">
      <view class="flex-grow mr-xl col-1">
        <view v-for="(item, inx) in info.voList" :key="item.deviceTypeId">
          <view :class="['flex', inx > 0 ? 'mt-s' : '']">
            <c-icon
              icon-prefix="device-icon2"
              :name="DeviceIconMap(item.type)"
              size="40"
              color-type="primary"
            />
            <view class="flex-grow text-ellipse">
              <text class="color-secondary ml-s text-ellipse">{{ item.name }}</text>
            </view>
            <view class="bold">
              <text v-if="item.open === -1">/</text>
              <text v-else> {{ item.open }}/{{ item.online }} </text>
            </view>
          </view>
        </view>
      </view>
      <view class="no-shrink icon-200">
        <c-circle-progress
          border-width="20"
          :width="200"
          :height="200"
          :percent="info.totalOpenRate ? info.totalOpenRate * 100 : 0"
        >
          <view class="flex-column">
            <view v-if="info.totalOpenRate || info.totalOpenRate === 0">
              <text class="font-xxt bold">{{ (info.totalOpenRate * 100).toFixed(0) }}</text>
              <text class="color-secondary font-secondary">%</text>
            </view>
            <view v-else>
              <text class="font-xxt bold">/</text>
            </view>
            <view class="color-secondary font-secondary">总开启率</view>
          </view>
        </c-circle-progress>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getDeviceStatistic } from '@/services/widgets';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';
import { DeviceIconMap } from './tools';

interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

interface IGetDeviceStatisticRtn {
  fault: number;
  offline: number;
  online: number;
  total: number;
  totalOpenRate: number;
  voList: {
    deviceTypeId: string;
    name: string;
    online: number;
    open: number;
    type: string;
  }[];
}

const defaultData = {
  fault: 0,
  offline: 0,
  online: 0,
  total: 0,
  totalOpenRate: 0,
  voList: [],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(true);
const info = ref<Partial<IGetDeviceStatisticRtn>>(defaultData);

const fetchData = async () => {
  return (await getDeviceStatistic()) || defaultData;
};

const getData = async () => {
  info.value = await fetchData();
};

const handleClickNavigator = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    'campus/iot-campus/iot-campus',
    EApplicationType.Old,
  );
};

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.data-box {
  height: 100%;
  width: 100%;
}
</style>
