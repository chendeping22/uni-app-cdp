<script setup lang="ts">
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { getFileInfo, updateUploadResult } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType } from '@/store/modules/workbench';
import { goToApplication } from '@/utils/go-to-application';
import { getLowCodeHost, showInfo } from '@/utils/tools';
import { ref, unref, watch } from 'vue';
import { getUploadUrl } from './service';
import { defaultFileTypes, getFileIcon } from './utils';
// #ifdef MP-WEIXIN
import { weBtoa as btoa } from './weapp-jwt';
// #endif

const store = loginStore();
const { userInfo, authInfo } = store;

const props = withDefaults(
  defineProps<{
    maxCount?: number;
    maxSize?: number;
    defaultFileList?: any[];
    disabled?: boolean;
    buttonText?: string;
  }>(),
  {
    maxSize: 20,
    maxCount: 1,
    defaultFileList: () => [],
    disabled: false,
    buttonText: '上传材料',
  },
);

const emit = defineEmits<{
  (e: 'beforeUpload'): void;
  (e: 'uploadFinished'): void;
  (e: 'afterUpload', files: any): void;
}>();
// 上传照片
const fileList = ref<any[]>([]);

watch(
  () => props.defaultFileList,
  newVal => {
    if (newVal) {
      fileList.value = unref(newVal);
    }
  },
  { immediate: true },
);
const getExtname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

const beforeUpload = (fileSize: any) => {
  if (!fileSize) {
    return true;
  }
  const isRightSize = fileSize < props?.maxSize * 1024 * 1024;
  if (!isRightSize) {
    showInfo(`文件大小超过${props?.maxSize}M`);
    return false;
  }
  return true;
};
const doFileAdd = async () => {
  let file: any = null;
  let fileSize: any = null;
  let fileType: any = null;
  let filePath: any = null;
  let fileName: any = null;
  // #ifdef APP-PLUS
  file = await callBridge({
    service: Service.file,
    action: Action.filePicker,
    data: { fileFilter: '*/*' },
  }).catch((err: any) => {
    const { code, msg } = err;
    console.log('code : ' + code + ', msg : ' + msg);
    // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
    if (code === 201 && msg === '取消') {
      return;
    }
    showInfo('未选择文件');
  });
  if (file) {
    fileSize = file.fileLength;
    fileType = file.fileType;
    filePath = file.filePath;
    fileName = file.fileName;
  } else {
    return;
  }
  // #endif
  // #ifdef MP-WEIXIN || H5
  let chooseFile: any = null;
  if (uni.chooseFile) {
    chooseFile = uni.chooseFile;
  } else if (uni.chooseMessageFile) {
    chooseFile = uni.chooseMessageFile;
  }
  if (!chooseFile) {
    showInfo('未选择文件');
    return;
  }
  await new Promise((resolve, reject) => {
    chooseFile({
      count: 1,
      extension: defaultFileTypes.split(','),
      async success(res: any) {
        if (res.tempFiles && res.tempFiles[0]) {
          file = res.tempFiles[0];
          resolve(true);
        } else {
          reject();
        }
      },
      fail: async function (res: any) {
        const { code, errMsg } = res;
        console.log('code: ' + code + ', errMsg: ' + errMsg);
        reject(res);
      },
    });
  });
  if (file) {
    fileSize = file.size;
    fileType = file.name ? file.name.split('.').pop() : getExtname(file.path);
    filePath = file.path;
    fileName = file.name;
  } else {
    return;
  }
  // #endif
  const canUpload = beforeUpload(fileSize);
  if (!canUpload) {
    return;
  }
  emit('beforeUpload');
  uni.showLoading({
    mask: true,
  });
  const requestParams: any = {
    locationId: userInfo?.locationId,
    fileType: fileType,
    bucketType: 'public',
  };
  let getUploadUrlData: any = null;
  try {
    getUploadUrlData = await getUploadUrl(requestParams);
  } catch (error: any) {
    uni.hideLoading();
    if ((error?.data?.message).includes('fileService.fileType.is.limited')) {
      showInfo('文件格式不支持');
    } else {
      showInfo(error?.msg || error?.desc || error?.data?.message || '请求服务器失败');
    }
    return;
  }
  console.log(getUploadUrlData);
  if (!getUploadUrlData) {
    return;
  }
  try {
    // #ifdef APP-PLUS
    const { status }: any = await callBridge({
      service: Service.file,
      action: Action.fileUpload,
      data: {
        uploadUrl: getUploadUrlData.uploadUrl,
        header: getUploadUrlData.header,
        filePath,
        fileType: getUploadUrlData.fileType,
      },
      timeout: 1000 * 60 * 30,
    }).catch((err: any) => {
      const { code, msg } = err;
      console.log('code : ' + code + ', msg : ' + msg);
      // 取消选择文件 callBridge 返回的信息 code: 201, msg：'取消'
      if (code === 201 && msg === '取消') {
        return;
      }
      showInfo('上传失败');
      console.log('status : ' + status);
    });
    // #endif
    // #ifdef H5
    await new Promise((resolve, reject) => {
      uni.request({
        url: filePath,
        method: 'GET',
        responseType: 'arraybuffer',
        success(response) {
          uni.request({
            url: getUploadUrlData.uploadUrl,
            method: 'PUT',
            data: response.data,
            header: getUploadUrlData.header,
            timeout: 1000 * 60 * 30,
            success(res: any) {
              if (res.statusCode === 200) {
                resolve(true);
              } else {
                showInfo('上传失败');
                reject({ msg: '上传失败' });
              }
            },
            fail: function (error: any) {
              showInfo(error.msg || error.desc || '上传失败');
              reject({ msg: error.msg || error.desc || '上传失败' });
            },
          });
        },
        fail: function (error: any) {
          showInfo(error.msg || error.desc || '上传失败');
          reject({ msg: error.msg || error.desc || '上传失败' });
        },
      });
    });
    // #endif
    // #ifdef MP-WEIXIN
    await new Promise((resolve, reject) => {
      const fs = uni.getFileSystemManager();
      fs.readFile({
        filePath: filePath,
        success: res => {
          uni.request({
            url: getUploadUrlData.uploadUrl,
            method: 'PUT',
            data: res.data,
            header: getUploadUrlData.header,
            timeout: 1000 * 60 * 30,
            success(res: any) {
              if (res.statusCode === 200) {
                resolve(true);
              } else {
                showInfo('上传失败');
                reject({ msg: '上传失败' });
              }
            },
            fail: function (error: any) {
              showInfo(error.msg || error.desc || '上传失败');
              reject({ msg: error.msg || error.desc || '上传失败' });
            },
          });
        },
        fail: function (error: any) {
          showInfo(error.msg || error.desc || '上传失败');
          reject({ msg: error.msg || error.desc || '上传失败' });
        },
      });
    });
    // #endif
    const updateResult = await updateUploadResult(getUploadUrlData.fileId, 1, fileName);
    if (updateResult) {
      const fileInfo = await getFileInfo(getUploadUrlData.fileId);
      const { fileName, fullUrl } = fileInfo;
      fileList.value.push({
        fileId: getUploadUrlData.fileId,
        url: fullUrl,
        name: fileName,
      });
      emit('afterUpload', fileList.value);
      showInfo('上传成功');
    }
  } finally {
    uni.hideLoading();
  }
};
const handleFileAdd = async () => {
  try {
    await doFileAdd();
  } finally {
    emit('uploadFinished');
  }
};
const handleFileDelete = (file: any) => {
  emit('beforeUpload');
  const files = fileList.value || [];
  fileList.value = files.filter((i: any) => i.fileId !== file.fileId);
  emit('afterUpload', fileList.value);
  emit('uploadFinished');
};

