<template>
  <page>
    <view class="content-head" @click="updatePhoto(false)">
      <image
        class="avatar-size"
        :src="
          userInfo?.headImageUrl
            ? userInfo?.headImageUrl.includes('?')
              ? userInfo?.headImageUrl
              : `${userInfo?.headImageUrl}?v1`
            : icon_avatar
        "
        mode="aspectFill"
      />
      <image class="edit" :src="icon_avatar_edit" />
    </view>
    <view
      style="
        border-radius: 16rpx;
        margin: 15rpx 32rpx;
        box-shadow: 0px 2rpx 4rpx 0px rgba(61, 39, 39, 0.04);
        background-color: white;
        overflow: hidden;
      "
    >
      <view class="group-top">
        <text class="group-top-font">姓名</text>
        <text class="group-top-right-font"> {{ userInfo?.name }}</text>
      </view>
      <view class="line" />
      <view class="group-top">
        <text class="group-top-font">手机号</text>
        <text class="group-top-right-font">{{ hidePhoneNum }}</text>
      </view>
      <view v-if="store.currentUserType == EUserType.teacher">
        <view class="line" />
        <view class="group-top">
          <text class="group-top-font">职位</text>
          <text class="group-top-right-font">{{
            userInfo?.position ? userInfo?.position : '/'
          }}</text>
        </view>
      </view>
    </view>
    <view
      style="
        border-radius: 16rpx;
        margin: 24rpx 32rpx;
        box-shadow: 0px 2rpx 4rpx 0px rgba(0, 0, 0, 0.04);
        background-color: white;
        overflow: hidden;
      "
    >
      <view class="group-top-face">
        <view class="group-top-face-label">
          <text class="group-top-title-font">人脸凭证照片</text>
          <view style="margin-left: 4rpx" @click="handleEye">
            <u-icon
              class="person-eye-wrap"
              :name="eyeToggle ? 'eye' : 'eye-off'"
              color="#000000E0"
              size="32"
            ></u-icon>
          </view>
        </view>
        <u-image
          class="file-plus-size"
          :src="
            imgList.array.length > 0
              ? eyeToggle
                ? imgList.array[0].url
                : icon_faceholder
              : icon_file_plus
          "
          width="144"
          height="144"
          border-radius="16"
          mode="aspectFill"
          @click="updatePhoto(true)"
        >
          <template #error>
            <u-icon name="photo" width="144" height="144" />
          </template>
        </u-image>
      </view>
    </view>

    <button class="logout-button" hover-class="checkActive" @click="logoutDialog">退出登录</button>
    <button
      v-if="isReviewAccount"
      class="logout-button u-m-t-24"
      hover-class="checkActive"
      @click="closeAccountDialog"
    >
      注销
    </button>
  </page>
</template>

<script lang="ts" setup>
import useCaptchaAuth from '@/app-platform/contacts/add-student/use-captcha-auth';
import { cancelAccountApi, logoutApi } from '@/app-platform/services/login';
import icon_faceholder from '@/app-platform/static/contacts/face-placeholder.svg';
import { requestAllChooseImagePer } from '@/services/permissionRequest';
import { loginStore } from '@/store/modules/login';
import { updateLoginInfoCache } from '@/utils/cache-app';
import { appleReviewAccont } from '@/utils/constant';
import { EUserType } from '@/utils/kind';
import { logout } from '@/utils/logout';
import { cid_key, clientId_key } from '@/utils/storage-keys';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { batchUploadChoosedImages } from '@/utils/upload-medias';
import { onBeforeMount, reactive, ref, toRefs } from 'vue';
import {
  IGetVoucherRtn,
  fileStreamBase64,
  getVoucher,
  imgDetect,
  saveVoucher,
  updateUserHead,
} from '../services/mine';
import icon_avatar_edit from '../static/mine/icon_avatar_edit.svg';
import icon_file_plus from '../static/mine/icon_file_plus.svg';
import icon_avatar from '/static/avatar.png';
export interface IImageModel {
  fileId: string;
  url: string;
  tmpUrl: string;
}

// store
const store = loginStore();
const { userInfo } = toRefs(store);

// 上传照片
const imgList = reactive({ array: [] as IImageModel[] });
const certificateInfo = reactive({} as IGetVoucherRtn);

