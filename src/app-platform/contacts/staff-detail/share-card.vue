<template>
  <u-popup
    v-model="show"
    mode="bottom"
    :border-radius="16"
    :mask-close-able="true"
    @close="onClose"
  >
    <view class="title">分享联系人</view>
    <view class="share-content">
      <!-- #ifdef APP-PLUS || H5-->
      <view class="share-item">
        <view>
          <view class="arrow-down" @click="handleDownload">
            <u-image width="48" height="48" :src="icon_arrow_down" />
          </view>
          <view class="share-text">下载到手机</view>
        </view>
      </view>
      <!-- #endif -->
      <view class="share-item" @click="handleShareWX">
        <view>
          <u-image width="80" height="80" :src="icon_wechat" />
          <view class="share-text">微信</view>
        </view>
      </view>
      <!-- <view class="share-item">
        <view>
          <u-image width="80" height="80" :src="icon_qq" />
          <view class="share-text">QQ</view>
        </view>
      </view>
      <view class="share-item">
        <view>
          <u-image width="80" height="80" :src="icon_dd" />
          <view class="share-text">钉钉</view>
        </view>
      </view> -->
    </view>
  </u-popup>

  <view class="share-canvas-wrapper" :style="`top: ${show ? '182rpx' : ''}`">
    <canvas id="shareCanvas" canvas-id="shareCanvas" class="share-canvas" />
  </view>
</template>
<script lang="ts" setup>
import pic_code from '@/app-platform/static/contacts/code.png';
import icon_arrow_down from '@/app-platform/static/contacts/icon_arrow_down.png';
import icon_wechat from '@/app-platform/static/contacts/icon_wechat.png';
import share_card_bg from '@/app-platform/static/contacts/share_card_bg.jpg';
import { StaffUserInfoState } from '@/services/contact';
import { getFileInfo, getUploadUrl, updateUploadResult, uploadFile } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { Server_Asset_Prefix } from '@/utils/constant';
import { EUserIdentityType, createSharePath } from '@/utils/handle-share-link';
import { showInfo } from '@/utils/tools';
import { computed, onMounted, reactive, ref, type PropType } from 'vue';
import icon_avatar from '/static/avatar.png';
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  tel: {
    type: String,
    default: '',
  },
  iconAvatar: {
    type: String,
    default: '',
  },
  userInfo: {
    type: Object as PropType<StaffUserInfoState>,
    default: () => {},
  },
  genderIcon: {
    type: String,
    default: '',
  },
});
const show = computed(() => props.isShow);
const shareInfo = reactive({
  canvasContext: null as any,
  canvasWidth: 0,
  canvasBgHeight: 0,
  textAreaHeight: 0,
  shareImageUrl: '',
  moreTop: 0,
});
const defaultAvatar = ref(icon_avatar);
const store = loginStore();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const onClose = () => {
  emit('close');
};
// 上传图片
const handleUploadFile = async () => {
  if (shareInfo.shareImageUrl) {
    const currentFilePath = shareInfo.shareImageUrl;
    const fileName = currentFilePath.split('/').pop() || '';
    console.log('===fileName', fileName);
    const requestParams: any = {
      locationId: store.userInfo?.locationId,
      fileType: currentFilePath.split('.').pop() || '',
      bucketType: 'public',
    };
    const getUploadUrlData = await getUploadUrl(requestParams);
    console.log('====uploadUrlData', getUploadUrlData);
    const uploadResponse: any = await callBridge({
      service: Service.file,
      action: Action.fileUpload,
      data: {
        uploadUrl: getUploadUrlData.uploadUrl,
        header: getUploadUrlData.header,
        filePath: currentFilePath,
        fileType: getUploadUrlData.fileType,
      },
    });
    console.log('===uploadResponse', uploadResponse);
    if (uploadResponse.status == 1) {
      const updateResult = await updateUploadResult(
        getUploadUrlData.fileId,
        uploadResponse.status,
        fileName,
      );
      if (updateResult) {
        const fileInfo = await getFileInfo(getUploadUrlData.fileId);
        return fileInfo;
      }
    }
  }
  return null;
};
//下载到手机
const handleDownload = async () => {
  const fileInfo = await handleUploadFile();
  if (fileInfo !== null) {
    callBridge({
      service: Service.file,
      action: Action.fileDownloadAndOpen,
      data: {
        filePath: fileInfo.fullUrl,
        fileType: fileInfo.fileType,
      },
    }).catch(() => {
      showInfo(`不支持该功能！`);
    });
  }
};

