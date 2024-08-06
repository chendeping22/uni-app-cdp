<template>
  <view class="flex" @click="processHandle">
    <image
      v-if="status !== CallStatusEnum.LINKED"
      :src="isDisabled ? icon_phone_disabled : icon_phone"
      class="icon-32 mr-xxs"
    />
    <image v-else :src="icon_handup" class="icon-48 mr-xxs" />
    <view
      v-if="status !== CallStatusEnum.LINKED"
      class="no-shrink"
      :class="isDisabled ? 'offline-color' : 'online-color'"
      >{{ status === CallStatusEnum.DIALING ? '呼叫中' : '发起对讲' }}</view
    >
    <view v-else class="no-shrink">{{ linkedDuration }}</view>
  </view>
</template>

<script lang="ts" setup>
import {
  IBullyingAccountInfo,
  IBullyingServerInfo,
  fetchBullyingAccountInfo,
  fetchBullyingExtId,
  fetchBullyingServerInfo,
} from '@/app-school-safe/services/ai-prevent-bullying';
import icon_handup from '@/app-school-safe/static/svg/icon_handup.svg';
import icon_phone from '@/app-school-safe/static/svg/icon_phone.svg';
import icon_phone_disabled from '@/app-school-safe/static/svg/icon_phone_disabled.svg';
import { formatDuration } from '@/app-school-safe/utils';
import {
  gotoAppPermissionSetting,
  requestAndroidPermission,
  requestIOSPermission,
} from '@/app-school-safe/utils/plus-permission';
import { callBridge } from '@/js-bridge/call-bridge';
import { callNative } from '@/js-bridge/call-native';
import { Action, Service } from '@/js-bridge/enums';
import { log } from '@/utils/tools';
import { computed, onBeforeMount, onBeforeUnmount, ref, toRefs, watch } from 'vue';
import { CallStatusEnum } from './constants';

interface IProps {
  deviceId?: string;
  isOnline?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  deviceId: '',
  isOnline: false,
});

const { deviceId, isOnline } = toRefs(props);

const emits = defineEmits(['call', 'stop']);

const status = ref(CallStatusEnum.NONE);
const duration = ref(0);
const serverInfo = ref<IBullyingServerInfo>(); // 快鱼平台的ip及端口
const serverStatus = ref(true); // 快鱼平台连接状态
const accountInfo = ref<IBullyingAccountInfo>(); // 每个快鱼SDK对应的分组的账号密码
const selfId = ref<number>(); // 本机sdk对应的在快鱼平台的设备id(换账号密码用)
const extId = ref<number>(); // 记录在平台上的防欺凌设备id(发起对讲时用)
let durationTimeFn: any; // 通话时长定时器

const linkedDuration = computed(() => {
  const format = duration.value > 3600 ? 'HH:mm:ss' : 'mm:ss';
  return formatDuration(duration.value, format);
});

const isDisabled = computed(() => {
  return (
    !serverStatus.value || !isOnline.value || status.value === CallStatusEnum.NONE || !extId.value
  );
});

/**
 * 注册事件监听
 *  上报selfDeviceId,
 *  对讲设备状态上报
 */
