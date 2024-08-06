<template>
  <page>
    <view class="container">
      <login-input
        v-model:val="txt"
        :maxlength="50"
        class="input-margin"
        placeholder="服务器地址"
        @update="txt = $event"
        @clickIcon="txt = ''"
      />
      <view class="custom-button" @click="handleClick">确定</view>
      <view class="custom-button__normal" @click="handleResetClick">重置</view>
    </view>
  </page>
</template>
<script lang="ts">
import { cleanRemoteConfig, fetchRemoteConfig } from '@/utils/global-config';
import { isNil } from '@/utils/lodash-es';
import { server_url_key } from '@/utils/storage-keys';
import { showInfo } from '@/utils/tools';
import { defineComponent, onBeforeMount, ref } from 'vue';
import { REGS } from '../utils/regs';
import loginInput from './components/login-input.vue';
export default defineComponent({
  components: { loginInput },
  setup() {
    const txt = ref('');

    const handleClick = () => {
      if (!REGS.url.test(txt.value) && !isNil(txt.value) && txt.value.length > 0) {
        showInfo('请输入合法的url');
        return;
      }

      fetchRemoteConfig(txt.value)
        .then(() => {
          uni.showToast({
            title: '配置已更新',
          });
          uni.navigateBack();
        })
        .catch(() => {
          uni.showToast({
            icon: 'none',
            title: '无法获取配置',
          });
        });
    };

    const handleResetClick = () => {
      uni.showModal({
        title: '重置配置',
        success: () => {
          cleanRemoteConfig();
          txt.value = '';
          uni.showToast({ title: '已重置' });
        },
      });
    };
    onBeforeMount(() => {
      txt.value = uni.getStorageSync(server_url_key);
    });
    return { txt, handleClick, handleResetClick };
  },
});
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  padding: 16rpx 48rpx 0;
  .input-margin {
    margin-top: 25rpx;
  }
  .custom-button,
  .custom-button__normal {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 104rpx;
    margin-top: 48rpx;
    border-radius: 16rpx;
    font-size: 34rpx;
  }
  .custom-button {
    background: $ui-color-primary;
    color: white;
  }
  .custom-button__normal {
    background-color: #fff;
    border: 1px solid #333;
    color: #333;
  }
}
</style>
