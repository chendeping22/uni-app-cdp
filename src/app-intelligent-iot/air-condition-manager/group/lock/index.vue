<script lang="ts" setup>
import { loadGroupLockInfo, setGroupLock } from '@/app-intelligent-iot/services/air-condition';
import IconArrow from '@/app-intelligent-iot/static/air-condition/arrow_right.svg';
import { hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { isEmpty } from 'lodash-es';
import { computed, ref } from 'vue';
import TitleView from '../../components/common-title.vue';
import RangeSlider from '../../components/range-slider/range-slider.vue';
import { ILockSelect, ILockTemperature, IPickerState } from '../../utils/AirConditionType';
import { parseRangeByStr, parseSelectLock, parseTemperatureLock } from '../../utils/Utils';

let groupId = '';
let groupName = '';

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

const executeUnlock = async () => {
  const params = {};
  let current = powerSwitch.value;
  if (current) {
    current.current = current.options.find(item => item.value == -1) || null;
    params[current.code] = current.current?.value || -1;
  }
  current = mode.value;
  if (current) {
    current.current = current.options.find(item => item.value == -1) || null;
    params[current.code] = current.current?.value || -1;
  }
  const curProp = temperature.value;
  if (curProp) {
    curProp.current = null;
    curProp.switch = false;
    params[curProp.code] = '-1';
  }
  if (isEmpty(params)) return;

  try {
    showLoading();
    await setGroupLock(groupId, params);
  } catch (error: any) {
    if (!(error && error.code == 1002)) {
      hideLoading();
      showInfo(error?.desc || '设置失败');
      return;
    }
  }
  hideLoading();
  // showInfo('操作成功');
  // uni.navigateBack();
  uni.showModal({
    title: '',
    content: '下发成功，可前往“执行记录”查看执行进度',
    showCancel: true,
    cancelText: '执行记录',
    confirmText: '确定',
    success: res => {
      if (res?.confirm) {
        uni.navigateBack();
      } else {
        uni.redirectTo({
          url: `/app-intelligent-iot/air-condition-manager/record/group?id=${groupId}`,
        });
      }
    },
  });
};

const onClickUnlock = () => {
  uni.showModal({
    title: '',
    content: `确定解锁分组${groupName}的锁定操作？`,
    showCancel: true,
    cancelText: '取消',
    confirmText: '确定',
    success: result => {
      if (result.confirm) {
        executeUnlock();
      }
    },
  });
};

const onClickSave = async () => {
  const params = {};
  let current = powerSwitch.value;
  if (current && current.current) {
    params[current.code] = current.current?.value;
  }
  if (!isLockPowerOff.value) {
    current = mode.value;
    if (current && current.current) {
      params[current.code] = current.current.value;
    }
    const curProp = temperature.value;
    if (curProp) {
      if (curProp.switch) {
        params[curProp.code] = isEmpty(curProp.current)
          ? `${curProp.min}-${curProp.max}`
          : curProp.current;
      } else {
        params[curProp.code] = '-1';
      }
    }
  }
  if (isEmpty(params)) {
    showInfo('请选择锁定信息');
    return;
  }

  try {
    showLoading();
    await setGroupLock(groupId, params);
  } catch (error: any) {
    if (!(error && error.code == 1002)) {
      hideLoading();
      showInfo(error?.desc || '设置失败');
      return;
    }
  }
  hideLoading();
  uni.showModal({
    title: '',
    content: '下发成功，可前往“执行记录”查看执行进度',
    showCancel: true,
    cancelText: '执行记录',
    confirmText: '确定',
    success: res => {
      if (res?.confirm) {
        uni.navigateBack();
      } else {
        uni.redirectTo({
          url: `/app-intelligent-iot/air-condition-manager/record/group?id=${groupId}`,
        });
      }
    },
  });
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

const loadProps = async () => {
  try {
    const res: any = await loadGroupLockInfo(groupId);
    // console.log('loadProps res', res);
    res?.properties?.forEach(prop => {
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

onLoad((option: any) => {
  groupId = option.id;
  groupName = option.name;
  log(`分组锁定页 name:${groupName} id:${groupId}`);
  loadProps();
});
</script>

<template>
  <page custom-overflow="scroll">
    <view class="pageMargin">
      <TitleView :title="groupName" :device-or-group="false" />
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
        <view class="btn left" @click="onClickUnlock"> 一键解锁 </view>
        <view class="btn right" @click="onClickSave"> 确定 </view>
      </view>
    </view>
    <u-select
      v-if="pickerState"
      v-model="pickerState.show"
      :list="pickerState.options"
      :title="pickerState.title"
      @confirm="onSelectPicker"
    ></u-select>
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
