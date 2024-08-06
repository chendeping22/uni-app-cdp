<script lang="ts" setup>
import {
  controlDeviceMultiple,
  loadDeviceProps,
} from '@/app-intelligent-iot/services/air-condition';
import IconArrow from '@/app-intelligent-iot/static/air-condition/arrow_right.svg';
import IconLockRecord from '@/app-intelligent-iot/static/air-condition/group_lock_record.svg';
import MQTT_TOPICS from '@/utils/mqtt/mqtt.topics';
import { clientId_key } from '@/utils/storage-keys';
import { hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { isEmpty } from 'lodash-es';
import { computed, ref } from 'vue';
import TitleView from '../../components/common-title.vue';
import RangeSlider from '../../components/range-slider/range-slider.vue';
import { ILockSelect, ILockTemperature, IPickerState } from '../../utils/AirConditionType';
import { parseRangeByStr, parseSelectLock, parseTemperatureLock } from '../../utils/Utils';

let deviceId = '';
let deviceName = '';
let hasModify = false;

const pickerState = ref<IPickerState>();

const powerSwitch = ref<ILockSelect>(); // 开关
const mode = ref<ILockSelect>(); // 模式
const temperature = ref<ILockTemperature>(); // 温度
const isLockPowerOff = computed(() => {
  return powerSwitch.value?.current?.value == 0;
});

const hasSelectedPowerLock = computed(() => {
  return powerSwitch.value && powerSwitch.value.current != null;
});
const hasSelectedModeLock = computed(() => {
  return mode.value && mode.value.current != null;
});
const openTemperatureLock = computed(() => {
  return temperature.value && temperature.value.switch;
});

const disableUnlock = computed(() => {
  if (powerSwitch.value) {
    if (powerSwitch.value.originalValue != null && powerSwitch.value.originalValue != -1) {
      return false;
    }
  }
  if (isLockPowerOff.value) {
    return true;
  }
  if (powerSwitch.value && mode.value && temperature.value) {
    if (mode.value.originalValue != null && mode.value.originalValue != -1) {
      return false;
    }
    if (temperature.value.originalValue != null && temperature.value.originalValue != '-1') {
      return false;
    }
  }
  return true;
});

const disableSave = computed(() => {
  if (powerSwitch.value) {
    if (powerSwitch.value.originalValue != powerSwitch.value.current?.value) {
      return false;
    }
  }
  if (isLockPowerOff.value) {
    return true;
  }
  if (mode.value && temperature.value) {
    if (mode.value.originalValue != mode.value.current?.value) {
      return false;
    }
    if (temperature.value.originalValue != temperature.value.current) {
      return false;
    }
    if (
      temperature.value.switch &&
      (temperature.value.originalValue == null || temperature.value.originalValue == '-1')
    ) {
      return false;
    }
    if (
      !temperature.value.switch &&
      temperature.value.originalValue != null &&
      temperature.value.originalValue != '-1'
    ) {
      return false;
    }
  }
  return true;
});

const temperatureValues = computed((): number[] => {
  try {
    const strRange = temperature.value?.current || '';
    const res = parseRangeByStr(strRange);
    if (res) return res;
  } catch (error) {}
  try {
    const min = temperature.value?.min || 16;
    const max = temperature.value?.max || 30;
    return [min, max];
  } catch (error) {}
  return [16, 30];
});

const temperatureRangeShow = computed(() => {
  try {
    const values = temperatureValues.value;
    return `${values[0]}°C-${values[1]}°C`;
  } catch (error) {}
  return '';
});

const onRangeChange = e => {
  console.log('onRangeChange', e);
  if (temperature.value) {
    temperature.value.current = `${e.minValue}-${e.maxValue}`;
  }
};

const control = async (modifyProps: any[]) => {
  try {
    showLoading();
    hasModify = true;
    curSeq = '';
    const res: any = await controlDeviceMultiple(deviceId, modifyProps);
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
      showInfo('操作成功');
      uni.navigateBack();
    } else {
      showInfo(error?.desc || '设置失败');
    }
  }
};

