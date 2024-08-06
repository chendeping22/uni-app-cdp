<template>
  <u-modal
    v-model="state.show"
    :show-cancel-button="false"
    :show-title="false"
    :show-confirm-button="false"
  >
    <view class="container">
      <view class="content">
        <text> 我已阅读并同意</text>
        <text class="color-primary" @tap.stop="goToPrivate">&nbsp;隐私政策&nbsp;</text>
        <text>和</text>
        <text
          class="color-primary"
          @tap.stop="linkToAgreement('/app-platform/login/user-agreement')"
          >&nbsp;用户协议&nbsp;</text
        >
      </view>

      <view class="bottom">
        <view>
          <u-row gutter="12">
            <u-col span="6">
              <view class="cancel-button custom-button" @click="cancelAction">取消</view>
            </u-col>
            <u-col span="6">
              <view v-if="!needGetWXPhone" class="agree-button custom-button" @click="agreeAction"
                >同意并登录</view
              >
              <button
                v-else
                class="agree-button custom-button"
                :open-type="'getPhoneNumber'"
                @click.stop="clickHandleGetWxCode"
                @getphonenumber="clickLoginByWx"
              >
                同意并登录
              </button>
            </u-col>
          </u-row>
        </view>
        <view class="safe-area-inset-bottom"></view>
      </view>
    </view>
  </u-modal>
</template>

<script lang="ts" setup>
import { reactive, ref, watch } from 'vue';
import { goToPrivate } from '../../utils/tools';
import { ClickLoginType } from '../utils';
/** 1. props定义 */
interface IProps {
  type: ClickLoginType;
  needGetWXPhone: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {
  type: ClickLoginType.none,
  needGetWXPhone: false,
});

const state = reactive({
  show: props.type != ClickLoginType.none,
});

watch(
  () => props.type,
  newValue => {
    state.show = newValue != ClickLoginType.none;
  },
);

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits(['clickCancel', 'clickAgree', 'clickHandleGetWxCode', 'clickLoginByWx']);

/** 3. your code here! */
ref('');

// 用户协议及隐私协议跳转
const linkToAgreement = (url: string) => {
  uni.navigateTo({
    url,
  });
};

const cancelAction = () => {
  emits('clickCancel');
};

const agreeAction = () => {
  emits('clickAgree', props.type);
};

const clickHandleGetWxCode = () => {
  emits('clickHandleGetWxCode');
};

const clickLoginByWx = e => {
  emits('clickLoginByWx', e);
};
</script>

<style scoped lang="scss">
.container {
  padding: $space-size-xl $space-size-lg 0;
  .content {
    color: rgba(0, 0, 0, 0.45);
    font-size: 30rpx;

    .color-primary {
      color: $ui-color-primary;
    }
  }
  .bottom {
    height: 176rpx;

    .cancel-button {
      margin: $space-size-lg $space-size-ms $space-size-lg 0rpx;
      background: white;
      color: rgba(0, 0, 0, 0.88);
      border: 2rpx solid rgba(0, 0, 0, 0.15);
    }

    .agree-button {
      margin: $space-size-lg 0rpx $space-size-lg 0rpx;
      color: white;
      background: $ui-color-primary;
    }

    .custom-button {
      height: 80rpx;
      font-size: 30rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      align-self: stretch;
      border-radius: 16rpx;
    }
  }
}
</style>
