<template>
  <page>
    <view class="image-wrapper">
      <image class="invite-img" :src="Server_Asset_Prefix + 'icon_invitation.png'" />
    </view>
    <button class="invite-button" open-type="share" @getphonenumber="_onGetphonenumber">
      邀请家长
    </button>
    <u-button v-show="false" type="primary" @click="navigationTo">点击跳转</u-button>
  </page>
</template>
<script lang="ts">
import { inviteStore } from '@/store/modules/invite';
import { Server_Asset_Prefix } from '@/utils/constant';
import { queryURL } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';

export default {
  onShareAppMessage() {
    const store = inviteStore();
    const { title, params } = store.inviteParams;
    console.log('title---------', title);
    console.log('params--------', params);
    const timestamp = new Date().getTime();

    // 注意 inviteType为1已失效, 删除了

    /** inviteType: 2-打卡, 3-邀请家长 */
    let realParams = params;
    let inviteType = queryURL('inviteType', params) || '';
    if (!inviteType) {
      inviteType = store.inviteParams.inviteType;
      realParams = `id=${store.inviteParams.id}&locationId=${store.inviteParams.locationId}&inviteType=3`;
    }
    const type = (['1', '2', '3'].includes(inviteType) ? inviteType : '1') as any;
    console.log('inviteType : ' + inviteType);
    console.log('type : ' + type);
    const imageObj = {
      '1': `${Server_Asset_Prefix}img_invite.png`,
      '2': `${Server_Asset_Prefix}img_transmit.jpg`,
    };
    const pathObj = {
      '2': `/app-preprimary-education/clock-in/guardian/detail/index?${realParams}&timestamp=${timestamp}`,
      '3': `/app-platform/contacts/register-form/index?${realParams}`,
    };
    console.log('path : ' + pathObj[type]);
    return {
      title,
      path: pathObj[type],
      imageUrl: imageObj[type],
    };
  },
  setup() {
    // store
    const store = inviteStore();
    let params = '';

    const navigationTo = () => {
      uni.navigateTo({
        url: `/app-platform/contacts/register-form/index?${params}`,
      });
    };

    onLoad(option => {
      console.log('option : ', option);
      params = option?.params;
      if (option?.inviteType === '2') {
        params = Object.keys(option)
          .map(key => `${key}=${option[key]}`)
          .join('&');
        console.log('inviteType=2', params);
      }
      store.setInviteParams({
        id: option?.id,
        inviteType: option?.inviteType,
        locationId: option?.locationId,
        params: params,
        title: option?.title,
      });
    });

    function _onGetphonenumber(e: any) {
      uni.$emit('getphonenumber', e);
    }

    return {
      _onGetphonenumber,
      Server_Asset_Prefix,
      navigationTo,
    };
  },
};
</script>
<style lang="scss" scoped>
.invite-button {
  margin-left: 32rpx;
  margin-right: 32rpx;
  justify-content: center;
  border-radius: 50rpx;
  font-size: 34rpx;
  background-color: $ui-color-primary;
  color: white;
}
.image-wrapper {
  width: 575rpx;
  height: 368rpx;
  margin: 88rpx auto;
  .invite-img {
    height: 100%;
    width: 100%;
  }
}
</style>
