<template>
  <view v-if="!loaded" style="padding: 160rpx 0 0 0; text-align: center">
    <u-loading></u-loading>
  </view>
  <template v-else>
    <template v-if="bindType === 3">
      <view style="padding: 160rpx 80rpx 0">
        <u-alert-tips type="warning" :title="bindTypeMsg"></u-alert-tips>
      </view>
    </template>
    <template v-else-if="bindType === 2">
      <Panel />
    </template>
    <view v-else class="my-archive-wrap">
      <view class="my-archive">
        <view class="login-bg-wrap">
          <image class="login-bg" :src="loginBg" mode="scaleToFill" />
        </view>
        <view class="loginForm">
          <view class="input-wrap">
            <view class="left-area">姓名</view>
            <view class="right-area">
              <u-input
                v-model="formState.name"
                input-align="right"
                type="text"
                placeholder="请输入"
                clearable
                maxlength="30"
            /></view>
          </view>
          <view class="input-wrap">
            <view class="left-area">
              <u-input
                v-model="iDCertTypeName"
                type="select"
                class="select-input"
                :custom-style="{
                  'text-overflow': 'ellipsis',
                  overflow: 'hidden',
                }"
                @click="show = true"
              />
              <u-action-sheet
                v-model="show"
                :list="types"
                @click="actionSheetCallback"
              ></u-action-sheet>
            </view>
            <view class="right-area"
              ><u-input
                v-model="formState.idCard"
                input-align="right"
                type="text"
                placeholder="请输入证件号"
                clearable
            /></view>
          </view>
          <view class="input-wrap">
            <view class="left-area">手机号</view>
            <view class="right-area">
              <u-input
                v-model="formState.tel"
                input-align="right"
                type="text"
                placeholder="请输入手机号"
                disabled
            /></view>
          </view>
          <view class="input-wrap">
            <view class="right-area">
              <u-input
                v-model="formState.captcha"
                type="text"
                placeholder="请输入验证码"
                maxlength="6"
              />
            </view>

            <view
              class="code-area"
              :style="{ color: getPhoneCodeState.disabled ? '' : '#1677FF' }"
              @click="getPhoneCodeState.disabled ? () => {} : onSendCode()"
              >{{ getPhoneCodeState.btnText }}</view
            >
          </view>
          <view v-if="!isProd" class="input-wrap" style="justify-content: space-between">
            <view class="left-area">调试模式</view>
            <u-switch v-model="debug"></u-switch>
          </view>
        </view>
      </view>
      <u-button
        type="primary"
        style="height: 104rpx; border-radius: 16rpx"
        :disabled="disabledConfirm"
        @click="onSubmit"
        >确定</u-button
      >
    </view>
  </template>

  <u-modal v-model="visible1" confirm-text="知道了" title="提醒" :content="content1"> </u-modal>
  <u-modal
    ref="uModal2"
    v-model="visible2"
    confirm-text="创建"
    show-cancel-button
    title="提醒"
    :content="content2"
    :async-close="true"
  >
    <template #confirm-button>
      <!-- <u-button disabled>创建1</u-button> -->
      <view :style="authFlag ? {} : { color: 'rgba(0, 0, 0, 0.3)' }" @click="setUp()">创建</view>
    </template>
  </u-modal>
</template>

