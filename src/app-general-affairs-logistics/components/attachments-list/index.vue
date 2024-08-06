<template>
  <view
    v-for="item in props.fileData"
    :key="item?.fileId"
    class="attachment-list"
    @click="handleClickPreview(item)"
  >
    <view class="attachment-list-left">
      <view class="left-img">
        <image :src="getFileIcon(item, fieldFileName)" class="attachment-list-icon" />
      </view>
      <view class="attachment-list-name">{{ item?.[fieldFileName] }}</view>
    </view>
    <view class="attachment-list-right">
      <view v-if="props?.showViewBtn">查看</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import { PropType } from 'vue';
import { getFileIcon } from './attachment';

interface IFile {
  fileId?: string;
  fileName?: string;
  name?: string;
  fileUrl?: string;
  [x: string]: any;
}

const props = defineProps({
  fileData: {
    type: Array as PropType<IFile[]>,
    default: [],
  },
  showViewBtn: {
    type: Boolean,
    default: true,
  },
  fieldFileName: {
    type: String,
    default: 'fileName',
  },
  fieldFileUrl: {
    type: String,
    default: 'fileUrl',
  },
});

const handleClickPreview = (item: any) => {
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
</script>

<style lang="scss" scoped>
.attachment-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 16rpx;
  margin-top: 16rpx;
  width: 100%;
  .attachment-list-icon {
    height: 48rpx;
    width: 48rpx;
    margin-right: 32rpx;
  }
  .left-img {
    display: flex;
    align-items: center;
  }
  .attachment-list-left {
    display: flex;
    align-items: center;
    flex: 1;
    width: calc(100% - 56rpx);
  }
  .attachment-list-name {
    color: rgba(0, 0, 0, 0.88);
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .attachment-list-right {
    font-weight: 500;
    color: #1677ff;
    font-size: 26rpx;
    word-break: keep-all;
    margin-left: 16rpx;
  }
}
</style>
