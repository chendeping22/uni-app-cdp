<script lang="ts" setup>
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { chooseAndUploadImage, chooseAndUploadVideo } from '@/utils/upload-medias';
import { computed, reactive } from 'vue';
import FormItem from './form-item.vue';
import VideoSnapshotImage from './video-snapshot-image.vue';

interface IValue {
  url: string;
  type: 'image' | 'video';
  fileId: string;
  name: string;
  fileExtension: string;
  videoSnapshot?: string;
}

const _actionList = [
  {
    text: '拍摄照片',
    type: 'image',
    sourceType: ['camera'],
  },
  {
    text: '拍摄视频',
    type: 'video',
    sourceType: ['camera'],
  },
  {
    text: '从手机相册选择图片',
    type: 'image',
    sourceType: ['album'],
  },
  {
    text: '从手机相册选择视频',
    type: 'video',
    sourceType: ['album'],
  },
];

const props = defineProps<{
  value: IValue[];
  hideLine?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:value', data: IValue[]): void;
}>();

const state = reactive({
  show: false,
});

const imageUrls = computed(() => {
  return props.value.filter(i => i.type === 'image').map(i => i.url);
});

const maxImageCount = computed(() => {
  return 10 - imageUrls.value.length;
});

const videoCount = computed(() => props.value.filter(i => i.type === 'video').length);

/** 过滤视频（已满5个） */
const isMaxVideo = computed(() => {
  return 5 - videoCount.value <= 0;
});

/** 过滤照片（已满10个） */
const isMaxImage = computed(() => maxImageCount.value <= 0);

const actionList = computed(() => {
  let _arr = [..._actionList];
  if (isMaxImage.value) {
    _arr = _arr.filter(i => i.type !== 'image');
  }
  if (isMaxVideo.value) {
    _arr = _arr.filter(i => i.type !== 'video');
  }
  return _arr;
});

const handleSelectImage = async sourceType => {
  if (!maxImageCount.value) {
    uni.showToast({
      title: '最多上传 10 张图片',
      icon: 'none',
    });
    return;
  }
  const uploadRes = await chooseAndUploadImage(
    [],
    maxImageCount.value,
    true,
    false,
    false,
    10000,
    false,
    sourceType,
  );
  if (uploadRes?.length) {
    emit(
      'update:value',
      props.value.concat(
        uploadRes.map(
          _file =>
            ({
              url: _file.url,
              type: 'image',
              fileId: _file.fileId,
              name: _file.name,
              fileExtension: (_file.name || _file.url || '').split('.').pop() || '',
            } as IValue),
        ),
      ),
    );
  }
};

const handleSelectVideo = async sourceType => {
  if (isMaxVideo.value) {
    uni.showToast({
      title: '最多上传 5 个视频',
      icon: 'none',
    });
    return;
  }
  const files: any = await chooseAndUploadVideo({ sourceType, maxSize: 10000 }, { isPublic: true });
  const _file = files?.[1] as any;
  if (_file?.fileId) {
    emit(
      'update:value',
      props.value.concat({
        url: _file.fullUrl,
        type: 'video',
        fileId: _file.fileId,
        name: _file.fileName,
        fileExtension: (_file.fileName || _file.filePath || '').split('.').pop() || '',
        videoSnapshot: _file.videoSnapshot,
      }),
    );
  }
};

const handleSelect = () => {
  state.show = true;
};

const onAction = (index: number) => {
  const _action = actionList.value[index] || {};
  if (_action.type === 'image') {
    handleSelectImage(_action.sourceType);
  } else if (_action.type === 'video') {
    handleSelectVideo(_action.sourceType);
  }
};

const handleDelete = (item: IValue) => {
  emit(
    'update:value',
    props.value.filter(i => i.fileId !== item.fileId),
  );
};

const handleClickPreviewVideo = (item: IValue) => {
  if (item.fileId) {
    callBridge({
      service: Service.file,
      action: Action.filePreview,
      data: {
        fileId: item.fileId,
      },
    });
  }
};

const handleClickPreviewImages = (item: IValue) => {
  uni.previewImage({
    urls: imageUrls.value,
    current: imageUrls.value.findIndex(i => i === item.url),
  });
};
</script>

<template>
  <form-item className="hide-line" title="照片/视频">
    <template #content>
      <u-button v-if="actionList.length" type="primary" size="mini" plain @click="handleSelect">
        上传
      </u-button>
    </template>
  </form-item>
  <view class="form-item-upload" v-if="value.length">
    <view class="form-item-upload-item" v-for="item in value" :key="item.fileId">
      <video-snapshot-image
        v-if="item.type === 'video'"
        :file-id="item.fileId"
        @click="handleClickPreviewVideo(item)"
      ></video-snapshot-image>
      <u-image
        v-else
        :src="item.url"
        :show-loading="true"
        width="160"
        height="160"
        border-radius="16"
        mode="aspectFill"
        @click="handleClickPreviewImages(item)"
      >
        <template v-slot:loading>
          <u-loading></u-loading>
        </template>
      </u-image>
      <view class="icon-close" @click="handleDelete(item)">
        <u-icon name="close" color="#ffffff" size="24"></u-icon>
      </view>
    </view>
  </view>
  <view class="form-item-line" v-if="!hideLine"></view>
  <u-action-sheet :list="actionList" v-model="state.show" @click="onAction"></u-action-sheet>
</template>

<style lang="scss" scoped>
.form-item-upload {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 0 8rpx;
}
.form-item-line {
  height: 1rpx;
  width: 100%;
  background: $color-split;
}
.form-item-upload-item {
  position: relative;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
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
</style>
