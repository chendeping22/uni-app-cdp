<template>
  <view>
    <u-popup
      v-model="show"
      mode="bottom"
      closeable
      height="80vh"
      @close="show = false"
      @open="show = true"
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
    >
      <view class="detail">
        <view class="detail-header">节点详情</view>
        <view class="detail-content">
          <view class="detail-content-node">节点：{{ nodeTitle }}</view>
          <scroll-view scroll-y class="detail-scroll">
            <view class="detail-content-list" v-for="item in nodeHandles" :key="item?.nodeCode">
              <view class="list-top">
                <view class="list-title"
                  ><text class="list-title-user">{{ item?.userName }}</text>
                  <text class="list-title-phone">{{ item?.phone }}</text>
                </view>
                <view class="list-content">
                  <text class="list-content-time">{{
                    item?.handleTime ? dayjs(item?.handleTime).format('YYYY-MM-DD HH:mm') : ''
                  }}</text>
                  <text
                    class="list-content-status"
                    :class="flowStatusStyleMap[item?.handleStatus]"
                    >{{ flowStatusMap[item?.handleStatus] }}</text
                  >
                </view>
              </view>
              <view class="list-desc" v-if="item?.handleOpinion"
                >留言：{{ item?.handleOpinion }}</view
              >
              <view class="file-list" v-if="item?.fileList">
                <view
                  v-for="file in handleFileName(item?.fileList)"
                  class="attachment-list"
                  @click="handleViewFile(file?.url)"
                >
                  <image :src="getFileIcon(file, 'name')" class="attachment-list-icon" />
                  <text>{{ file?.name }}</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import {
  flowStatusMap,
  flowStatusStyleMap,
} from '@/app-general-affairs-logistics/components/approve-flow/constants';
import { getFileIcon } from '@/app-general-affairs-logistics/components/attachments-list/attachment';
import { showInfo } from '@/utils/tools';
import dayjs from 'dayjs';
import { map } from 'lodash-es';
import { computed, ref } from 'vue';
import { fetchFlowTaskNodes } from '../services';

interface INode {
  fileUrls: Record<string, any>[];
  handleId: string;
  handleStatus: number | string;
  handleTime: null;
  nodeCode: string;
  nodeName: string;
  phone: string;
  userName: string;
  [k: string]: any;
}
const props = defineProps({
  orderId: {
    type: String,
    default: '',
  },
});

const show = ref<boolean>(false);

const nodeHandles = ref<INode[]>([]);

const nodeTitle = computed(() => {
  const val = nodeHandles.value?.[0]?.nodeName;
  return val && val !== '开始' ? val : '流程发起';
});

const getFlowTaskNodes = async (nodeCode: string) => {
  try {
    uni.showLoading();
    const res: any = await fetchFlowTaskNodes({ id: props?.orderId, nodeCode: nodeCode });
    nodeHandles.value = res?.flowTaskNodeInfo?.taskNodeHandles;
  } finally {
    uni.hideLoading();
  }
};

const handleShowPopup = (nodeCode: string) => {
  show.value = true;
  getFlowTaskNodes(nodeCode);
};

const handleFileName = (data: string) => {
  const val = data.includes('{') ? JSON.parse(data) : [];
  const files = map(val, v => (v.includes('{') ? JSON.parse(v) : v));
  return files;
};

const handleViewFile = (url?: string) => {
  uni.downloadFile({
    url,
    success: function (res) {
      const filePath = res.tempFilePath;
      uni.openDocument({
        filePath: filePath,
        fail: () => {
          showInfo('当前暂不支持打开该文件类型');
        },
      } as any);
    },
  });
};

defineExpose({
  handleShowPopup,
});
</script>

<style lang="scss" scoped>
@import '../style.scss';

.detail {
  .detail-header {
    display: flex;
    justify-content: center;
    font-size: 34rpx;
    color: $txtDefaultColor;
    margin: 24rpx 0;
    font-weight: 500;
  }
  .detail-content {
    padding: 24rpx 32rpx;

    &-node {
      color: $txtDefaultColor;
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 24rpx;
    }
    &-list {
      background-color: $fillDefaultColor;
      border-radius: 8rpx;
      padding: 24rpx;
      margin-top: 24rpx;
    }
    .list-top {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;
      align-items: flex-start;
    }
    .list-title {
      font-size: 32rpx;
      color: $txtDefaultColor;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
      &-user {
        font-weight: 500;
        font-size: 30rpx;
        margin-right: 16rpx;
      }
      &-phone {
        font-size: 26rpx;
        margin-right: 16rpx;
      }
    }
    .list-content {
      font-size: 26rpx;
      display: flex;
      align-items: center;
      word-break: keep-all;
      &-time {
        color: $textSecondaryColor;
        margin-right: 16rpx;
        word-break: keep-all;
      }
      &-status {
        word-break: keep-all;
      }
    }
    .list-desc {
      font-size: 26rpx;
      color: $txtDefaultColor;
    }
  }
  .file-list {
    margin-top: 24rpx;
  }
}
.attachment-list {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 26rpx 34rpx;
  margin-top: 24rpx;
  border-radius: 16rpx;
}
.attachment-list-icon {
  height: 48rpx;
  width: 48rpx;
  margin-right: 20rpx;
}
.detail-scroll {
  height: calc(80vh - 100rpx - env(safe-area-inset-bottom));
  height: calc(80vh - 100rpx - constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
}
</style>
