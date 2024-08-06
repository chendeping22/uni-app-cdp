<template>
  <u-navbar
    :is-back="false"
    title-color="#ffffff"
    :background="{ background: bgColor }"
    :title-size="34"
    :border-bottom="false"
    :title="title"
    :is-fixed="false"
    :height="52"
    :title-bold="true"
    class="navbar"
  >
    <view v-if="isCombinedApp" class="content">
      <view class="slot-wrap" @click="changeIdentityAction">
        <view v-if="currentUserType === guardianType" class="student">
          <u-image
            width="80"
            height="80"
            shape="circle"
            error-icon="/static/avatar.png"
            :src="currentOrganization?.childImage"
          ></u-image>
          <view class="student_info">
            <view class="student_info_title">
              <view class="student_info_title_relationship">{{
                currentOrganization?.childName
              }}</view>
              <u-icon v-if="showRedDot" :name="redDot" size="32" class="redDotIcon"></u-icon>
              <u-icon
                v-if="!hideArrowDownIcon"
                size="22"
                name="arrow-down-fill"
                color="#000000e0"
                :class="showRedDot ? '' : 'u-m-l-22'"
              ></u-icon>
            </view>
            <view class="student_info_subTitle">{{
              currentOrganization?.clazzDesc + '/' + currentOrganization?.name
            }}</view>
          </view>
        </view>
        <view v-else class="teacher">
          <text>{{ currentOrganization?.name }}</text>
          <u-icon v-if="showRedDot" :name="redDot" size="32" class="redDotIcon"></u-icon>
          <u-icon
            v-if="!hideArrowDownIcon"
            :class="showRedDot ? '' : 'u-m-l-22'"
            size="22"
            name="arrow-down-fill"
            color="#000000e0"
          ></u-icon>
        </view>
      </view>
    </view>
  </u-navbar>
  <u-popup
    v-model="showPopup"
    mode="bottom"
    :safe-area-inset-bottom="true"
    border-radius="16"
    :closeable="true"
    height="70%"
    class="popup"
    :duration="0"
  >
    <view class="popup-head">
      <view class="popup-title"><text>切换身份</text></view>
      <u-line class="u-line" color="#0000000f"></u-line>
      <view class="u-p-l-32 u-p-t-24 u-p-r-32" style="background: white">
        <view style="display: flex">
          <u-search
            v-model="keyword"
            placeholder="搜索项目"
            :show-action="false"
            shape="square"
            :focus="false"
            style="flex: 1"
            @change="changeAction"
            @clear="clearAction"
          ></u-search>
        </view>
        <view style="height: 24rpx"></view>
      </view>
    </view>

    <view :style="{ height: 210 + 'rpx' }"></view>
    <view
      style="
        position: fixed;
        top: 211rpx;
        left: 0;
        right: 0;
        box-shadow: 0px 2px 4px 0px #00000014;
        height: 1rpx;
        z-index: 3;
      "
    ></view>
    <switchIdentityList
      :locations="locations"
      :keyword="keyword"
      @switch-identity-action="switchIdentityAction"
    ></switchIdentityList>
    <view v-if="keyword.length > 0 && !locations?.length" :style="{ height: emptyHeight + 'px' }">
      <!-- <u-empty-custom card text="暂无数据" /> -->
      <u-empty-custom v-show="true" mode="search" model="list" card="true" font-size="10" />
    </view>
  </u-popup>
  <imp-mqtt-subscriber :topics="TOPICS" @init="mqttInit" @message="onMessage" />
