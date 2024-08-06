<script setup lang="ts">
import { handleClickImgs } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { requestAllChooseImagePer } from '@/services/permissionRequest';
import { showInfo } from '@/utils/tools';
import { batchUploadChoosedImages } from '@/utils/upload-medias';
import { ref, unref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    maxCount?: number;
    maxSize?: number;
    defaultFileList?: any[];
  }>(),
  {
    maxSize: 20,
    maxCount: 1,
  },
);

const emit = defineEmits<{
  (e: 'afterUpload', imgs: any): void;
}>();
// 上传照片
const imgList = ref<any[]>(unref(props.defaultFileList) || []);
watch(
  () => props.defaultFileList,
  newVal => {
    if (newVal) {
      imgList.value = unref(newVal);
    }
  },
);
const handleImgDelete = (file: any) => {
  const files = imgList.value || [];
  imgList.value = files.filter((i: any) => i.fileId !== file.fileId);
  emit('afterUpload', imgList.value);
};

const get_extname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

const chooseImg = (isCertifi: boolean) => {
  uni.chooseImage({
    sourceType: ['camera', 'album'],
    sizeType: ['original', 'compressed'],
    count: props.maxCount - imgList.value.length,
    extension: ['jpg', 'jpeg', 'png'],
    async success(res: any) {
      const images: any[] = res.tempFiles.map((file: any) => ({
        url: file.path,
        name: file.name,
        size: file.size,
        extname: file.name ? file.name.split('.').pop() : get_extname(file.path),
      }));
      console.log('imgs : ', JSON.stringify(images));
      // 过滤尺寸（最大5M）
      const MAX_SIZE = props.maxSize * 1024 * 1024;
      const filter = images.filter(item => item.size <= MAX_SIZE);
      if (filter.length < images.length) {
        uni.showToast({
          title: `此图片超过了${props.maxSize}M, 请更换`,
        });
      }
      const uploadRes: any[] = await batchUploadChoosedImages(
        filter,
        false,
        isCertifi,
        false,
        false,
        false,
        false,
      );
      if (uploadRes.length > 0) {
        imgList.value = imgList.value.concat(uploadRes);
        emit('afterUpload', imgList.value);
        showInfo('上传成功');
      }
    },
    fail: (res: any) => {
      console.log('chooseImageFaild: ' + JSON.stringify(res));
      const { code, errMsg } = res;
      console.log('code: ' + code + ', errMsg: ' + errMsg);
    },
  });
};
const updatePhoto = async () => {
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllChooseImagePer(
      res => {
        // 已有权限
        console.log('permissionRequestResult : ' + JSON.stringify(res));
        chooseImg();
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
    chooseImg();
  }
};
</script>

<template>
  <view class="upload-img">
    <view style="margin-bottom: 24rpx">图片</view>
    <view class="upload-img-wrap">
      <template v-if="imgList.length > 0">
        <view class="upload-img-item" v-for="(img, index) in imgList" :key="img.fileId">
          <u-image
            :src="img.url"
            width="142"
            height="142"
            border-radius="16"
            mode="aspectFill"
            @click="handleClickImgs(imgList, 'url', index)"
          >
          </u-image>
          <view class="icon-close" @click="handleImgDelete(img)">
            <u-icon name="close" color="#ffffff" size="24"></u-icon> </view
        ></view>
      </template>
      <view v-if="imgList?.length < maxCount" class="add-btn">
        <u-icon name="plus" color="rgba(0, 0, 0, 0.45)" size="48" @click="updatePhoto"></u-icon>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.upload-img {
  padding: 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}
.upload-img-wrap {
  display: flex;
  flex-wrap: wrap;
  margin-right: -16rpx;
  margin-bottom: -16rpx;
}
.upload-img-item {
  position: relative;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  .icon-close {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.45);
    border-top-right-radius: 16rpx;
    border-bottom-left-radius: 16rpx;
  }
}
.add-btn {
  width: 142rpx;
  height: 142rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16rpx;
  background-color: $borderColor;
}
</style>