<script setup lang="ts">
import loginBg from '@/app-school-affairs/static/teacher-archive/loginBg.png';
import {
  bindArchive,
  checkPhoneBindStatusApp,
  getDict,
  sendCaptcha,
} from '@/app-school-affairs/teacher-archive/helper/api';
import { loginStore } from '@/store/modules/login';
import { EnvType } from '@/utils/env';
import { onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { forEach } from 'lodash-es';
import { computed, ref } from 'vue';
import { createArchiveBaseInfo } from '../helper/api.ts';
import { useAuth } from '../helper/auth';
import { useDictionaries } from '../helper/dicts.ts';
import { info as infoSchema } from '../helper/schema/info';
import { convert, outputFormDataFormat } from '../helper/utils.ts';
import Panel from './Panel.vue';
import useCountDown from './useCountDown';

const isProd = import.meta.env.VITE_SERVER_ENV === EnvType.EnvType_PROD;

const { authFlag } = useAuth();
const uModal2 = ref();

const store = loginStore();
const { userInfo } = store || {};

const show = ref(false);

const formState = ref({
  name: '',
  iDCertType: '1',
  idCard: '',
  tel: '',
  captcha: '',
});

const iDCertTypeName = computed(() => {
  return types.value?.find(one => one.value == formState.value.iDCertType)?.label;
});

const { time, handleStart } = useCountDown(59);

const visible1 = ref(false);
const visible2 = ref(false);

const content1 = ref('');
const content2 = ref('');

const debug = ref(isProd ? false : true);
const types = ref([]);

// 1未绑定（认证页面-类似登录） 2已绑定（直接展示我的档案） 3被其他学校绑定(结果错误页)
const bindType = ref(1);
const bindTypeMsg = ref('');
// const hasBind = ref(false);
const loaded = ref(false);

const getPhoneCodeState = computed(() => {
  if (time.value <= 0) {
    return {
      disabled: false,
      btnText: '获取验证码',
      // btnText: clickCountDownBtnDone.value ? '重新获取' : '获取验证码',
    };
  } else {
    return {
      disabled: true,
      btnText: `${time.value}s`,
    };
  }
});

const disabledConfirm = computed(() => {
  if (
    !formState.value.name ||
    !formState.value.iDCertType ||
    !formState.value.idCard ||
    !formState.value.tel ||
    !formState.value.captcha
  ) {
    return true;
  }

  return false;
});

const dictionaries = useDictionaries([infoSchema]);

const initialData = computed(() => {
  const userId = userInfo?.id;
  const data = {
    name: formState.value.name,
    certType: formState.value.iDCertType,
    certNumber: formState.value.idCard,
    bindTel: formState.value.tel,
  };
  if (data['certType'] === '1' && data['certNumber']?.length >= 14) {
    const date = dayjs(data.certNumber.slice(6, 14), 'YYYYMMDD');
    if (date.isValid()) {
      data['birthday'] = date;
    }
  }
  return {
    userId,
    ...data,
  };
});

const extData = computed(() => {
  return {
    locationName: userInfo?.locationName,
  };
});

const defaultFormData = computed(() => {
  const result: any = {};
  forEach(
    infoSchema.fields,
    f => (result[f.name] = convert(f.default, initialData.value, extData.value)),
  );
  forEach(initialData.value, (v, k) => (result[k] = v));
  return result;
});

async function toSaveInfo(data) {
  await createArchiveBaseInfo(outputFormDataFormat(data, infoSchema.fields)).catch(e => {
    // loading.value = false;
    // return Promise.reject(e);
  });
  // message.success('保存成功');
  uni.showToast({
    title: '保存成功',
    icon: 'success',
  });
  uni.$emit('updateTeacherMyPanelWithLoading');
  uni.$emit('editGoBack');
}

function setUp() {
  if (!authFlag.value) {
    uModal2.value.clearLoading();
    return;
  }
  visible2.value = false;
  // uni.navigateTo({
  //   url: `/app-school-affairs/teacher-archive/detail/index?type=add&userId=${userId}&userInfo=${JSON.stringify(
  //     _userInfo,
  //   )}`,
  // });
  uni.navigateTo({
    url: `/app-school-affairs/teacher-archive/edit/index`,
    events: {
      dataToParent: function (data) {
        console.log('🚀ccc ~ dataToParent :', data);
        toSaveInfo(data);
      },
    },
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('dataToChild', {
        props: {
          schema: infoSchema,
          dictionaries: dictionaries.value,
          preview: false,
          initialData: initialData.value,
        },
        formData: { ...defaultFormData.value },
      });
    },
  });
}

function actionSheetCallback(index) {
  // this.value = this.actionSheetList[index].text;
  const newVal = types.value?.[index]?.value;

  if (newVal !== formState.value.iDCertType) {
    formState.value.idCard = '';
  }
  formState.value.iDCertType = newVal;
}