const onClickLockRecord = () => {
  uni.navigateTo({
    url: `/app-intelligent-iot/air-condition-manager/record/lock?id=${deviceId}`,
  });
};

const onClickUnlock = async () => {
  if (disableUnlock.value) return;

  uni.showModal({
    title: '',
    content: `确定解锁设备${deviceName}的锁定操作？`,
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    success: res => {
      if (res?.confirm) {
        const modifyProps = [] as any[];
        let current = powerSwitch.value;
        if (current) {
          current.current = current.options.find(item => item.value == -1) || null;
          const params = {};
          params[current.code] = current.current?.value || -1;
          modifyProps.push(params);
        }
        current = mode.value;
        if (current) {
          current.current = current.options.find(item => item.value == -1) || null;
          const params = {};
          params[current.code] = current.current?.value || -1;
          modifyProps.push(params);
        }
        const curProp = temperature.value;
        if (curProp) {
          curProp.current = null;
          curProp.switch = false;
          const params = {};
          params[curProp.code] = '-1';
          modifyProps.push(params);
        }
        if (isEmpty(modifyProps)) return;

        control(modifyProps);
      }
    },
  });
};

const onClickSave = async () => {
  if (disableSave.value) return;

  const modifyProps = [] as any[];
  let current = powerSwitch.value;
  if (current && current.current) {
    const params = {};
    params[current.code] = current.current?.value;
    modifyProps.push(params);
  }
  if (!isLockPowerOff.value) {
    current = mode.value;
    if (current && current.current) {
      const params = {};
      params[current.code] = current.current.value;
      modifyProps.push(params);
    }
    const curProp = temperature.value;
    if (curProp) {
      const params = {};
      if (curProp.switch) {
        params[curProp.code] = isEmpty(curProp.current)
          ? `${curProp.min}-${curProp.max}`
          : curProp.current;
      } else {
        params[curProp.code] = '-1';
      }
      modifyProps.push(params);
    }
  }
  if (isEmpty(modifyProps)) {
    showInfo('请选择锁定信息');
    return;
  }

  control(modifyProps);
};

const loadProps = async () => {
  try {
    const res: any = await loadDeviceProps(deviceId);
    // console.log('loadProps res', res);
    res.properties.forEach(prop => {
      try {
        const code = prop.code as string;
        switch (code) {
          case 'lockedOnoff':
            powerSwitch.value = parseSelectLock(prop, '开关锁定');
            break;
          case 'lockedAirMode':
            mode.value = parseSelectLock(prop, '模式锁定');
            break;
          case 'lockedTemp':
            temperature.value = parseTemperatureLock(prop);
            break;
        }
      } catch (error) {}
    });
    // console.log('解析完锁信息', powerSwitch.value, mode.value, temperature.value);
  } catch (error) {}
};

const onSelectPicker = e => {
  const state = pickerState.value;
  if (!state) return;

  if (state.flag == 1) {
    if (powerSwitch.value) {
      powerSwitch.value.current = e[0];
    }
  } else if (state.flag == 2) {
    if (mode.value) {
      mode.value.current = e[0];
    }
  }
};

const onClickPower = () => {
  const curMode = powerSwitch.value;
  if (!curMode) return;

  pickerState.value = {
    flag: 1,
    show: true,
    title: curMode.name,
    options: curMode.options,
  };
};

const onClickMode = () => {
  const curMode = mode.value;
  if (!curMode) return;

  pickerState.value = {
    flag: 2,
    show: true,
    title: curMode.name,
    options: curMode.options,
  };
};

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
        showInfo('操作成功');
        uni.navigateBack();
      } else {
        showInfo(message?.data?.failCode || '设置失败');
      }
    }
  } catch (error) {}
};
//#endregion

