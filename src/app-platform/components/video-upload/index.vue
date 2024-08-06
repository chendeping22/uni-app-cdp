<template>
  <view class="video-container">
    <video v-if="videoUrl" class="u-relative" :src="videoUrl" :poster="posterUrl">
      <!-- #ifndef MP-WEIXIN -->
      <cover-view
        v-if="!readonly"
        class="u-absolute u-flex u-row-center btn-remove"
        @click="handleVideoRemove"
      >
        <cover-image :src="closePng" class="icon-close" @click="handleVideoRemove" />
      </cover-view>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <view
        v-if="!readonly"
        class="u-absolute u-flex u-row-center btn-remove"
        @click="handleVideoRemove"
      >
        <image :src="closePng" class="icon-close" />
      </view>
      <!-- #endif -->
    </video>
    <view v-if="!videoUrl" class="btn-upload" @click="handleVideoUpload">
      <u-icon name="plus" color="#00000073" size="50" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { fetchVideoSnapshot } from '@/app-platform/services/infos';
import closePng from '@/app-platform/static/infos/close.png';
import { requestAllChooseImagePer } from '@/services/permissionRequest';
import { getFileInfo } from '@/services/upload';
import { chooseAndUploadVideo } from '@/utils/upload-medias';
import { ref, withDefaults } from 'vue';

interface Props {
  modelValue?: string;
  videoUrl?: string;
  posterUrl?: string;
  readonly?: boolean;
  maxSize?: number;
  private?: boolean;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (e: 'update:modelValue', val?: string): void;
}>();

const videoUrl = ref<string>();
const posterUrl = ref<string>();

const handleVideoUpload = async () => {
  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestAllChooseImagePer(
      res => {
        // 已有权限
        console.log('permissionRequestResult : ' + JSON.stringify(res));
        videoUpload();
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
    videoUpload();
  }
};

const videoUpload = async () => {
  try {
    posterUrl.value = '';
    const result = await chooseAndUploadVideo(
      { maxSize: props.maxSize },
      { isPublic: !props.private },
    );
    if (Array.isArray(result)) {
      const info = result[1] as any;
      videoUrl.value = info.fullUrl;
      emit('update:modelValue', info.fileId);

      fetchVideoSnapshot({ fileId: info.fileId }).then(snapshotFileId => {
        if (snapshotFileId) {
          getFileInfo(snapshotFileId as string).then(data => {
            if (data && data.fullUrl) {
              posterUrl.value = data.fullUrl;
            }
          });
        }
      });
    }
  } catch (ex) {
    console.debug('[FN:handleVideoUpload]ERROR ', ex);
  }
};

const handleVideoRemove = () => {
  posterUrl.value = '';
  videoUrl.value = '';
  emit('update:modelValue');
};
</script>

<style lang="scss" scoped>
.video-container {
  position: relative;
  overflow: hidden;
  width: px2rpx(311);
  height: px2rpx(192);
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: $radius-base;

  video {
    width: 100%;
    height: 100%;
  }
  .btn-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
.btn-remove {
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  overflow: hidden;
  z-index: 2;
}

.icon-close {
  display: block;
  width: px2rpx(20);
  height: px2rpx(20);
  margin: 0;
  padding: 0;
}
</style>
