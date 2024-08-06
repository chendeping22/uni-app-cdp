<script setup lang="ts">
import { debounce } from '@/utils/lodash-es';
import { onError, onHide, onLaunch, onShow, onUnhandledRejection } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { toRefs, watch } from 'vue';
import useWxUpdater from './components/use-weixin-updater';
import { loginStore } from './store/modules/login';
import { initLoginInfo } from './utils/cache-app';
import { checkAppVersion } from './utils/check-version';
import { EnvType } from './utils/env';
import mqttApplication from './utils/mqtt/mqttApplication';
import { hideLoading } from './utils/tools';
// #ifdef APP-PLUS
import {
  debuggerModule,
  installDebugger, // @ts-ignore
} from './uni_modules/imengyu-IMDebuggerWindow/common/debuggerExtern.js';
import { pushJump } from './utils/push-jump';
import { schemaArgsHandle } from './utils/schema-jump';
// #endif
dayjs.locale('zh-cn');

// 检查微信是否有新版本
useWxUpdater();

let delayTimeCloseSplashscreen = 300;

const { currentEnv, mqttInfo, authInfo } = toRefs(loginStore());
watch(
  () => ({
    mqttUuid: mqttInfo.value?.mqttUuid,
    accessToken: authInfo.value?.accessToken,
    online: currentEnv.value?.online,
  }),
  (val, preVal) => {
    console.log('=================mqtt', val, preVal);

    if (!val.accessToken) return;
    // 登录之后进入的逻辑
    const onceJoinApp = preVal.mqttUuid !== val.mqttUuid;
    // 多项目切换
    const switchProjectMode = preVal.accessToken !== val.accessToken && !!preVal.accessToken;

    const changeNetwork = val.online !== preVal.online;
    if (onceJoinApp || switchProjectMode || changeNetwork) {
      if (switchProjectMode || changeNetwork) {
        mqttApplication.mqttServiceInstance?.end({
          force: true,
          options: {},
        });
      }

      if (!val.mqttUuid) return; // 退出登录

      console.log('==============mqtt reconnetct');
      mqttApplication.mqttSubscribe(
        {
          topics: [],
          mqttActions: {},
          isConnect: true,
        },
        () => {
          if (val.online && changeNetwork) {
            uni.$emit('global-onShow');
          }
        },
      );
    }
  },
);
onLaunch(async () => {
  console.log('App Launch', import.meta.env);
  // #ifdef APP-PLUS
  if (
    import.meta.env.VITE_SERVER_ENV !== EnvType.EnvType_PROD ||
    process.env.NODE_ENV === 'development'
  ) {
    installDebugger({
      enableRequestInterceptor: true,
      showGlobalFloatWindow: false,
    });
  }
  // #endif

  // #ifdef APP-PLUS
  // setTimeout(() => {
  //   plus.navigator.closeSplashscreen();
  // }, 100);
  // 推送处理
  // "click"-从系统消息中心点击消息启动应用事件
  plus.push.addEventListener(
    'click',
    function (msg: any) {
      console.log('push_msg_org_click :', msg);
      if (!msg.payload.bizCode) return;
      // 如果当前已登录，则直接跳转到通知对应页面
      const store = loginStore();
      if (store?.authInfo?.accessToken) {
        pushJump(msg);
        return;
      }
      // 如果未登录，则将推送参数存至store
      uni.setStorage({ key: 'setPushParams', data: msg });
    },
    false,
  );

  /**
   * iOS前台推送
   * 一键报警呼叫通知-联调--适配安卓
   * "receive"-应用从推送服务器接收到推送消息事
   */
  plus.push.addEventListener(
    'receive',
    function (msg: any) {
      console.log('push_msg_org_receive:', msg);
      // 通知刷新消息数
      uni.$emit('unreadMessageNotice');
      if (msg.type === 'receive') {
        let payload: any = {};
        if (typeof msg.payload == 'string') {
          payload = JSON.parse(msg.payload || '{}');
        } else {
          payload = msg.payload;
        }
        const { bizCode } = payload;
        if (!bizCode) return;
        if (plus.os.name === 'iOS') {
          const { customCotent, customTitle } = payload;
          // 创建本地消息
          plus.push.createMessage(customCotent, payload, {
            cover: false,
            title: customTitle,
          });
        }
      }
    },
    false,
  );

  /** 强制转light模式 */
  const initLightMode = () => {
    if (plus.os.name === 'iOS') {
      //判断当前系统是否是深色模式
      if (plus.navigator.getUIStyle() === 'dark') {
        plus.nativeUI.setUIStyle('light');
      }

      //监听系统是否改成深色模式
      // uni.onThemeChange(function (res) {
      //   if (res.theme === 'dark') {
      //     plus.nativeUI.setUIStyle('light');
      //   }
      // });
    }
  };
  initLightMode();

  /** 自动登录 */
  let url = '/app-platform/login/index';
  const refreshLogin = async () => {
    try {
      // showLoading();
      const res = await loginStore().verifyLogin();
      delayTimeCloseSplashscreen = 0;
      console.log('refreshLogin result', res);
    } catch (error) {
      console.log('refreshLogin err' + JSON.stringify(error));
      uni.reLaunch({
        url: url,
        success: () => {
          console.log('reLaunch login success');
          plus.navigator.closeSplashscreen();
          hideLoading();
        },
        fail: err => {
          plus.navigator.closeSplashscreen();
          hideLoading();
          console.log('reLaunch err' + JSON.stringify(err));
        },
      });
    }

    setTimeout(() => {
      checkAppVersion(false, false);
    }, 1000);
  };
  await refreshLogin();
  // #endif
  // fix:网络断开连续触发2次;
  const changeNetwork = debounce(() => {
    const env = currentEnv.value;
    currentEnv.value = { ...env, online: +new Date() + '' };
  }, 1000);
  uni.onNetworkStatusChange(res => {
    const { isConnected } = res;
    console.log('mqtt network isConnected', isConnected);

    // 网络变化，mqtt会不断重试连接,所以统一让watch做mqtt断连和重连
    changeNetwork();
  });
});
onUnhandledRejection(err => {
  // #ifdef APP-PLUS
  if (debuggerModule) debuggerModule.addAppErr(err);
  // #endif
});
onError(err => {
  // #ifdef APP-PLUS
  console.error(err);
  if (debuggerModule) debuggerModule.addAppErr(err);
  // #endif
});
onShow(() => {
  console.log('App Show');

  // mqtt重新连接
  const mqttUuid = mqttInfo.value?.mqttUuid;
  if (mqttUuid && mqttApplication.uuid) {
    mqttApplication.mqttSubscribe(
      {
        topics: [],
        mqttActions: {},
        isConnect: true,
      },
      () => {
        uni.$emit('global-onShow');
        mqttApplication.checkMqttStatusOfRetryMqtt(3000);
      },
    );
  }

  // #ifdef APP-PLUS
  setTimeout(() => {
    plus.navigator.closeSplashscreen();
  }, delayTimeCloseSplashscreen);

  // 需要加延时,否则获取到的为旧数据
  setTimeout(() => {
    schemaArgsHandle();
  }, 200);
  // #endif

  // #ifdef H5
  if (
    (!authInfo.value?.accessToken && import.meta.env.VITE_SERVER_ENV !== EnvType.EnvType_PROD) ||
    process.env.NODE_ENV === 'development'
  ) {
    console.log('初始化缓存数据');
    initLoginInfo();
  }
  // #endif
});
onHide(() => {
  /**
   * 1. 切后台断开 mqtt客户端;
   * 2. cb是否执行取决于broken服务触发end,非人为控制，完全由mqtt底层mqtt End Stream触发；
   * 3. 必须手动清除clientId, 下次创建新的mqtt connect即生成一个新的客户端链接；
   * 4. 修复旧的clientId和切换项目新生成的clientId（异步） 没有及时替换，旧的mqtt连接已经建立了，
   *    再新的clientId建立的mqtt连接后，就形成mqtt 连接通道多个导致一些问题产生?
   */
  mqttApplication.clearInterval();
  if (mqttApplication.mqttStateObservable.getIsConnected()) {
    mqttApplication.mqttServiceInstance?.end({
      force: true,
      options: {},
    });
  }

  // #ifdef APP-PLUS
  // 隐藏页面后清理schema启动参数
  plus.runtime.arguments = '';
  // #endif

  console.log('onHide');
});
</script>
<style lang="scss">
/*给旧应用迁移用 新开发业务禁止使用 请使用vk-uview-ui提供的*/
@import './styles/old/old-global-style.scss';
@import './styles/base.scss';
@import './uni_modules/vk-uview-ui/index.scss';
.page {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  position: absolute;
  overflow: hidden;
  box-sizing: border-box;
  background-color: $ui-color-page-primary;
}
// 全局默认字体
view,
text,
body {
  font-family: PingFang SC, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Hiragino Sans GB,
    Microsoft YaHei UI, Microsoft YaHei, Source Han Sans CN, sans-serif, Apple Color Emoji,
    Segoe UI Emoji, Segoe UI Symbol;
}
/* #ifdef H5 */
:deep(.uni-page-head-btn) {
  display: flex;
}
/* #endif */
</style>
