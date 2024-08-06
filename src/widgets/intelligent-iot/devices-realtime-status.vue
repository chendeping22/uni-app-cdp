<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
  >
    <view class="flex mt-b">
      <view class="col-12">
        <view class="color-secondary">接入设备</view>
        <view class="font-xxt bold">{{ info.total ?? '/' }}</view>
      </view>
      <view class="col-12">
        <view class="color-secondary">故障设备</view>
        <view class="font-xxt bold">{{ info.fault ?? '/' }}</view>
      </view>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import { getDeviceSituation } from '@/services/widgets';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import widgetCard from '@/widgets/components/widget-card.vue';
import { onMounted, ref } from 'vue';

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
  return (await getDeviceSituation()) || defaultData;
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
