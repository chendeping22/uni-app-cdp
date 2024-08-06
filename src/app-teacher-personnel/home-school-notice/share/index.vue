<template>
  <page>
    <view class="share-wrap">
      <view class="share-wrap-inner">
        <image :src="shareBg" mode="widthFix" style="width: 100%" />
        <view class="text">通知内容已生成</view>
        <!-- #ifdef MP-WEIXIN -->
        <button class="share-button" open-type="share">
          <view class="share-button-text">发至微信</view>
        </button>
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <button class="share-button" @click="handleShareWX">
          <view class="share-button-text">发至微信</view>
        </button>
        <!-- #endif -->
      </view>
    </view>
  </page>
</template>

<script setup lang="ts">
import shareBg from '@/app-teacher-personnel/static/home-school-notice/share_bg.jpg';
import { loginStore } from '@/store/modules/login';
import { Server_Asset_Prefix } from '@/utils/constant';
import { EUserIdentityType, createSharePath } from '@/utils/handle-share-link';
import { shareMiniProgramToWXSceneSession } from '@/utils/share';
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app';
import { ref } from 'vue';

const noticeId = ref('');

const title = '家长你好，有一条需要回执的通知，请注意查收';

const imageUrl = `${Server_Asset_Prefix}img_invite.png`;

onShareAppMessage(async (res: any) => {
  const { currentOrganization } = loginStore();
  const { childId } = currentOrganization || {};
  const path = `/subPackages/home-school-notice/detail/index?noticeId=${noticeId.value}&currentChildId=${childId}`;
  console.log('🚀ccc ~ 分享路径-wx', currentOrganization, path);
  return {
    title,
    path: createSharePath(
      path,
      'Home:School:Notice,Notification:Announcements,Notification:Announcements:Bureau',
      EUserIdentityType.teacher | EUserIdentityType.guardian | EUserIdentityType.student,
    ),
    imageUrl,
  };
});

// #ifdef APP-PLUS
async function handleShareWX() {
  const { currentOrganization } = loginStore();
  const { childId } = currentOrganization || {};
  const path = `/subPackages/home-school-notice/detail/index?noticeId=${noticeId.value}&currentChildId=${childId}`;
  console.log('🚀ccc ~ 分享路径-app', currentOrganization, path);
  shareMiniProgramToWXSceneSession({
    title,
    imageUrl,
    path: createSharePath(
      path,
      'Home:School:Notice,Notification:Announcements,Notification:Announcements:Bureau',
      EUserIdentityType.teacher | EUserIdentityType.guardian | EUserIdentityType.student,
    ),
  });
}
// #endif

onLoad(params => {
  noticeId.value = params.noticeId;
});
</script>

<style scoped lang="scss">
.share-wrap {
  padding: px2rpx(12) px2rpx(16);
  .share-wrap-inner {
    padding: px2rpx(24) px2rpx(16);
    border-radius: px2rpx(8);
    background-color: #fff;
    .text {
      text-align: center;
      margin: px2rpx(12) 0 px2rpx(24);
      @include body-regular;
    }
    .share-button {
      background-color: $color-primary;
      .share-button-text {
        color: #fff;
      }
    }
  }
}
</style>