// 获取家长凭证信息
const initCertificate = async () => {
  const locationId = userInfo?.value?.locationId || '';
  const personId = userInfo?.value?.personId;
  updatePhoneNum();
  let personType = 0;
  switch (store.currentUserType) {
    case EUserType.teacher:
      personType = 0;
      break;
    case EUserType.guardian:
      personType = 2;
      break;
    case EUserType.student:
      personType = 1;
      break;
  }
  const res: IGetVoucherRtn = await getVoucher({
    locationId,
    personType: personType,
    personId,
  });
  console.log('getVoucher : ', res);
  Object.assign(certificateInfo, res);
  let imgs: IImageModel[] = [];
  if (res.faces?.length > 0) {
    const { imgId, imgUrl } = res.faces[0];
    const base64Url = await fileStreamBase64(imgId);
    imgs = [{ fileId: imgId, url: base64Url, tmpUrl: imgUrl || '' }];
  }
  imgList.array = imgs;
  console.log('res.faces : ' + JSON.stringify(res.faces));
  console.log('imgList.array[0].url : ' + (imgList.array[0]?.url ?? ''));
};

const get_extname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

const updatePhoto = async (isCertifi: boolean) => {
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllChooseImagePer(
      res => {
        // 已有权限
        console.log('permissionRequestResult : ' + JSON.stringify(res));
        chooseImg(isCertifi);
      },
      err => {
        // 无权限
        console.log('permissionRequestFail : ' + JSON.stringify(err));
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    chooseImg(isCertifi);
  }
};

const chooseImg = (isCertifi: boolean) => {
  uni.chooseImage({
    sourceType: ['camera', 'album'],
    sizeType: ['original', 'compressed'],
    count: 1,
    extension: ['jpg', 'png'],
    async success(res: any) {
      const images: any[] = res.tempFiles.map((file: any) => ({
        url: file.path,
        name: file.name,
        size: file.size,
        extname: file.name ? file.name.split('.').pop() : get_extname(file.path),
      }));
      console.log('imgs : ', JSON.stringify(images));
      // 过滤尺寸（最大5M）
      const MAX_SIZE = 5 * 1024 * 1024;
      const filter = images.filter(item => item.size <= MAX_SIZE);
      if (filter.length < images.length) {
        uni.showToast({
          title: '此图片超过了5M, 请更换',
        });
      }
      console.log('filter-imgs : ', JSON.stringify(filter));
      const uploadRes: any[] = await batchUploadChoosedImages(
        filter,
        false,
        isCertifi,
        false,
        false,
        false,
        false,
      );
      console.log('uploadRes : ', uploadRes);
      if (uploadRes.length > 0) {
        const { fileId, url } = uploadRes[0];
        if (isCertifi) {
          // 校验图片质量
          showLoading('校验中');
          const qualityRes: any = await imgDetect({
            imgId: fileId,
            imgUrl: url,
            locationId: userInfo?.value?.locationId || '',
          });
          console.log('qualityRes : ', qualityRes);
          hideLoading();
          if (qualityRes && qualityRes.pass === 0) {
            showInfo('人脸照片质量过低, 请重新上传');
          } else {
            const base64Url = await fileStreamBase64(fileId);
            uploadRes[0].tmpUrl = url;
            uploadRes[0].url = base64Url;
            imgList.array = uploadRes;
            certificateInfo.modifyMy = '1';
            if (imgList.array.length > 0) {
              const file = imgList.array[0];
              certificateInfo.faces = [
                { fileId: file.fileId, imgId: file.fileId, imgUrl: file.tmpUrl },
              ];
            } else {
              certificateInfo.faces = [];
            }
            const saveVoucherRes: any = await saveVoucher(certificateInfo as any);
            console.log('saveVoucherRes : ', saveVoucherRes);
          }
        } else {
          console.log('图片上传成功');
          store.$patch({
            userInfo: {
              headImageUrl: url,
            },
          });
          console.log('headImageUrl : ' + store.userInfo?.headImageUrl);
          try {
            // 保存人员头像
            const updateUserHeadRes: any = await updateUserHead(fileId);
            // 没给返回结果？？？
            console.log('updateUserHeadRes : ' + updateUserHeadRes);
            updateLoginInfoCache();
          } catch (err) {
            console.log('updateUserHeadRes err : ' + JSON.stringify(err));
          }
        }
      }
    },
    fail: (res: any) => {
      console.log('chooseImageFaild: ' + JSON.stringify(res));
      const { code, errMsg } = res;
      console.log('code: ' + code + ', errMsg: ' + errMsg);
    },
  });
};

const logoutDialog = async () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {
        console.log('退出登录了');
        logoutHandle();
      }
    },
  });
};

