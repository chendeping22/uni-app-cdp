<script lang="ts" setup>
import { controlDevice, loadDeviceProps } from '@/app-intelligent-iot/services/air-condition';
import IconArrow from '@/app-intelligent-iot/static/air-condition/arrow_right.svg';
import MQTT_TOPICS from '@/utils/mqtt/mqtt.topics';
import { clientId_key } from '@/utils/storage-keys';
import { hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { isEmpty } from 'lodash-es';
import { computed, ref } from 'vue';
import TitleView from '../../components/common-title.vue';
import {
  ILabelValue,
  IPickerState,
  IPropSelect,
  IPropSwitch,
  IPropTemperature,
} from '../../utils/AirConditionType';
import {
  parseDisplayProp,
  parseSelectProp,
  parseSwitchProp,
  parseTemperatureProp,
} from '../../utils/Utils';

let deviceId = '';
let deviceName = '';
let hasModify = false;

const pickerState = ref<IPickerState>();

const powerSwitch = ref<IPropSwitch>(); // 开关
const mode = ref<IPropSelect>(); // 模式
const temperature = ref<IPropTemperature>(); // 温度
const windSpeed = ref<IPropSelect>(); // 风速
const windSweep = ref<IPropSelect>(); // 扫风
const otherProps = ref<ILabelValue[]>([]); // 其他属性

/**
 * 开关是否打开
 */
const isPowerOn = computed(() => powerSwitch.value?.onOff || false);
let alreadyClickTemperature = false;

const loadProps = async () => {
  try {
    const res: any = await loadDeviceProps(deviceId);
    // console.log('loadProps res', res);
    const list = [] as ILabelValue[];
    res.properties.forEach(prop => {
      try {
        const code = prop.code as string;
        switch (code) {
          case 'OnOff':
            powerSwitch.value = parseSwitchProp(prop, '开关');
            break;
          case 'AirConditionMode':
            mode.value = parseSelectProp(prop, '模式');
            break;
          case 'sweptWind':
            windSweep.value = parseSelectProp(prop, '扫风');
            break;
          case 'windSpeedMode':
            windSpeed.value = parseSelectProp(prop, '风速');
            break;
          case 'Temp':
            temperature.value = parseTemperatureProp(prop);
            break;
          default:
            if (code.startsWith('locked')) return;
            if (prop.rwStatus == 1) return;

            const label = prop.name;
            const value = parseDisplayProp(prop);
            list.push({ label, value });
        }
      } catch (error) {}
    });
    otherProps.value = list;
  } catch (error) {}
};

const requestControl = async (key: string, value: number) => {
  try {
    showLoading();
    const params = {};
    params[key] = value;
    hasModify = true;
    curSeq = '';
    const res: any = await controlDevice(deviceId, params);
    const seq = res?.resp?.seq;
    if (seq) {
      curSeq = seq;
    } else {
      hideLoading();
      showInfo('参数异常');
    }
  } catch (error: any) {
    hideLoading();
    if (error && error.code == 1002) {
      showInfo('控制成功');
    } else {
      showInfo(error?.desc || '控制失败');
    }
  }
};

const onChangePower = e => {
  const current = powerSwitch.value;
  if (!current) return;

  requestControl(current.code, current.onOff ? 1 : 0);
};

const onChangeTemperature = () => {
  if (!alreadyClickTemperature) return;

  const current = temperature.value;
  if (!current) return;

  requestControl(current.code, current.current);
};

const onSelectPicker = e => {
  const state = pickerState.value;
  if (!state) return;

  if (state.flag == 1) {
    if (mode.value) {
      mode.value.current = e[0];
      if (mode.value.current) {
        requestControl(mode.value.code, mode.value.current.value);
      }
    }
  } else if (state.flag == 2) {
    if (windSpeed.value) {
      windSpeed.value.current = e[0];

      if (windSpeed.value.current) {
        requestControl(windSpeed.value.code, windSpeed.value.current.value);
      }
    }
  } else if (state.flag == 3) {
    if (windSweep.value) {
      windSweep.value.current = e[0];

      if (windSweep.value.current) {
        requestControl(windSweep.value.code, windSweep.value.current.value);
      }
    }
  }
};

const onClickMode = () => {
  const curMode = mode.value;
  if (!curMode) return;

  pickerState.value = {
    flag: 1,
    show: true,
    title: curMode.name,
    options: curMode.options,
  };
};

const onClickWindSpeed = () => {
  const curMode = windSpeed.value;
  if (!curMode) return;

  pickerState.value = {
    flag: 2,
    show: true,
    title: curMode.name,
    options: curMode.options,
  };
};

const onClickWindSweep = () => {
  const curMode = windSweep.value;
  if (!curMode) return;

  pickerState.value = {
    flag: 3,
    show: true,
    title: curMode.name,
    options: curMode.options,
  };
};

//#region MQTT

// mqtt主题
const TOPICS = [MQTT_TOPICS.LOG_DETAIL];
let curSeq = '';

// init 事件接收参数包含这四个方法，与 react 中注入的同名方法使用一致
const mqttInit = (item: { notifySubOrUnSubToEndApi: any; manualSubOrUnsub: any }) => {
  const { notifySubOrUnSubToEndApi } = item;
  const clientId = uni.getStorageSync(clientId_key);
  notifySubOrUnSubToEndApi(true, {
    topic: MQTT_TOPICS.LOG_DETAIL,
    bid: clientId,
  });
};

// message 事件接收推送消息, 返回格式为 { message: any, topic: string };
const onMessage = (receiveMsg: any) => {
  try {
    const { message } = receiveMsg;
    log('onMessage', message);
    const seq = message?.data?.seq;
    if (curSeq && curSeq == seq) {
      hideLoading();
      const success = message?.data?.result == 1;
      if (success) {
        showInfo('控制成功');
      } else {
        showInfo(message?.data?.failCode || '控制失败');
      }
    }
  } catch (error) {}
};
//#endregion

onLoad((option: any) => {
  deviceId = option.id;
  deviceName = option.name;
  log(`设备控制页 name:${deviceName} id:${deviceId}`);
  loadProps();
});

onUnload(() => {
  if (hasModify) {
    uni.$emit('airConditionModifyFlag');
  }
});
</script>

<template>
  <page custom-overflow="scroll">
    <view class="pageMargin">
      <TitleView :title="deviceName" :device-or-group="true" />
      <!-- 开关 -->
      <view v-if="powerSwitch" class="cardRound k-p-26 k-f-center u-row-between k-m-t-24">
        <view class="label">{{ powerSwitch.name }}</view>
        <u-switch v-model="powerSwitch.onOff" @change="onChangePower"></u-switch>
      </view>
      <!-- 模式 温度 -->
      <view v-if="isPowerOn && (mode || temperature)" class="cardRound k-p-26 k-f-c k-m-t-24">
        <view v-if="mode" class="k-f u-row-between" @click="onClickMode">
          <view class="label">{{ mode.name }}</view>
          <view class="k-f-1 value">{{ mode.current?.label || '' }}</view>
          <u-image :src="IconArrow" :width="40" :height="40"></u-image>
        </view>
        <view v-if="temperature">
          <view v-if="mode" class="divider"></view>
          <u-number-box
            v-model="temperature.current"
            :min="temperature.min"
            :max="temperature.max"
            :input-width="500"
            :input-height="64"
            :size="32"
            :disabled-input="true"
            @plus="alreadyClickTemperature = true"
            @minus="alreadyClickTemperature = true"
            @change="onChangeTemperature"
          ></u-number-box>
        </view>
      </view>
      <!-- 风速 -->
      <view
        v-if="isPowerOn && windSpeed"
        class="cardRound k-p-26 k-f-center k-m-t-24"
        @click="onClickWindSpeed"
      >
        <view class="label">{{ windSpeed.name }}</view>
        <view class="k-f-1 value">{{ windSpeed.current?.label || '' }}</view>
        <u-image :src="IconArrow" :width="40" :height="40"></u-image>
      </view>
      <!-- 扫风 -->
      <view
        v-if="isPowerOn && windSweep"
        class="cardRound k-p-26 k-f-center u-row-between k-m-t-24"
        @click="onClickWindSweep"
      >
        <view class="label">{{ windSweep.name }}</view>
        <view class="k-f-1 value">{{ windSweep.current?.label || '' }}</view>
        <u-image :src="IconArrow" :width="40" :height="40"></u-image>
      </view>
      <!-- 其他属性 -->
      <view v-if="!isEmpty(otherProps)" class="cardRound k-p-26 k-f-c k-m-t-24">
        <view v-for="(item, index) in otherProps" :key="index">
          <view v-if="index != 0" class="divider"></view>
          <view class="k-f u-row-between">
            <view class="label">{{ item.label }}</view>
            <view class="value valueHintColor">{{ item.value }}</view>
          </view>
        </view>
      </view>
    </view>
    <u-select
      v-if="pickerState"
      v-model="pickerState.show"
      :list="pickerState.options"
      :title="pickerState.title"
      @confirm="onSelectPicker"
    ></u-select>
    <imp-mqtt-subscriber :topics="TOPICS" @init="mqttInit" @message="onMessage" />
  </page>
</template>

<style lang="scss" scoped>
@import '@/app-intelligent-iot/air-condition-manager/style/KStyle.scss';
@import '@/app-intelligent-iot/air-condition-manager/style/AirConditionStyle.scss';

.label {
  color: #000000e0;
  font-size: 32rpx;
}

.value {
  color: #000000e0;
  font-size: 32rpx;
  text-align: right;
}

.valueHintColor {
  color: #000000a6;
}

.divider {
  margin: 26rpx 0 32rpx;
  height: 1rpx;
  background: #0000000f;
}
</style>