</template>
<script lang="ts">
import redDot from '@/static/workbench/workbench_red_dot.svg';
import { ETerminal } from '@/store/modules/env';
import { IOrganization, loginStore } from '@/store/modules/login';
import { workbenchStore } from '@/store/modules/workbench';
import { getUnreadNum } from '@/utils/get-unread-num';
import { EUserType, combinedApp } from '@/utils/kind';
import { isNil } from '@/utils/lodash-es';
import MQTT_TOPICS from '@/utils/mqtt/mqtt.topics';
import { clientId_key } from '@/utils/storage-keys';
import {
  clearMessage,
  isCurrentOrganization,
  isHaveUnreadMessage,
  saveMessage,
} from '@/utils/unread-message';
import { computed, defineComponent, ref, toRefs, watchEffect } from 'vue';
import { searchLocations } from '../utils/search-location';
import switchIdentityList from './switch-identity-list.vue';
export default defineComponent({
  components: { switchIdentityList },
  props: {
    bgColor: {
      type: String,
      default: '#00000000',
    },
  },
  emits: ['update'],
  setup() {
    const showPopup = ref(false);
    const store = loginStore();
    const isIOSTerminal = store.currentEnv.terminal === ETerminal.iOS;
    const { currentUserType, currentOrganization, organizationList } = toRefs(store);
    const teacherType = ref(EUserType.teacher);
    const guardianType = ref(EUserType.guardian);
    const isCombinedApp = combinedApp();
    const showRedDot = ref(false);
    const title = computed(() => {
      if (isCombinedApp) {
        return '';
      }
      return import.meta.env.VITE_APP_NAME;
    });
    const keyword = ref('');
    const searchOrganizationList = ref<IOrganization[]>();

    const changeIdentityAction = () => {
      if (hideArrowDownIcon.value) {
        return;
      }
      showPopup.value = true;
      store.refreshOrganizationListHandle();
    };
    const screenHeight = uni.getSystemInfoSync().screenHeight;
    const emptyHeight = (screenHeight ?? 300) * 0.7 - uni.upx2px(210) - uni.upx2px(100);

    const switchIdentityAction = (updateOK: boolean, userType: number, refresh: boolean) => {
      console.log('updateOK', updateOK, userType);
      if (updateOK) {
        showPopup.value = false;
        clearMessage(currentOrganization.value, currentUserType.value);
        showRedDot.value = isHaveUnreadMessage();
        getUnreadNum();
        if (refresh) {
          workbenchStore().resetWorkbenchData();
          uni.$emit('switchIdentitySuccess');
        }
      }
    };

    const hideArrowDownIcon = computed(() => {
      const list = organizationList.value?.locations ?? [];
      const result: boolean =
        list.length == 1 &&
        list[0].locations?.length === 1 &&
        (isNil(list[0].locations[0]?.children) || list[0].locations[0]?.children.length === 0);
      return result;
    });

    // mqtt主题
    const TOPICS = [MQTT_TOPICS.MSG_UNREAD_BY_ACCOUNT];

    // init 事件接收参数包含这四个方法，与 react 中注入的同名方法使用一致
    const mqttInit = (item: { notifySubOrUnSubToEndApi: any; manualSubOrUnsub: any }) => {
      const { notifySubOrUnSubToEndApi } = item;
      const clientId = uni.getStorageSync(clientId_key);
      notifySubOrUnSubToEndApi(true, {
        topic: MQTT_TOPICS.MSG_UNREAD_BY_ACCOUNT,
        bid: clientId,
      });
    };

    // message 事件接收推送消息, 返回格式为 { message: any, topic: string };
    const onMessage = (receiveMsg: any) => {
      const { message, topic } = receiveMsg;
      console.log('notify/msgUnreadByAccount receive:', message, topic);
      if (isCurrentOrganization(message)) {
        getUnreadNum();
        uni.$emit('unreadMessageNotice');
      } else {
        showRedDot.value = true;
        saveMessage(message);
      }
    };

    const changeAction = (value: string) => {
      console.log('search', value);
      if (value.length > 0) {
        searchOrganizationList.value =
          searchLocations(organizationList.value?.locations ?? [], value) ?? [];
        console.log('searchOrganizationList', searchOrganizationList);
      } else {
        searchOrganizationList.value = [];
      }
    };

    const clearAction = () => {
      keyword.value = '';
    };

    watchEffect(() => {
      if (!showPopup.value) {
        setTimeout(() => {
          keyword.value = '';
        }, 1000);
      }
    });

    const locations = computed(() => {
      return keyword.value.length > 0
        ? searchOrganizationList.value
        : organizationList.value?.locations;
    });

    return {
      isCombinedApp,
      teacherType,
      guardianType,
      currentUserType,
      currentOrganization,
      title,
      showPopup,
      changeIdentityAction,
      switchIdentityAction,
      hideArrowDownIcon,
      TOPICS,
      mqttInit,
      onMessage,
      redDot,
      showRedDot,
      isIOSTerminal,
      organizationList,
      keyword,
      changeAction,
      clearAction,
      locations,
      screenHeight,
      emptyHeight,
    };
  },
});
</script>
<style scoped lang="scss">
.navbar {
  position: relative;
}

.redDotIcon {
  position: relative;
  left: -15rpx;
  top: -10rpx;
}

.content {
  width: 750rpx;
}

.slot-wrap {
  margin-left: 32rpx;
  display: inline-block;
}

.teacher {
  /* #ifdef MP-WEIXIN*/
  max-width: 400rpx;
  /* #endif */
  /* #ifdef APP-PLUS || H5 */
  max-width: 500rpx;
  /* #endif */
  display: flex;
  position: relative;

  text {
    @include ellipsis;
    color: #000000e0;
    font-size: 34rpx;
    font-weight: 500;
  }
}

.student {
  position: relative;
  display: flex;
  align-items: center;

  .student_info {
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    /* #ifdef MP-WEIXIN*/
    max-width: 380rpx;
    /* #endif */
    /* #ifdef APP-PLUS || H5 */
    max-width: 450rpx;
    /* #endif */
    .student_info_title {
      display: flex;
      align-items: center;

      .student_info_title_relationship {
        color: #000000e0;
        font-size: 34rpx;
        height: 48rpx;
        line-height: 48rpx;
        font-weight: 500;
        @include ellipsis;
      }
    }

    .student_info_subTitle {
      color: #00000073;
      font-size: 24rpx;
      height: 32rpx;
      line-height: 32rpx;
      @include ellipsis;
    }
  }
}

.popup-head {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  background-color: white;
  z-index: 3;
  .popup-title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    font-size: 34rpx;
    font-weight: 500;
  }
}
</style>
