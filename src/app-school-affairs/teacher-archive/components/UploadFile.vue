<script setup lang="ts">
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { getFileInfo, updateUploadResult } from '@/services/upload';
import { loginStore } from '@/store/modules/login';
import { showInfo } from '@/utils/tools';
import { ref, unref, watch } from 'vue';
import { getUploadUrl } from '../../services/fill-report';
import { getFileIcon } from '../../utils/getFileIcon';
const store = loginStore();
const { userInfo } = store;

const props = withDefaults(
  defineProps<{
    maxCount?: number;
    maxSize?: number;
    defaultFileList?: any[];
    preview: boolean;
    accept: string;
  }>(),
  {
    maxSize: 20,
    preview: false,
  },
);

const emit = defineEmits<{
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
);
const get_extname = (path: string) => {
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
const handleFileAdd = async () => {
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
    showInfo('文件选择异常');
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
    showInfo('文件选择异常');
    return;
  }
  await new Promise((resolve, reject) => {
    chooseFile({
      count: 1,
      extension: props.accept?.split(',') || [
        '.pdf',
        '.doc',
        'docx',
        '.xls',
        '.xlsx',
        '.txt',
        '.wps',
      ],
      async success(res: any) {
        if (res.tempFiles && res.tempFiles[0]) {
          file = res.tempFiles[0];
          resolve(true);
        } else {
          reject();
        }
      },
      fail: async function (res: any) {
        console.log('chooseImageFaild: ' + JSON.stringify(res));
        const { code, errMsg } = res;
        console.log('code: ' + code + ', errMsg: ' + errMsg);
        reject(res);
      },
    });
  });
  if (file) {
    fileSize = file.size;
    fileType = file.name ? file.name.split('.').pop() : get_extname(file.path);
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
  const requestParams: any = {
    locationId: userInfo?.locationId,
    fileType: fileType,
    bucketType: 'public',
  };
  let getUploadUrlData: any = null;
  try {
    getUploadUrlData = await getUploadUrl(requestParams);
  } catch (error: any) {
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
};
const handleFileDelete = (file: any) => {
  const files = fileList.value || [];
  fileList.value = files.filter((i: any) => i.fileId !== file.fileId);
  emit('afterUpload', fileList.value);
};
</script>

<template>
  <view class="upload-file">
    <view class="upload-file-head"
      ><view>附件</view>
      <u-button
        v-show="!preview"
        style="margin: 0"
        :type="fileList.length === maxCount ? 'default' : 'primary'"
        :disabled="fileList.length === maxCount"
        size="mini"
        plain
        @click="handleFileAdd"
        >上传附件</u-button
      >
    </view>
    <view v-if="fileList.length" class="file-list">
      <view v-for="file in fileList" :key="file.fileId" class="file-item">
        <u-image
          class="file-item-icon"
          width="42"
          height="44"
          :src="getFileIcon(file, 'name')"
        ></u-image>
        <view class="file-item-name">{{ file.name }}</view>
        <view v-if="!preview" class="file-item-delete" @click="handleFileDelete(file)"> 删除 </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.upload-file {
  padding: 0 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}

.upload-file-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx 0;
  align-items: center;
}
.file-list {
  overflow: hidden;
}
.file-item {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 24rpx 32rpx;
}
.file-item-icon {
  height: 48rpx;
  width: 48rpx;
  display: block;
}
.file-item-name {
  margin: 0 32rpx 0 32rpx;
  flex: 1;
  color: rgba(0, 0, 0, 0.88);
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.file-item-delete {
  color: #1677ff;
  font-size: 26rpx;
}
.tip {
  font-size: 24rpx;
  color: rgba(0, 0, 0, 0.5);
}
</style>
