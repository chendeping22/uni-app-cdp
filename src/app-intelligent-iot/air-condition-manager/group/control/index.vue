<script lang="ts" setup>
import { controlGroup, loadGroupProps } from '@/app-intelligent-iot/services/air-condition';
import IconArrow from '@/app-intelligent-iot/static/air-condition/arrow_right.svg';
import { hideLoading, log, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { isEmpty } from 'lodash-es';
import { computed, ref } from 'vue';
import TitleView from '../../components/common-title.vue';
import {
  IPickerState,
  IPropSelect,
  IPropSwitch,
  IPropTemperature,
} from '../../utils/AirConditionType';
import { parseSelectProp, parseSwitchProp, parseTemperatureProp } from '../../utils/Utils';

let groupId = '';
let groupName = '';

const pickerState = ref<IPickerState>();

const powerSwitch = ref<IPropSwitch>(); // 开关
const mode = ref<IPropSelect>(); // 模式
const temperature = ref<IPropTemperature>(); // 温度
const windSpeed = ref<IPropSelect>(); // 风速

/**
 * 开关是否打开
 */
const isPowerOn = computed(() => powerSwitch.value?.onOff || false);

const onSelectPicker = e => {
  const state = pickerState.value;
  if (!state) return;

  if (state.flag == 1) {
    if (mode.value) {
      mode.value.current = e[0];
    }
  } else if (state.flag == 2) {
    if (windSpeed.value) {
      windSpeed.value.current = e[0];
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

const onClickSave = async () => {
  const params = {};
  let current = powerSwitch.value;
  if (current) {
    params[current.code] = current.onOff ? 1 : 0;
  }
  const currentMode = mode.value;
  if (currentMode && currentMode.current) {
    params[currentMode.code] = currentMode.current.value;
  }
  const curProp = temperature.value;
  if (curProp) {
    params[curProp.code] = curProp.current;
  }
  const curWindSpeed = windSpeed.value;
  if (curWindSpeed && curWindSpeed.current) {
    params[curWindSpeed.code] = curWindSpeed.current.value;
  }

  if (isEmpty(params)) {
    showInfo('请选择控制项');
    return;
  }

  try {
    showLoading();
    await controlGroup(groupId, params);
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
  } catch (error: any) {
    hideLoading();
    showInfo(error?.desc || '设置失败');
  }
};

const loadProps = async () => {
  try {
    const res: any = await loadGroupProps(groupId);
    // console.log('loadProps res', res);
    res?.properties?.forEach(prop => {
      try {
        const code = prop.code as string;
        switch (code) {
          case 'OnOff':
            powerSwitch.value = parseSwitchProp(prop, '开关');
            break;
          case 'AirConditionMode':
            mode.value = parseSelectProp(prop, '模式');
            break;
          case 'Temp':
            temperature.value = parseTemperatureProp(prop);
            break;
          case 'windSpeedMode':
            windSpeed.value = parseSelectProp(prop, '风速');
          default:
        }
      } catch (error) {}
    });
  } catch (error) {}

  console.log('解析组属性信息', powerSwitch.value, mode.value, temperature.value);
};

onLoad((option: any) => {
  groupId = option.id;
  groupName = option.name;
  log(`分组控制页 name:${groupName} id:${groupId}`);
  loadProps();
});
</script>

<template>
  <page custom-overflow="scroll">
    <view class="pageMargin">
      <TitleView :title="groupName" :device-or-group="false" />
      <!-- 开关 -->
      <view v-if="powerSwitch" class="cardRound k-p-26 k-f-center u-row-between k-m-t-24">
        <view class="label">{{ powerSwitch.name }}</view>
        <u-switch v-model="powerSwitch.onOff"></u-switch>
      </view>
      <!-- 模式 温度 -->
      <view v-if="isPowerOn && (mode || temperature)" class="cardRound k-p-26 k-f-c k-m-t-24">
        <view v-if="mode" class="k-f u-row-between" @click="onClickMode">
          <view class="label">{{ mode.name }}</view>
          <view class="k-f-1 value">{{ mode.current?.label || '' }}</view>
          <u-image :src="IconArrow" :width="40" :height="40" :show-loading="false"></u-image>
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
        <u-image :src="IconArrow" :width="40" :height="40" :show-loading="false"></u-image>
      </view>
    </view>
    <view class="lockFooter">
      <view class="k-h-128 k-f-center content">
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
  color: #000000a6;
}

.divider {
  margin: 26rpx 0 32rpx;
  height: 1rpx;
  background: #0000000f;
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

    .btn {
      flex: 1;
      margin: 0 12rpx;

      font-size: 30rpx;
      line-height: 80rpx;
      text-align: center;
      justify-content: center;
      align-items: center;
    }

    .right {
      color: #ffffff;
      border-radius: 16rpx;
      background: #1677ff;
    }
  }
}
</style>