onMounted(async () => {
  console.log('==initShareCanvas');
  const context = uni.createCanvasContext('shareCanvas');
  const query = uni.createSelectorQuery();
  query
    .select('#shareCanvas')
    .boundingClientRect((res: any) => {
      console.log('===res', res);
      shareInfo.canvasWidth = 355; // 将upx单位转换为px，假设设计稿宽度为750rpx
      shareInfo.canvasBgHeight = 457;
      context.setFillStyle('white'); // 设置背景颜色为白色，可以替换为其他颜色
      context.fillRect(0, 0, 355, 457);
      context.drawImage(share_card_bg, 0, 0, 355, 309); // 绘制SVG图片
      context.shadowColor = 'rgba(0, 0, 0, 0.2)';
      context.shadowBlur = 20;
      context.fillRect(16, 55, 323, 229);
      context.drawImage(pic_code, 136, 330, 88, 88);
      context.save();
      shareInfo.canvasContext = context;
    })
    .exec();
  console.log('==initShareCanvas', shareInfo.canvasContext);
  setTimeout(() => {
    _setShareImg();
  }, 500);
});
// 绘制分享的canvas
function transformContentToMultiLineText(
  ctx: any,
  text: string,
  contentWidth: number,
  lineNumber: number,
) {
  let textArray = text.split(''); // 分割成字符串数组
  let temp = '';
  let row = [];

  for (let i = 0; i < textArray.length; i++) {
    if (ctx.measureText(temp).width < contentWidth) {
      temp += textArray[i];
    } else {
      i--; // 这里添加i--是为了防止字符丢失
      row.push(temp);
      temp = '';
    }
  }
  row.push(temp);

  // 如果数组长度大于2，则截取前两个
  if (row.length > lineNumber) {
    let rowCut = row.slice(0, lineNumber);
    let rowPart = rowCut[lineNumber - 1];
    let test = '';
    for (let a = 0; a < rowPart.length; a++) {
      if (ctx.measureText(test + '...').width < contentWidth) {
        test += rowPart[a];
      } else {
        break;
      }
    }
    let group = test + '...';
    rowCut.splice(lineNumber - 1, 1, group);
    row = rowCut;
  }
  return row;
}
async function _setShareImg() {
  if (!shareInfo.canvasContext) {
    setTimeout(() => {
      _setShareImg();
    }, 200);
    return;
  }
  console.log('APP-PLUS 图片绘制 start');
  const { locationName, pluralismDeptStr, position, deptStr, gender } = props.userInfo;
  const context = shareInfo.canvasContext;
  context.shadowColor = 'transparent';
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(0, 0, 0, 0.65)'; // 设置文案颜色
  context.font = '15px PingFang SC'; // 设置文案字体和大小
  context.fillText('单位', 32, 140, 60);
  context.fillText('主职部门', 32, 165, 60);
  context.fillText('兼职部门', 32, 190, 60);
  context.fillText('职位', 32, 215, 60);
  context.fillText('手机号', 32, 240, 60);
  context.fillText('来自麦塔校园', 134, 435);
  context.save();
  context.fillStyle = 'rgba(0, 0, 0, 0.88)'; // 设置文案颜色
  context.font = '15px PingFang SC'; // 设置文案字体和大小
  const lines = transformContentToMultiLineText(context, locationName || '/', 221, 1);
  lines.forEach((txt: any) => {
    context.fillText(txt, 104, 140, 221);
  });
  const deptStrLines = transformContentToMultiLineText(context, deptStr || '/', 221, 1);
  deptStrLines.forEach((txt: any) => {
    context.fillText(txt, 104, 165, 221);
  });
  const pluralismLines = transformContentToMultiLineText(context, pluralismDeptStr || '/', 221, 1);
  pluralismLines.forEach((txt: any) => {
    context.fillText(txt, 104, 190, 221);
  });
  const positionLines = transformContentToMultiLineText(context, position || '/', 221, 1);
  positionLines.forEach((txt: any) => {
    context.fillText(txt, 104, 215, 221);
  });
  context.fillText(props.tel, 104, 240, 251);
  context.save();
  context.fillStyle = 'rgba(0, 0, 0, 0.88)'; // 设置文案颜色
  context.font = '500 17px PingFang SC';
  context.textAlign = 'center';
  context.fillText(props.userInfo.name, 175, 110, 200);
  context.save();
  console.log('APP-PLUS 图片绘制 start 2');
  context.beginPath();
  context.shadowColor = 'rgba(0, 0, 0, 0.2)';
  context.shadowBlur = 20;
  context.arc(177, 51, 30, 0, 2 * Math.PI);
  context.fillStyle = '#fff'; //设置填充颜色
  context.fill(); //开始填充
  context.save();
  context.arc(177, 52, 29, 0, 2 * Math.PI);
  context.clip();
  context.restore();
  console.log('APP-PLUS 图片绘制 start 3');
  if (props.iconAvatar) {
    await new Promise(resolve => {
      try {
        console.log('APP-PLUS 图片绘制 start 4', props.iconAvatar);
        // 在微信小程序上 downloadFile 合法域名 添加了 https://test2impfile.lexikos.com
        uni.getImageInfo({
          src: props.iconAvatar,
          success: res => {
            // 绘制圆形头像
            context.drawImage(res.path, 148, 22, 60, 60);
            console.log('APP-PLUS 图片绘制 start 5', res.path);
            resolve(res.path);
          },
          fail: (error: any) => {
            console.log('APP-PLUS 图片绘制 5 error', error);
            resolve(true);
            context.drawImage(defaultAvatar.value, 148, 22, 60, 60);
          },
        });
      } catch (error) {
        console.log('APP-PLUS 图片绘制 start 4 error', error);
        resolve(true);
        context.drawImage(defaultAvatar.value, 148, 22, 60, 60);
      }
    });
  } else {
    console.log('APP-PLUS 图片绘制默认头像', defaultAvatar.value);
    context.drawImage(defaultAvatar.value, 146, 21, 62, 62);
  }
  context.save();
  if (gender) {
    context.beginPath();
    context.setFillStyle('white');
    context.arc(195, 72, 10, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.drawImage(props.genderIcon, 187, 64, 16, 16);
    context.save();
  }
  console.log('APP-PLUS 图片绘制 end---');
  // todo: 小程序上逻辑未走通
  context.draw(false, () => {
    uni.canvasToTempFilePath({
      fileType: 'jpg',
      canvasId: 'shareCanvas', // canvas 的 id
      success: (res2: any) => {
        console.log('APP-PLUS 读取图片 tempFilePath', res2);
        uni.getImageInfo({
          src: res2.tempFilePath,
          success: res3 => {
            console.log('APP-PLUS 图片地址转换', res3);
            if (res3.path) {
              shareInfo.shareImageUrl = res3.path;
              console.log('APP-PLUS 图片地址', shareInfo.shareImageUrl);
            } else {
              console.log('APP-PLUS 图片地址转换 error', res3);
            }
          },
          fail: (error: any) => {
            console.log('APP-PLUS 图片地址转换 error 2', error);
          },
          complete: (res: any) => {
            console.log('APP-PLUS 图片地址转换 completed', res);
          },
        });
      },
    });
  });
}
// #ifdef MP-WEIXIN
import { onShareAppMessage } from '@dcloudio/uni-app';

onShareAppMessage(async (res: any) => {
  console.log('onShareAppMessage', res);
  const params = `fillReportId=12312&isFromShare=1`;
  let imageUrl = `${Server_Asset_Prefix}img_invite.png`;
  const title = '';
  const timestamp = new Date().getTime();
  let fileId = '';
  if (shareInfo.shareImageUrl) {
    await new Promise((resolve, reject) => {
      uploadFile(
        {
          path: shareInfo.shareImageUrl,
          extname: 'jpg',
        },
        shareInfo.shareImageUrl,
        {
          showLoading: true,
          useCompressUrl: false,
          isPublic: true,
          anon: false,
          isThumbnailUrl: false,
          isFollowCloudEdge: false,
          isFormDataReq: false,
        },
      )
        .then((res: any) => {
          fileId = res.fileId;
          resolve(true);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
  if (fileId) {
    const updateResult = await updateUploadResult(fileId, 1, Date.now().toString() + '.jpg');
    if (updateResult) {
      const fileInfo = await getFileInfo(fileId);
      imageUrl = fileInfo.fullUrl;
    }
  }
  const path = `/app-school-affairs/fill-report/detail/index?${params}&timestamp=${timestamp}`;
  return {
    title,
    path: createSharePath(
      path,
      'zntb,zntbOffice',
      EUserIdentityType.teacher | EUserIdentityType.guardian | EUserIdentityType.student,
    ),
    imageUrl,
  };
});
// #endif

import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';

// const VITE_SERVER_ENV = import.meta.env.VITE_SERVER_ENV;
async function handleShareWX() {
  // #ifdef APP-PLUS
  // 检查是否安装了微信
  if (!plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })) {
    showInfo('您的手机尚未安装微信');
    return;
  }
  const appid = plus.runtime.appid;
  if (!appid) {
    showInfo('找不到appid');
    return;
  }
  // #endif
  let shareImageUrl = `${Server_Asset_Prefix}img_invite.png`;
  console.log('APP-PLUS 分享图片默认地址', shareImageUrl);
  console.log('APP-PLUS 分享图片地址', shareInfo.shareImageUrl);
  const fileInfo = await handleUploadFile();
  if (fileInfo !== null) {
    shareImageUrl = fileInfo.fullUrl;
  }
  const opt: UniApp.ShareOptions = {
    provider: 'weixin',
    type: 2,
    imageUrl: shareImageUrl,
    scene: 'WXSceneSession',
    success(result) {
      console.log(
        '🚀 ~ file: class-files.vue ~ line 215 ~ success ~ result' + JSON.stringify(result),
      );
    },
    fail(e) {
      console.log('🚀 ~ file: class-files.vue ~ line 218 ~ fail ~ e' + JSON.stringify(e));
    },
  };
  // #ifdef APP-PLUS
  uni.share(opt);
  // #endif
}
</script>
<style lang="scss" scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  color: #000000e0;
  font-size: 34rpx;
  font-weight: 500;
}
.share-content {
  display: flex;
  // justify-content: space-around;
  align-items: center;
  padding-bottom: 68rpx;
}
.share-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 184rpx;
  height: 184rpx;
}
.share-text {
  margin-top: 16rpx;
  text-align: center;
  color: #000000e0;
  font-size: 24rpx;
}
.share-canvas-wrapper {
  position: absolute;
  top: -100000rpx;
  // top: 200rpx;
  left: 50%;
  margin-left: -178px;
  width: 355px;
  height: 457px;
  overflow: hidden;
  z-index: 99999;
}
.share-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}
.arrow-down {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80rpx;
  height: 80rpx;
  margin: 0 auto;
}
</style>
