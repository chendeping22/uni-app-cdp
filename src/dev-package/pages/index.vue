<template>
  <view class="page">
    <u-card title="当前域名配置">
      <template #body>
        <!-- 环境切换按钮 -->
        <template v-if="showEnvSwitcher">
          <view
            v-for="(config, env, index) in envConfig"
            :key="env"
            :style="{ marginTop: index ? '16rpx' : '' }"
          >
            <u-button
              size="medium"
              :custom-style="{ display: 'block' }"
              @click="handleSetConfig(config)"
              >{{ env }}</u-button
            >
          </view>
        </template>
        <!-- 当前配置 -->
        <template v-else>
          <view class="config-record">
            <view class="config-key">server url</view>
            <view class="config-value">{{ serverUrl || '-' }}</view>
          </view>
          <view v-for="(value, key) in config" :key="key" class="config-record">
            <view class="config-key">{{ key }}</view>
            <view class="config-value">{{ value }}</view>
          </view>
        </template>
      </template>
      <template #foot>
        <view class="config-foot">
          <u-button class="config-switch" type="warning" size="mini" @click="handleResetClick"
            >重置配置</u-button
          >
          <u-button class="config-switch" size="mini" @click="handleConfigClick">手动配置</u-button>
          <u-button class="config-switch" size="mini" @click="handleSwitchClick">切换配置</u-button>
        </view>
      </template>
    </u-card>
  </view>
</template>
<script setup lang="ts">
import {
  ConfigType,
  cleanRemoteConfig,
  getConfig,
  getServerUrl,
  setConfig,
} from '@/utils/global-config';
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { envConfig } from '../utils/env-config';

const config = ref(getConfig());
const serverUrl = ref('');
const showEnvSwitcher = ref(false);

const updateConfigData = () => {
  config.value = getConfig();
  serverUrl.value = getServerUrl();
};

const handleSwitchClick = () => {
  showEnvSwitcher.value = !showEnvSwitcher.value;
};

const handleResetClick = () => {
  uni.showModal({
    title: '重置配置',
    success: () => {
      cleanRemoteConfig();
      updateConfigData();
      showEnvSwitcher.value = false;
      uni.showToast({ title: '已重置' });
    },
  });
};

const handleConfigClick = () => {
  uni.navigateTo({ url: '/app-platform/login/server' });
};

const handleSetConfig = (conf: ConfigType) => {
  setConfig(conf);
  updateConfigData();
  showEnvSwitcher.value = false;
};

onShow(() => {
  updateConfigData();
});
</script>
<style scoped lang="scss">
.config {
  &-foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16rpx;
  }
  &-title {
    font-size: 1.2;
    font-weight: 500;
  }
  &-record {
    margin-top: 16rpx;
  }
  &-key {
    color: #000;
    line-height: 1.4;
    font-size: 1.1;
    font-weight: 500;
  }
  &-value {
    color: #666;
    line-height: 1.4;
  }
}
</style>