const registerListener = () => {
  callNative(
    {
      service: Service.BullyCall,
      action: Action.bullyRegisterListener,
    },
    res => {
      log('事件监听注册', res);
      const resObj = typeof res === 'string' ? JSON.parse(res) : res;
      const { type, data } = resObj;
      switch (type) {
        case 61003:
          const { isOnline, serverType } = data;

          // 离线事件里可能为其他服务器的状态上报，此处过滤出只有区域服务器的离线才作为在线/离线的标准
          if (serverType === 1) {
            serverStatus.value = Boolean(isOnline);
          }

          break;
        case 61001:
          selfId.value = data.selfId;
          break;
        case 12:
          /**
           * 呼叫监听(高位状态=1)
           * state为3时表示对讲，peerId为被呼叫的设备
           * 设备状态上报变化(高位状态+低位状态)：
           * a. 设备不存在
           *    1. h1+l1  接通中
           *    2. h1+l0  连接失败
           * b. 设备正常接听
           *    1. h1+l1  接通中
           *    2. h1+l2  通话中
           * c. 设备端挂断
           *    1. h1+l1  接通中
           *    2. h1+l2  通话中
           *    3. h1+l0  设备端挂断
           * b. 呼叫端挂断
           *    1. h1+l1  接通中
           *    2. h1+l2  通话中
           *    3. h1+l0  呼叫端挂断
           * c. 设备端占线
           *    1. h1+l1  接通中
           *    2. h1+l3  占线
           *    3. h1+l0  连接失败？
           * e. 设置自动接听
           *    1. h1+l1  接通中
           *    2. h1+l2  通话中
           * f. 直接挂断
           *    1. h1+l1  接通中
           *    2. h1+l0  设备端挂断
           * d. 对讲过程中拔掉网线
           *    1. h1+l1  接通中
           *    2. h1+l2  通话中
           *    3. h1+l0  连接终端(延迟上报)
           */
          const { state, peerId, highBit, lowBit } = data;
          if (state === 3 && highBit === 1) {
            if (peerId === extId.value) {
              if (lowBit === CallStatusEnum.DIALING) {
                // 接通中
                status.value = CallStatusEnum.DIALING;
              } else if (lowBit === CallStatusEnum.LINKED) {
                // 通话中
                status.value = CallStatusEnum.LINKED;
                durationTimeFn = setInterval(() => {
                  duration.value += 1;
                }, 1000);
              } else if (lowBit === CallStatusEnum.BUSY) {
                // 设备端占线
                status.value = CallStatusEnum.HANGUP;
                uni.showToast({
                  title: '对方正在对讲中',
                  icon: 'none',
                });
              } else if (lowBit === CallStatusEnum.FREE) {
                // 通话结束
                status.value = CallStatusEnum.HANGUP;
                uni.showToast({
                  title: '通话结束',
                  icon: 'none',
                });
              }
            }
          }
      }
    },
    err => {
      log('事件监听注册失败', err);
      const errObj = typeof err === 'string' ? JSON.parse(err) : err;
      uni.showToast({
        title: errObj?.msg || '事件监听注册失败',
        icon: 'none',
      });
    },
  );
};

const init = (callback?: () => void) => {
  if (!serverInfo.value) return;
  const { areaIp, areaPort } = serverInfo.value;

  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallInit,
    data: {
      areaIp,
      areaPort,
    },
  })
    .then((res: any) => {
      log('初始化对讲', res);
      callback?.();
    })
    .catch(err => {
      log('初始化对讲失败', err);
      const errObj = typeof err === 'string' ? JSON.parse(err) : err;
      uni.showToast({
        title: errObj?.msg || '初始化对讲失败',
        icon: 'none',
      });
    });
};

const login = () => {
  if (!accountInfo.value) return;
  const { userName, password } = accountInfo.value;

  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallLogin,
    data: {
      userName,
      password,
    },
  })
    .then((res: any) => {
      log('登录对讲', res);
      status.value = CallStatusEnum.CANCALL;
    })
    .catch(err => {
      log('登录对讲失败', err);
      const errObj = typeof err === 'string' ? JSON.parse(err) : err;
      uni.showToast({
        title: errObj?.msg || '登录对讲失败',
        icon: 'none',
      });
    });
};

const call = () => {
  if (!extId.value) return;
  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallStartTalk,
    data: {
      deviceId: extId.value,
    },
  })
    .then((res: any) => {
      log('发起对讲', res);
      status.value = CallStatusEnum.DIALING;
    })
    .catch(err => {
      log('发起对讲失败', err);
      const errObj = typeof err === 'string' ? JSON.parse(err) : err;
      uni.showToast({
        title: errObj?.msg || '发起对讲失败',
        icon: 'none',
      });
    });
};

const stop = () => {
  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallStopTalk,
  })
    .then((res: any) => {
      log('停止对讲', res);
      status.value = CallStatusEnum.HANGUP;
    })
    .catch(err => {
      log('停止对讲失败', err);
      const errObj = typeof err === 'string' ? JSON.parse(err) : err;
      uni.showToast({
        title: errObj?.msg || '停止对讲失败',
        icon: 'none',
      });
    });
};

const destroy = () => {
  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallDestroy,
  })
    .then((res: any) => {
      log('销毁对讲', res);
      status.value = CallStatusEnum.NONE;
      duration.value = 0;
    })
    .catch(err => {
      log('销毁对讲失败', err);
    });
};

const getSelfDeviceId = () => {
  callBridge({
    service: Service.BullyCall,
    action: Action.bullyCallGetSelfDeviceId,
  })
    .then((res: any) => {
      log('获取本机设备id', res);
      const resObj = typeof res === 'string' ? JSON.parse(res) : res;
      if (resObj?.deviceId) selfId.value = resObj.deviceId;
    })
    .catch(err => {
      log('获取本机设备id失败', err);
    });
};

