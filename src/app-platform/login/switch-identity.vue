<template>
  <page custom-overflow="hidden">
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
    <view class="content">
      <view
        style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          box-shadow: 0px 2px 4px 0px #00000014;
          height: 1rpx;
          z-index: 2;
        "
      ></view>
      <scroll-view class="scroll-view" scroll-y style="width: 100%; height: 100%">
        <view class="scroll-content">
          <view v-if="recentlyLoginOrganization" @click="recentlyLoginAction">
            <view class="recently-content">
              <view class="name"> {{ recentlyLoginOrganization.showName }}</view>
              <view class="tag">上次登录</view>
            </view>
            <view class="u-m-l-32 line"></view>
          </view>
          <switch-identity-list
            ref="switchIdentityListRef"
            :is-show-last-line="false"
            :is-show-pre-login="true"
            :locations="locations"
            :keyword="keyword"
            @switchIdentityAction="switchIdentityAction"
          ></switch-identity-list>
          <view v-if="keyword.length > 0 && !locations?.length" style="height: 500rpx">
            <u-empty-custom card text="暂无数据" :margin-top="0" />
          </view>
        </view>
        <view v-if="!isHaveSafeBottom" :style="{ height: '32rpx' }"></view>
        <view :class="['u-fixed-placeholder', 'safe-area-inset-bottom']"> </view>
      </scroll-view>
    </view>
  </page>
</template>

<script lang="ts">
import { wxMessage } from '@/pages/message/utils/msg-go';
import switchIdentityList from '@/pages/workbench/components/switch-identity-list.vue';
import { searchLocations } from '@/pages/workbench/utils/search-location';
import { IOrganization, IOrganizationInfo, loginStore } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { getLinkParams } from '@/utils/handle-share-link';
import { EUserType } from '@/utils/kind';
import { omit } from '@/utils/lodash-es';
import { msgPathReplace } from '@/utils/msg-path-replace';
import {
  getPageParams,
  hideLoading,
  setPageParams,
  setUrlStartWithSlash,
  showInfo,
} from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { computed, defineComponent, ref, toRefs } from 'vue';

export default defineComponent({
  components: {
    switchIdentityList,
  },
  setup() {
    const keyword = ref('');
    const searchOrganizationList = ref<IOrganization[]>();
    // 获取主题色
    const primaryColor = getPrimaryColor();
    const store = loginStore();
    const { organizationList } = toRefs(store);
    const switchIdentityListRef = ref();

    const recentlyLoginOrganization: any = computed(() => {
      let recentlyLoginOrganizationInfo: IOrganizationInfo;
      let userType = -1;
      const locations = organizationList.value?.locations || [];
      for (const value of locations) {
        const info = store.findRecentlyLoginOrganizationInfo(value.locations);
        if (info) {
          recentlyLoginOrganizationInfo = info;
          userType = value.userType;
          break;
        }
      }

      if (userType === -1) {
        return null;
      }

      const identity =
        userType === EUserType.guardian
          ? '家长'
          : userType === EUserType.student
          ? '学生'
          : '教育工作者';
      let childName = '';
      if (userType === EUserType.guardian) {
        childName = ` - ${recentlyLoginOrganizationInfo.childName ?? ''}`;
      }
      return {
        organization: recentlyLoginOrganizationInfo,
        userType,
        showName: `${recentlyLoginOrganizationInfo.name ?? ''}${childName ?? ''}(${identity})`,
      };
    });

    const urlParams = ref<any>({});
    const isHaveSafeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom > 0;
    const switchIdentityAction = (updateOK: boolean, userType: number, refresh: boolean) => {
      console.log('updateOK', updateOK, userType, refresh);
      if (updateOK) {
        console.log('组织切换成功', updateOK);
        checkMsg();
      }
    };

    const checkMsg = async () => {
      // 有重定向地址，优先跳转
      let redirectUrl = '';

      if (urlParams.value?.redirect) {
        redirectUrl = setUrlStartWithSlash(
          `${urlParams.value.redirect}${setPageParams(omit(urlParams.value, 'redirect'), '?')}`,
        );
      }
      console.log('wx-login-redirectUrl-org: ' + urlParams.value?.redirect);
      console.log('wx-login-redirectUrl-slash: ' + redirectUrl);
      // 兼容旧消息
      redirectUrl = msgPathReplace(redirectUrl, urlParams);
      console.log('wx-login-redirectUrl-new: ' + redirectUrl);
      const params = getPageParams();
      const redirect = params?.redirect ? decodeURIComponent(params?.redirect) : '';
      console.log('wx-login-redirect: ' + redirect);
      if (redirect && !redirect.includes('/app-platform/login/authorization-wx')) {
        console.log('urlParams.value : ' + JSON.stringify(urlParams.value));
        const locationId = urlParams.value['locationId'];
        let userType = urlParams.value['userType'];
        const userId = urlParams.value['userId'];
        console.log(
          'locationId : ' + locationId + ', userType : ' + userType + ', userId = ' + userId,
        );
        console.log('userId : ' + userId + ', current userId : ' + store.userInfo?.userId);
        // 先用userId判断当前用户身份，如果userId是空的就是非法
        if (!userId) {
          hideLoading();
          goWorkbench();
          setTimeout(() => {
            showInfo('该消息不符合条件');
          }, 500);
          return;
        }

        wxMessage(
          userId,
          userType,
          locationId,
          redirectUrl,
          () => {
            goWorkbench();
          },
          () => {
            goWorkbench();
          },
        );
      } else {
        goWorkbench();
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

    const locations = computed(() => {
      return keyword.value.length > 0
        ? searchOrganizationList.value
        : organizationList.value?.locations;
    });

    const recentlyLoginAction = () => {
      switchIdentityListRef.value.selectIdentityAction(
        recentlyLoginOrganization.value.userType,
        recentlyLoginOrganization.value.organization,
      );
    };

    const goWorkbench = () => {
      const params = getLinkParams();
      uni.reLaunch({
        url: `/pages/workbench/index${params}`,
        success: () => {},
        fail: (err: any) => {
          console.log('切换身份失败', err);
          if (!err.includes('locked')) {
            showInfo('切换身份失败');
          }
          uni.hideLoading();
        },
      });
    };

    onLoad(options => {
      console.log(
        '...... > file: switch-identify.vue:330 > onLoad > options:' + JSON.stringify(options),
      );
      urlParams.value = options;
    });

    return {
      switchIdentityAction,
      isHaveSafeBottom,
      keyword,
      changeAction,
      clearAction,
      primaryColor,
      locations,
      recentlyLoginOrganization,
      switchIdentityListRef,
      recentlyLoginAction,
    };
  },
});
</script>

<style lang="scss" scoped>
.scroll-content {
  overflow: hidden;
  border-radius: 16rpx;
  background: white;
  margin-top: 24rpx;
}

.content {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--window-top) - 112rpx);
  padding: 0 32rpx 0;
}

.recently-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 32rpx;
  font-size: 28rpx;
  line-height: 54rpx;
  color: $u-content-color;

  .name {
    flex: 1;
    color: #000000e0;
    font-size: 34rpx;
  }

  .tag {
    margin-left: 8rpx;
    width: 136rpx;
    height: 48rpx;
    line-height: 48rpx;
    border-radius: 8rpx;
    font-size: 26rpx;
    text-align: center;
    color: #52c41a;
    background: #f6ffed;
  }
}

.line {
  background-color: $u-border-color;
  height: 1rpx;
}

.scroll-view ::-webkit-scrollbar {
  display: none;
}
</style>