onLoad((option: any) => {
  deviceId = option.id;
  deviceName = option.name;
  log(`设备锁定页 name:${deviceName} id:${deviceId}`);
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
      <!-- 开关锁定 -->
      <view v-if="powerSwitch" class="cardRound k-p-26 k-f-center k-m-t-24" @click="onClickPower">
        <view class="label">{{ powerSwitch.name }}</view>
        <view class="k-f-1 value" :class="{ valueHintColor: !hasSelectedPowerLock }">{{
          hasSelectedPowerLock ? powerSwitch.current?.label : '请选择'
        }}</view>
        <u-image :src="IconArrow" :width="40" :height="40"></u-image>
      </view>
      <!-- 温度锁定 -->
      <view v-if="!isLockPowerOff && temperature" class="cardRound k-p-26 k-f-c k-m-t-24">
        <view class="k-f u-row-between">
          <view class="label">{{ temperature.name }}</view>
          <u-switch v-model="temperature.switch"></u-switch>
        </view>
        <view v-if="openTemperatureLock">
          <view class="divider"></view>
          <view class="k-f u-row-between">
            <view class="labelGray">设置温度</view>
            <view class="valueRange">{{ temperatureRangeShow }}</view>
          </view>
          <RangeSlider
            :width="622"
            active-color="#1677FF"
            background-color="#DEDFE0"
            :min="temperature.min"
            :max="temperature.max"
            :values="temperatureValues"
            @rangeChange="onRangeChange"
          />
          <view class="k-f u-row-between sliderLabel k-m-t-8">
            <view>{{ temperature.min }}℃</view>
            <view>{{ temperature.max }}℃</view>
          </view></view
        >
      </view>
      <!-- 模式锁定 -->
      <view
        v-if="!isLockPowerOff && mode"
        class="cardRound k-p-26 k-f-center k-m-t-24"
        @click="onClickMode"
      >
        <view class="label">{{ mode.name }}</view>
        <view class="k-f-1 value" :class="{ valueHintColor: !hasSelectedModeLock }">{{
          hasSelectedModeLock ? mode.current?.label : '请选择'
        }}</view>
        <u-image :src="IconArrow" :width="40" :height="40"></u-image>
      </view>
    </view>
    <view class="lockFooter">
      <view class="k-h-128 k-f-center content">
        <view class="k-f-c-center k-p-r-12" @click="onClickLockRecord">
          <u-image :src="IconLockRecord" :width="48" :height="48"></u-image>
          <view class="recordText">锁定记录</view>
        </view>
        <view class="btn left" :class="{ btnDisable: disableUnlock }" @click="onClickUnlock">
          一键解锁
        </view>
        <view class="btn right" :class="{ btnDisable: disableSave }" @click="onClickSave">
          确定
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
  color: #00000073;
}

.divider {
  margin: 24rpx 0;
  height: 1rpx;
  background: #0000000f;
}

.labelGray {
  color: #000000a6;
  font-size: 30rpx;
}

.valueRange {
  color: #000000a6;
  font-size: 30rpx;
}

.sliderLabel {
  color: #00000073;
  font-size: 26rpx;
}

.lockFooter {
  position: fixed;
  width: 100%;
  bottom: 0;
  z-index: 2;
  padding-bottom: calc(constant(safe-area-inset-bottom));
  padding-bottom: calc(env(safe-area-inset-bottom));

  background: #fff;
  box-shadow: 0 -4rpx 8rpx 0 #00000014;

  .content {
    padding: 24rpx 32rpx;

    .recordText {
      margin-top: 8rpx;
      color: #000000a6;
      font-size: 24rpx;
    }

    .btn {
      flex: 1;
      margin: 0 12rpx;

      font-size: 30rpx;
      line-height: 80rpx;
      text-align: center;
      justify-content: center;
      align-items: center;
    }

    .btnDisable {
      opacity: 0.5;
    }

    .left {
      color: #1677ff;
      border-radius: 16rpx;
      border: 2rpx solid #1677ff;
    }

    .right {
      color: #ffffff;
      border-radius: 16rpx;
      background: #1677ff;
    }
  }
}
</style>
