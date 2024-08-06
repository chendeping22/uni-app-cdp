<script setup lang="ts">
import { requestAllChooseImagePer } from '@/services/permissionRequest';
import { concat, get, map } from '@/utils/lodash-es';
import { showInfo } from '@/utils/tools';
import { batchUploadChoosedImages } from '@/utils/upload-medias';
import { ref, unref, watch } from 'vue';
import { handleClickImgs } from '../../util';

const props = withDefaults(
  defineProps<{
    showRemove?: boolean;
    /** 每次上传时可选图片的数量 */
    perChooseCount?: number;
    maxCount?: number;
    maxSize?: number;
    modelValue?: string | string[];
    readonly?: boolean;
    _class?: string;
    defaultFileList?: {
      url: string;
      name?: string;
      size?: number;
      extname?: string;
      fileId?: string;
    }[];
  }>(),
  {
    perChooseCount: 1,
    maxSize: 20,
    maxCount: 1,
    showRemove: true,
    readonly: false,
    modelValue: () => [],
    defaultFileList: () => [],
    _class: '',
  },
);

const emit = defineEmits<{
  (e: 'afterUpload', imgs: any): void;
  (e: 'update:modelValue', val?: string | string[]): void;
}>();
// 上传照片
const imgList = ref<any[]>(props.defaultFileList);

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
  emit(
    'update:modelValue',
    props.maxCount === 1 ? undefined : imgList.value.map((i: any) => i.fileId),
  );
  emit('afterUpload', imgList.value);
};

const get_extname = (path: string) => {
  const inx = path.lastIndexOf('.') + 1;
  return path.substring(inx);
};

const chooseImg = (isCertifi?: boolean) => {
  uni.chooseImage({
    sourceType: ['camera', 'album'],
    sizeType: ['original', 'compressed'],
    count: props.perChooseCount || 1,
    extension: ['jpg', 'jpeg', 'png'],
    async success(res: any) {
      const images: any[] = res.tempFiles.map((file: any) => ({
        url: file.path,
        name: file.name,
        size: file.size,
        extname: file.name ? file.name.split('.').pop() : get_extname(file.path),
      }));

      // 过滤尺寸（最大5M）
      const MAX_SIZE = props.maxSize * 1024 * 1024;
      const filter = images.filter(item => item.size <= MAX_SIZE);
      if (filter.length < images.length) {
        uni.showToast({
          icon: 'none',
          title: `图片不能超过${props.maxSize}MB`,
        });
        return;
      }
      const uploadRes: any[] = await batchUploadChoosedImages(
        filter,
        false,
        isCertifi,
        false,
        true,
        false,
        false,
      );

      if (uploadRes.length > 0) {
        imgList.value = concat(imgList.value, uploadRes).map(img => ({
          ...img,
          url: img.url || img.fullUrl,
        }));
        emit('afterUpload', imgList.value);
        emit(
          'update:modelValue',
          props.maxCount === 1
            ? get(imgList.value[0], 'fileId')
            : map(imgList.value, img => img.fileId),
        );
        showInfo('上传成功');
      }
    },
    fail: (res: any) => {
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
    <view class="upload-img-wrap">
      <template v-if="imgList.length > 0">
        <view
          v-for="(img, index) in imgList"
          :key="img.fileId"
          :class="['upload-img-item', _class]"
        >
          <u-image
            :src="img.url"
            width="142"
            height="142"
            border-radius="16"
            mode="aspectFill"
            @click="handleClickImgs(imgList, 'url', index)"
          >
          </u-image>
          <view v-if="showRemove && !readonly" class="icon-close" @click="handleImgDelete(img)">
            <u-icon name="close" color="#ffffff" size="24" />
          </view>
        </view>
      </template>
      <view v-if="!readonly && imgList?.length < maxCount" class="add-btn">
        <u-icon name="plus" color="rgba(0, 0, 0, 0.45)" size="48" @click="updatePhoto" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
@import './style.scss';

.upload-img {
  padding-top: $space-size-s;
  border-radius: $space-size-base;
  background: $color-background-base;

  &-wrap {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
  }

  &-item {
    position: relative;
    margin-right: px2rpx(6px);
    margin-bottom: px2rpx($space-size-s);

    .icon-close {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      right: 0;
      background: rgba($color-text-base, 0.45);
      border-top-right-radius: $radius-base;
      border-bottom-left-radius: $radius-base;
    }
  }

  .add-btn {
    width: 142rpx;
    height: 142rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: $radius-base;
    background-color: $borderColor;
    margin-bottom: px2rpx($space-size-s);
  }
}
</style>
