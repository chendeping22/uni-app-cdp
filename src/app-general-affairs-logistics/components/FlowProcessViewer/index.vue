<template>
  <view class="wrap">
    <text v-if="showHeader" class="flow-process-header">审批流程图</text>
    <view class="tips">
      <view class="tips-item"><span class="icon success">●</span>已完成</view>
      <view class="tips-item"><span class="icon current">●</span>进行中</view>
      <view class="tips-item"><span class="icon">●</span>无/未处理</view>
    </view>
    <view class="flow-info">
      <FlowInfo
        v-if="flowTemplateJson?.nodeId"
        :options="flowTemplateJson"
        @nodeClick="options => nodeClickAction(options)"
      />
    </view>
    <u-popup v-model="detailPopupShow" mode="bottom" height="90%" border-radius="14" closeable>
      <view class="process-list">
        <text class="flow-process-header">节点详情</text>
        <view v-if="detailLoading" class="loading-view">
          <u-loading :show="detailLoading" size="64"></u-loading>
        </view>
        <template v-else>
          <view class="process-info">
            <text class="process-info-title">节点：{{ nodeTitle }}</text>
            <text v-if="consumingTime" class="process-info-time">耗时：{{ consumingTime }}</text>
          </view>
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
        </template>
      </view>
    </u-popup>
  </view>
</template>
<script lang="ts" setup>
import { getFileIcon } from '@/app-general-affairs-logistics/components/attachments-list/attachment';
import { callBridge } from '@/js-bridge/call-bridge';
import { Action, Service } from '@/js-bridge/enums';
import dayjs from 'dayjs';
import { computed, onBeforeMount, ref, watch } from 'vue';
import FlowInfo from './FlowInfo.vue';
import HandleStatus from './HandleStatus.vue';
import { getFlowBeforeInfo, getFlowBeforeInfoId, getTaskNodeHandleInfo } from './service';
import { transformFileList } from './tools.js';

const props = withDefaults(
  defineProps<{
    id: string;
    // flowId?: string;
    // taskNodeId?: string;
    // taskOperatorId?: string;
    showHeader?: boolean;
  }>(),
  {
    id: '',
    // flowId: '',
    // taskNodeId: '',
    // taskOperatorId: '',
    showHeader: false,
  },
);

defineEmits(['nodeClick']);

const flowTemplateJson = ref<any>(null);
const detailPopupShow = ref(false);
const detailData = ref<any>([]);
const detailLoading = ref(false);
// 耗时时间
const consumingTime = ref('');
/** 节点标题 */
const nodeTitle = computed(() => {
  return flowTemplateJson.value?.properties?.title || '';
});

const init = async () => {
  if (!props.id) {
    console.error('id is null');
    return;
  }
  // uni.showLoading();
  try {
    const _infoRes: any = await getFlowBeforeInfoId(props.id);
    if (!_infoRes?.flowId) {
      return;
    }

    const flowBeforeInfoRes: any = await getFlowBeforeInfo(props.id, {
      flowId: _infoRes.flowId,
      taskNodeId: _infoRes.taskNodeId || '',
      taskOperatorId: _infoRes.taskOperatorId || '',
    });
    const flowTemplateJsonObj = flowBeforeInfoRes?.flowTemplateInfo?.flowTemplateJson
      ? JSON.parse(flowBeforeInfoRes?.flowTemplateInfo?.flowTemplateJson)
      : null;
    const flowTaskNodeList: any[] = flowBeforeInfoRes?.flowTaskNodeList;
    if (flowTemplateJsonObj && flowTaskNodeList?.length) {
      for (let i = 0; i < flowTaskNodeList.length; i++) {
        const nodeItem = flowTaskNodeList[i];
        const loop = (data: any) => {
          if (Array.isArray(data)) data.forEach(d => loop(d));
          if (data.nodeId === nodeItem.nodeCode) {
            if (nodeItem.type == 0) data.state = 'state-past';
            if (nodeItem.type == 1) data.state = 'state-curr';
            if (
              nodeItem.nodeType === 'approver' ||
              nodeItem.nodeType === 'start' ||
              nodeItem.nodeType === 'subFlow'
            )
              data.content = nodeItem.userName;
            return;
          }
          if (data.conditionNodes && Array.isArray(data.conditionNodes)) loop(data.conditionNodes);
          if (data.childNode) loop(data.childNode);
        };
        loop(flowTemplateJsonObj);
      }
    } else {
      flowTemplateJsonObj.state = 'state-curr';
    }
    console.log('file: index.vue:155 ~ init ~ flowTemplateJsonObj:', flowTemplateJsonObj);
    flowTemplateJson.value = flowTemplateJsonObj;
  } catch (error) {
    console.log('file: index.vue:159 ~ init ~ error:', error);
    // uni.showToast({
    //   title: '获取数据失败',
    //   duration: 2000,
    // });
  } finally {
    // uni.hideLoading();
  }
};

async function nodeClickAction(options: any) {
  const nodeCode = options.nodeId || '';
  if (!props.id || !nodeCode) {
    return;
  }
  detailPopupShow.value = true;
  detailLoading.value = true;
  try {
    const res: any = await getTaskNodeHandleInfo({
      id: props.id,
      nodeCode: nodeCode,
    });
    consumingTime.value = res?.consumingTime || '';
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

watch(detailPopupShow, show => {
  if (!show) {
    detailData.value = [];
  }
});

onBeforeMount(() => {
  init();
});
</script>

<style scoped lang="scss">
.wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;

  .tips {
    height: 70rpx;
    margin: 12rpx 24rpx 24rpx 32rpx;
    display: flex;
    align-items: center;

    .tips-item {
      line-height: 40rpx;
      font-size: 32rpx;
      display: inline-block;
      margin-right: 30rpx;

      .icon {
        font-size: 40rpx;
        margin-right: 10rpx;
        color: #b6b6b6;

        &.success {
          color: #55d187;
        }

        &.current {
          color: #1890ff;
        }
      }
    }
  }

  .flow-info {
    flex: 1;
  }
}

.file-area {
  margin-top: 20rpx;

  :deep(.jnpf-file-box-line) {
    height: 0 !important;
  }
}

.flow-process-header {
  height: 90rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36rpx;
  color: #333;
}

.loading-view {
  height: 250rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.process-list {
  overflow: auto;
  height: 100%;
  // margin-top: 90rpx;

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
