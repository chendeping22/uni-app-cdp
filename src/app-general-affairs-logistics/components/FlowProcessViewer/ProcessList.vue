<template>
  <view class="process-list-page">
    <view class="process-list">
      <view v-if="detailLoading" class="loading-view">
        <u-loading :show="detailLoading" size="64"></u-loading>
      </view>
      <template v-else>
        <view v-for="item in detailData" :key="item.nodeCode" class="process-item">
          <view class="first"
            ><span v-if="item.nodeName">{{ item.nodeName }}：</span
            ><span style="font-weight: bold">{{ item.userName }}[{{ item.phone }}]</span></view
          >
          <view class="second">
            <!-- 未处理 -->
            <!-- 是否已读，0=未读，1=已读 -->
            <!-- <template v-if="item.handleStatus == -2">
                  <span v-if="item.readState == 1" style="color: #52c41a">[已查看]</span>
                  <span v-else style="color: #efbd47">[未查看]</span>
                  <span style="color: #efbd47">[当前正在处理]</span>
                </template> -->
            <!-- 已处理 -->
            <span>
              <HandleStatus :status="item.handleStatus"></HandleStatus>
            </span>
            {{ item.handleOpinion || '' }}
          </view>
          <view class="third">
            <view class="left"
              ><span v-if="item.consumingTime">耗时：{{ item.consumingTime }}</span></view
            >
            <view class="right"> {{ item.handleTime ? formatDate(item.handleTime) : '' }}</view>
          </view>
          <view v-if="transformFileList(item.fileList)?.length > 0" class="file-area">
            附件：
            <view v-if="item?.fileList" class="file-list">
              <view
                v-for="file in handleFileName(item?.fileList)"
                :key="file.fileId"
                class="attachment-list"
                @click="handleClickPreview(file)"
              >
                <image :src="getFileIcon(file, 'name')" class="attachment-list-icon" />
                <text class="attachment-list-text">{{ file?.name }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="!detailData.length" style="padding: 48px 0 24px">
          <u-empty-custom text="暂无数据"></u-empty-custom>
        </view>
      </template>
    </view>
  </view>
</template>
<script lang="ts" setup>
import { getFileIcon } from '@/app-general-affairs-logistics/components/attachments-list/attachment';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import dayjs from 'dayjs';
import { onBeforeMount, ref } from 'vue';
import HandleStatus from './HandleStatus.vue';
import { getTaskNodeHandleInfo } from './service';
import { transformFileList } from './tools.js';

const props = withDefaults(
  defineProps<{
    id: string;
  }>(),
  {
    id: '',
  },
);

const detailData = ref<any>([]);
const detailLoading = ref(false);
// 耗时时间

async function getDetail() {
  if (!props.id) {
    return;
  }
  detailLoading.value = true;
  try {
    const res: any = await getTaskNodeHandleInfo({
      id: props.id,
    });
    // consumingTime.value = res?.consumingTime || '';
    detailData.value = res?.taskNodeHandles || [];
  } catch (error) {
    detailData.value = [];
  } finally {
    detailLoading.value = false;
  }
}

function formatDate(time: string, format = 'YYYY-MM-DD HH:mm') {
  return time ? dayjs(time).format(format) : '';
}

const handleFileName = (data: any) => {
  let fileJson: any[] = data || [];
  try {
    if (typeof fileJson === 'string') {
      fileJson = JSON.parse(fileJson);
      fileJson = fileJson.map((i: any) => {
        if (typeof i === 'string') {
          return JSON.parse(i);
        }
        return i || {};
      });
    }
    return fileJson;
  } catch (error) {
    return [];
  }
};

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

onBeforeMount(() => {
  getDetail();
});
</script>

<style scoped lang="scss">
.loading-view {
  height: 250rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.process-list-page {
  padding: 24rpx 32rpx;
}

.process-list {
  overflow: auto;
  padding: 8rpx 0;
  border-radius: 16rpx;
  background-color: #fff;

  .process-info {
    padding: 24rpx 32rpx;
    min-height: 120rpx;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #f0f0f0;

    &-title {
      font-size: 32rpx;
      color: #333;
    }

    &-time {
      margin-top: 16rpx;
      font-size: 28rpx;
      color: #666;
    }
  }

  .process-item {
    padding: 24rpx 32rpx;
    border-bottom: 1px solid #f0f0f0;

    .second {
      margin: 20rpx 0;
    }

    .third {
      display: flex;
      justify-content: space-between;
    }
    &:last-child {
      border-bottom: none;
    }
  }
}

.file-list {
  margin-top: 24rpx;
}
.attachment-list {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 26rpx 0;
  border-radius: 16rpx;
}
.attachment-list-icon {
  height: 48rpx;
  width: 48rpx;
  margin-right: 20rpx;
}
.attachment-list-text {
  flex: 1;
}
</style>