async function onSubmit() {
  try {
    const res = await bindArchive({
      ...formState.value,
      userId: userInfo?.id,
    });
    const { codeNum: code } = res || {};
    if (code === 1001) {
      // 验证码错误
      // createMessage.error('验证码错误');
      visible1.value = true;
      content1.value = '验证码错误';
    } else if (code === 200) {
      // 情况1：找到组织下与所录入信息相关联的档案且还未被关联账号
      // 关联成功后，该档案【是否已关联账号】状态由“未关联”变更为“已关联”
      // toast提示档案关联成功，进入我的档案首页
      // createMessage.success('档案关联成功');
      uni.showToast({
        title: '档案关联成功',
        icon: 'success',
        duration: 1000,
      });
      // hasBind.value = true;
      bindType.value = 2;
      uni.setNavigationBarTitle({
        title: '教师发展档案',
      });
    } else if (code === 1005) {
      // 情况2：找到组织下与录入信息相关联的档案但已被关联账号
      // 弹窗提示“该档案已被绑定，请联系管理员处理”
      // createMessage.error('该档案已被绑定，请联系管理员处理');
      visible1.value = true;
      content1.value = '该档案已被绑定，请联系管理员处理';
    } else if (code === 1003 || code === 1004) {
      // 情况3：未找到组织下与录入信息相关联的档案 1004
      // 情况4：姓名匹配到了，证件号没有匹配到 1003
      // 弹窗提示“未找到您的相关档案信息，是否创建新档案？”，点击创建后跳转至档案详情页开始填写档案
      visible2.value = true;
      content2.value = '未找到您的相关档案信息，是否创建新档案？';
    } else if (code === 1002) {
      // 情况5：姓名未匹配到，证件号匹配到了
      // 弹窗提示“姓名与证件号不匹配，请检查后重新填写或联系管理员”
      visible1.value = true;
      content1.value = '姓名与证件号不匹配，请检查后重新填写或联系管理员';
    } else if (code === 1006 || code === 1007) {
      // 1006已绑定在其他学校
      // 1007验证教师账号时，识别到非唯一证件号，提示“证件号异常，请联系管理员”，即存在两个相同证件号的档案
      visible1.value = true;
      content1.value = res?.message;
    } else {
      const desc = res?.message;
      if (desc) {
        // createMessage.error(desc);
        uni.showToast({
          title: desc,
          icon: 'error',
          duration: 1000,
        });
      }
    }
  } catch (error) {}
}

async function onSendCode() {
  try {
    const res = await sendCaptcha({
      phone: formState.value.tel,
      debug: +debug.value,
    });
    const { captcha = '', code } = res || {};
    if (captcha && debug.value) {
      formState.value.captcha = captcha;
    }
    handleStart();
  } catch (error) {
    // createMessage.error(error || '获取验证码失败');
    console.log('error', error);
  }
}

//数据选项--数据字典初始化方法
//  function getsourceTypeOptions() {
//   getDictionaryDataSelector('501769175207855493').then(res => {
//     state.optionsObj.sourceTypeOptions = res.data.list;
//   });
// }
function getTypes() {
  getDict('teacherArchive.IDCertType').then(res => {
    types.value = res?.map(one => {
      return {
        ...one,
        text: one?.label,
      };
    });
  });
}

async function init() {
  const res = await checkPhoneBindStatusApp({
    phone: userInfo?.tel,
    userId: userInfo?.id,
  });

  console.log('🚀ccc ~checkPhoneBindStatusApp', res);

  loaded.value = true;
  // 未绑定 这里的数据包了一层在data，所以这样可以
  if (!res?.data) {
    bindType.value = 1;
    uni.setNavigationBarTitle({
      title: '教师身份认证',
    });
  } else if (res?.msg === 'bound') {
    bindType.value = 2;
    uni.setNavigationBarTitle({
      title: '教师发展档案',
    });
  } else {
    bindTypeMsg.value = res?.msg;
    bindType.value = 3;
  }
  // hasBind.value = !!res?.data;

  // if (!hasBind.value) {
  if (bindType.value === 1) {
    try {
      formState.value.name = userInfo?.userName;
      formState.value.tel = userInfo?.tel;
    } catch (error) {
      return '';
    }
    getTypes();
  }
}

onShow(() => {
  init();
});
</script>

<style scoped lang="scss">
.my-archive-wrap {
  background-color: #f5f5f5;
  height: 100%;
  width: 100%;
  padding: 24rpx 32rpx;
}
.my-archive {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 48rpx;
  .login-bg-wrap {
    padding: 4rpx 4rpx 0;
  }
  .login-bg {
    border-radius: 16rpx;
    width: 100%;
    height: 328rpx;
    background-repeat: no-repeat;
    background-size: cover;
  }
  .loginForm {
    padding: 20rpx 32rpx 32rpx;
    .input-wrap {
      display: flex;
      align-items: center;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 16rpx;
      padding: 0 32rpx;
      height: 96rpx;
      .left-area {
        width: 180rpx;
      }
      .right-area {
        flex: 1;
      }
      .code-area {
        padding: 0 0 0 32rpx;
        border-left: 1px solid rgba(0, 0, 0, 0.06);
        height: 44rpx;
        font-size: 32rpx;
      }
      .select-input {
        :deep(.uni-input-input) {
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
      & + .input-wrap {
        margin-top: 24rpx;
      }
    }
  }
}
</style>