const handlePreviewFile = (file: any) => {
  console.log('...... > handlePreviewFile > file:', file);
  const url =
    `/filePreview/onlinePreview?url=` +
    encodeURIComponent(btoa(file.url)) +
    '&token=' +
    authInfo?.accessToken;
  console.log('...... > handlePreviewFile > url:', url);
  goToApplication({
    code: '',
    icon: '',
    id: '',
    name: '文件预览',
    path: getLowCodeHost() + url,
    target: ETargetType.TargetTypeAbsoluteH5,
    type: EApplicationType.New,
  });
};
</script>

<template>
  <view class="upload-file">
    <view v-if="fileList.length < maxCount" class="upload-file-head">
      <!--#ifdef MP-WEIXIN-->
      <!-- <view class="tip">
        <u-icon name="info-circle"></u-icon> 小程序不支持上传文件，请使用APP或电脑端</view
      > -->
      <!--#endif-->
      <u-button
        :custom-style="{
          height: '64rpx',
          color: '#1677ff',
          fontWeight: 'bold',
          fontSize: '26rpx',
        }"
        :disabled="disabled"
        @click="handleFileAdd"
        >{{ buttonText }}</u-button
      >
    </view>
    <view v-if="fileList.length" class="file-list">
      <view
        v-for="file in fileList"
        :key="file.fileId"
        class="file-item"
        @click="handlePreviewFile(file)"
      >
        <u-image
          class="file-item-icon"
          width="42"
          height="44"
          :src="getFileIcon(file, 'name')"
        ></u-image>
        <view class="file-item-name"
          ><text>{{ file.name }}</text></view
        >
        <view v-if="!disabled" class="file-item-delete" @click.stop="handleFileDelete(file)">
          删除
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.upload-file {
  border-radius: 16rpx;
  background: #fff;
}

.upload-file-head:not(:last-child) {
  margin-bottom: 16rpx;
}
.file-list {
  overflow: hidden;
}
.file-item {
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 24rpx 32rpx;
  &:not(:last-child) {
    margin-bottom: 16rpx;
  }
}
.file-item-icon {
  height: 48rpx;
  width: 48rpx;
  display: block;
  flex: none;
}
.file-item-name {
  flex: auto;
  width: 1rpx;
  margin-left: 36rpx;
  color: rgba(0, 0, 0, 0.88);
  font-size: 26rpx;
  word-break: break-all;
  white-space: normal;
}
.file-item-delete {
  color: #1677ff;
  font-size: 26rpx;
  margin-left: 32rpx;
}
.tip {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.5);
}
</style>