const getExtId = async () => {
  const res = await fetchBullyingExtId(deviceId.value);
  extId.value = Number(res);
};

/**
 * 获取麦克风权限
 */
const checkPermisson = async () => {
  let status =
    plus.os.name === 'iOS'
      ? await requestIOSPermission('record')
      : await requestAndroidPermission('android.permission.RECORD_AUDIO');
  if (status === null || status === 1) return true;
  uni.showModal({
    title: '麦克风权限开启提醒',
    content: '您尚未开启应用的麦克风权限，无法发起对讲，是否前往设置?',
    confirmText: '去设置',
    success: function (res) {
      if (res.confirm) {
        gotoAppPermissionSetting();
      }
    },
  });
  return false;
};

const processHandle = async () => {
  if (isDisabled.value) return;
  const hasPermission = await checkPermisson();
  if (!hasPermission) return;
  if ([CallStatusEnum.CANCALL, CallStatusEnum.HANGUP].includes(status.value)) {
    uni.showModal({
      title: '发起对讲，确认执行此操作？',
      content: '*发起后，再次点击对讲按钮进行挂断',
      success(res) {
        if (res.confirm) call();
      },
    });
  } else if ([CallStatusEnum.LINKED, CallStatusEnum.DIALING]) {
    stop();
  }
};

const emitCallStatusChange = () => {
  uni.$emit('deviceCallStatusChange', {
    id: deviceId.value,
    callStatus: status.value,
    icon: [CallStatusEnum.DIALING, CallStatusEnum.LINKED].includes(status.value)
      ? icon_phone
      : null,
  });
};

watch(status, () => {
  if ([CallStatusEnum.DIALING, CallStatusEnum.LINKED].includes(status.value)) emits('call');
  else if (status.value === CallStatusEnum.HANGUP) emits('stop');

  // 清除通话时长定时器
  if (status.value !== CallStatusEnum.LINKED) {
    durationTimeFn && clearInterval(durationTimeFn);
    duration.value = 0;
  }

  // 通知其他页面设备通话状态
  emitCallStatusChange();
});

watch(serverInfo, () => {
  if (serverInfo.value) {
    init(() => {
      // 初始化成功尝试获取extId看是否非首次初始化
      getSelfDeviceId();
    });
  }
});

watch(serverStatus, () => {
  if (!serverStatus.value) {
    uni.showToast({
      title: '服务器异常,请联系管理员',
      icon: 'none',
    });
    status.value = CallStatusEnum.HANGUP;
  } else {
    status.value = CallStatusEnum.CANCALL;
  }
});

watch(selfId, async () => {
  // 主动获取或快鱼上报设备id后，从平台获取账号密码登录
  if (selfId.value) {
    const res = await fetchBullyingAccountInfo(String(selfId.value));
    accountInfo.value = res;
  }
});

watch(accountInfo, () => {
  if (accountInfo.value) {
    login();
  }
});

watch(deviceId, async () => {
  if (deviceId.value) {
    // 设备切换后挂断上一个正在通话或者拨号
    if ([CallStatusEnum.DIALING, CallStatusEnum.LINKED].includes(status.value)) stop();
    getExtId();
  }
});

onBeforeMount(async () => {
  /**
   * 快鱼SDK接入流程
   * 0. 注册快鱼平台事件监听
   * 1. 进入应用获取快鱼平台的ip+port
   * 2. 调用SDK初始化(sdk限制不可多次初始化，第二次初始化时默认拦截)
   * 3. 获取本机在快鱼平台的id
   *    3.1 首次初始化流程：快鱼平台上报给SDK-> SDK主动上报给业务端 bullyCallCallback事件里处理
   *    3.2 非首次初始化，调用初始化成功后理解调用 getExtId的事件获取
   * 4. 获取到extId后调用平台获取登录账号密码
   * 5. 主动调用SDK发起呼叫，停止呼叫等事件
   * 6. 快鱼上报的事件处理
   */
  registerListener();
  const res = await fetchBullyingServerInfo();
  serverInfo.value = res;

  if (deviceId.value) getExtId();

  uni.$on('deviceTreeLoaded', emitCallStatusChange);
});

onBeforeUnmount(() => {
  if (status.value !== CallStatusEnum.NONE) {
    stop();
    destroy();
  }
  uni.$off('deviceTreeLoaded', emitCallStatusChange);
});
</script>

<style scoped lang="scss">
.online-color {
  color: $color-primary;
}
.offline-color {
  color: #91caff;
}
</style>
