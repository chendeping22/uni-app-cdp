<script setup lang="ts">
import { showInfo } from '@/utils/tools';
import { batchUploadChoosedImages, chooseImage } from '@/utils/upload-medias';
import { map } from 'lodash-es';
import { ref, unref, watch } from 'vue';

interface ImgType {
  fileId: string;
  thumbnail: any;
  type: number;
  url: string;
}

const handleClickImgs = (val?: any[], urlName?: string, index?: number) => {
  const urls = map(val || [], v => v?.[urlName || 'url']);
  if (val?.length) {
    uni.previewImage({
      urls,
      current: index ?? 0,
    });
  }
};

const props = withDefaults(
  defineProps<{
    maxCount?: number;
    maxSize?: number;
    defaultFileList?: ImgType[];
    title?: string;
    preview: boolean;
  }>(),
  {
    maxSize: 20,
    maxCount: 1,
    preview: false,
  },
);

const emit = defineEmits(['afterUpload', 'update:personalImg', 'update:personalImgUrl']);
// 上传照片
const imgList = ref<ImgType[]>(unref(props.defaultFileList) || []);
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
  emit('update:personalImg', '');
  emit('update:personalImgUrl', '');
};

const updatePhoto = async () => {
  const _images = await chooseImage({
    count: props.maxCount - imgList.value.length,
    sizeType: ['original', 'compressed'],
    maxSize: props.maxSize, // 默认5M
    sourceType: ['album', 'camera'],
    extension: ['jpg', 'jpeg', 'png'],
    // count = 9,
    // sizeType = ['compressed'],
    // maxSize = 5, // 默认5M
    // sourceType = ['album', 'camera'],
    // extension = ['jpg', 'png'],
  });
  console.log('🚀ccc ~ updatePhoto ~ _images:', _images);

  // 业务定
  const newImages = _images?.map(one => {
    return {
      path: one.path,
      url: one.path,
      name: one.name,
      size: one.size,
      extname: one.extname,
    };
  });
  console.log('🚀ccc ~ newImages ~ newImages:', newImages);

  const uploadRes: any[] = await batchUploadChoosedImages(
    newImages,
    false,
    // isCertifi,
    // false,
    // false,
    // false,
    // false,
  );
  console.log('🚀ccc ~ updatePhoto ~ uploadRes:', uploadRes);

  if (uploadRes.length > 0) {
    imgList.value = imgList.value.concat(uploadRes);
    emit('afterUpload', imgList.value);
    emit('update:personalImg', imgList.value?.[0]?.fileId);
    emit('update:personalImgUrl', imgList.value?.[0]?.url);
    showInfo('上传成功');
  }
};
</script>

<template>
  <view class="upload-img">
    <view style="margin-bottom: 24rpx">{{ title || '图片' }}</view>
    <view class="upload-img-wrap">
      <template v-if="imgList.length > 0">
        <view v-for="(img, index) in imgList" :key="img.fileId" class="upload-img-item">
          <u-image
            :src="img.url"
            width="142"
            height="142"
            border-radius="16"
            mode="aspectFill"
            @click="handleClickImgs(imgList, 'url', index)"
          >
          </u-image>
          <view v-if="!preview" class="icon-close" @click="handleImgDelete(img)">
            <u-icon name="close" color="#ffffff" size="24"></u-icon> </view
        ></view>
      </template>
      <view v-if="imgList?.length < maxCount && !preview" class="add-btn" @click="updatePhoto">
        <u-icon name="plus" color="rgba(0, 0, 0, 0.45)" size="48"></u-icon>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import '@/app-teacher-personnel/assets/style.scss';

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