const logoutHandle = async () => {
  try {
    const clientId = uni.getStorageSync(clientId_key);
    const cid = uni.getStorageSync(cid_key) || '';
    logoutApi(clientId, cid);
  } catch (e) {
    // 不需要处理
  }
  logout({ showPrompt: false });
};

const closeAccountDialog = async () => {
  uni.showModal({
    title: '注销账号',
    content: `确定要注销当前账号吗？`,
    confirmText: '确定',
    cancelText: '取消',
    success: function (res) {
      if (res.confirm) {
        console.log('退出登录了');
        closeAccountHandle();
      }
    },
  });
};

const closeAccountHandle = async () => {
  try {
    await cancelAccountApi();
    logout({ showPrompt: true, prompt: '注销账号成功' });
  } catch (e) {}
};

onBeforeMount(() => {
  initCertificate();
});

/**
 * 是否有隐私权限
 */
const [initPrivacyFlag] = useCaptchaAuth(true);
//控制眼睛图标展示效果 false:不可见 true:可见
const eyeToggle = ref(false);
const hidePhoneNum = ref('');
/**
 * 获取用户手机号
 */
const updatePhoneNum = () => {
  var tempPhone = userInfo?.value?.phone || userInfo?.value?.tel;
  if (!tempPhone) {
    hidePhoneNum.value = '/';
  } else {
    tempPhone = tempPhone + '';
    hidePhoneNum.value = maskNumber(tempPhone);
  }
};

/**
 * 审核特殊处理
 */
const isReviewAccount = (userInfo?.value?.phone || userInfo?.value?.tel) === appleReviewAccont;

/**
 * 对手机号进行隐藏
 * @param numberStr
 */
const maskNumber = numberStr => {
  // 检查数字长度是否在11位以内
  if (numberStr.length > 11) {
    console.error('手机号不足11位，已原样返回');
    return numberStr;
  }
  // 使用正则表达式将中间的四位数字替换为*
  return numberStr.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
/**
 * 控制照片是否可见
 */
const handleEye = () => {
  eyeToggle.value = !eyeToggle.value;
};
</script>

<style lang="scss" scoped>
.content-head {
  margin-top: 24rpx;
  position: relative;
  text-align: center;
}
.edit {
  width: 48rpx;
  height: 48rpx;
  bottom: 0rpx;
  left: 51%;
  position: absolute;
}
.file-plus-size {
  width: 144rpx;
  height: 144rpx;
  border-radius: 16rpx 16rpx;
}
.avatar-size {
  width: 112rpx;
  height: 112rpx;
  border: 4rpx solid white;
  border-radius: 50%;
}
.between-size {
  width: 10rpx;
}
.content-column {
  flex-direction: column;
}
.content-row {
  flex-direction: row;
}
.content-flex {
  display: flex;
  flex-direction: row;
}
.group-top {
  align-items: center;
  padding: 24rpx 36rpx;
  @extend .content-flex;
  @extend .content-column;
}
.group-top-font {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  flex: 1 1 0%;
}
.group-top-right-font {
  color: #000000a6;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
}
.group-top-face {
  align-items: center;
  padding: 32rpx;
  @extend .content-flex;
  @extend .content-column;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.group-top-face-label {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.group-top-face-item {
  align-items: center;
  padding: 0 32rpx 32rpx 32rpx;
  @extend .content-flex;
  @extend .content-column;
}
.group-top-face-item-between {
  align-items: center;
  @extend .content-flex;
  @extend .content-column;
}
.group-top-title-font {
  color: #000000e0;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 48rpx;
  flex: 1 1 0%;
}
.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  margin-left: 32rpx;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}
/* 竖向百分百按钮 */
.logout-button {
  border-radius: 16rpx;
  margin: 0 32rpx;
  color: #ff4d4f;
  background-color: white;
  font-size: 34rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 96rpx;
  /* 设置阴影 */
  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.02);
  border-color: transparent;
}
button::after {
  border: none;
}
.checkActive {
  color: #ff4d4f;
  background-color: white;
}

.person-eye-wrap {
  padding: 8rpx;
}
</style>
