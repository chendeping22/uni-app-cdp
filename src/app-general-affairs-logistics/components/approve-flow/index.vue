<!-- 审批流程 -->
<template>
  <view class="approve-flow">
    <u-card
      :title="title"
      :head-border-bottom="false"
      title-size="32"
      :head-style="{ 'padding-bottom': 0 }"
      :border="false"
      full
    >
      <template #body>
        <view class="card-content">
          <view class="card-content-notice" @click="handleToFlowChart"
            ><text>{{ flowButtonName }}</text>
            <u-icon name="arrow-right" />
          </view>
          <view class="card-content-list">
            <u-time-line>
              <u-time-line-item nodeTop="2" v-for="item in state.list" :key="item?.nodeCode">
                <template v-slot:node>
                  <u-image :src="stepsItemIcon" width="36" height="36" />
                </template>
                <template v-slot:content>
                  <view>
                    <view class="u-order-title">{{ item?.nodeName }}</view>
                    <view class="u-order-content">
                      <view class="u-order-info">
                        <view class="u-order-user">
                          <view class="u-m-r-16">{{ item?.userName }}</view>
                          <view>{{ item?.phone }}</view>
                        </view>
                        <view class="u-order-time">{{
                          item?.handleTime ? dayjs(item?.handleTime).format('YYYY-MM-DD HH:mm') : ''
                        }}</view>
                      </view>
                      <view
                        class="u-order-status"
                        :class="flowStatusStyleMap[item?.handleStatus]"
                        >{{ statusMapList[item?.handleStatus] }}</view
                      >
                    </view>
                    <view v-if="item?.handleOpinion?.trim()" class="u-order-opinion">{{
                      item?.handleOpinion
                    }}</view>
                  </view>
                </template>
              </u-time-line-item>
            </u-time-line>
          </view>
        </view>
      </template>
    </u-card>
  </view>
</template>

<script setup lang="ts">
import stepsItemIcon from '@/app-general-affairs-logistics/static/steps-item-icon.svg';
import dayjs from 'dayjs';
import { computed, reactive, watch } from 'vue';
import { TypeEnum, flowStatusMap, flowStatusStyleMap, statusList } from './constants';
import { fetchFlowBeforeInfo, fetchFlowBeforeInfoId, fetchFlowInfoDetail } from './services';

const props = defineProps({
  title: {
    // 审批流程标题
    type: String,
    default: '审批流程',
  },
  orderId: {
    type: String,
    default: '',
  },
  /** api类型 */
  type: {
    type: String,
    default: '',
  },
});

interface INodesList {
  handleStatus: number;
  handleTime: number;
  nodeCode: string;
  nodeName: string;
  phone: string;
  readState: number;
  userName: string;
  handleOpinion?: string;
}

const state = reactive<{
  nodeNum: number;
  list: INodesList[];
}>({
  nodeNum: 0, // 待审批节点数
  list: [],
});

const flowButtonName = computed(() => {
  const beforeTxt = state.nodeNum > 0 ? `尚需${state.nodeNum}个节点审批，` : '审批已结束，';
  return `${beforeTxt}点击查看流程图`;
});

const statusMapList = computed(() =>
  props?.type === TypeEnum.AssetManager ? flowStatusMap : statusList,
);

/** 查看审批流程图 */
const handleToFlowChart = () => {
  uni.navigateTo({
    url: `/app-general-affairs-logistics/components/approve-flow-draw/index?orderId=${
      props?.orderId
    }&type=${state.nodeNum ? 1 : 2}`,
  });
};

/** 获取流程详情 */
const getFlowTaskNodeHandleInfo = async () => {
  try {
    uni.showLoading();
    const res: any = await fetchFlowInfoDetail(props?.orderId);
    state.list = res?.flowTaskNodeInfo?.taskNodeHandles || [];
    const allNodeNum = +(res?.workOrderStatistic?.allNodeNum ?? 0);
    const processedNodeNum = +(res?.workOrderStatistic?.processedNodeNum ?? 0);
    state.nodeNum = allNodeNum ? allNodeNum - processedNodeNum : 0;
  } finally {
    uni.hideLoading();
  }
};

const getCommonFlowTaskNodeHandleInfo = async () => {
  try {
    uni.showLoading();
    const res: any = await fetchFlowBeforeInfoId(props?.orderId);
    if (res?.flowId) {
      const params = {
        taskNodeId: res?.taskNodeId,
        taskOperatorId: res?.taskOperatorId,
        flowId: res?.flowId,
      };
      const flowRes: any = await fetchFlowBeforeInfo(props.orderId, params);
      state.list = flowRes?.flowTaskOperatorRecordList;
      if (!flowRes?.flowTaskNodeList?.length) {
        state.nodeNum = 0;
        return;
      }
      const unFinishNode = flowRes?.flowTaskNodeList?.filter(
        (v: any) => v?.nodeCode !== 'end' && v?.completion === 0,
      );
      state.nodeNum = unFinishNode?.length;
    }
  } finally {
    uni.hideLoading();
  }
};

watch(
  () => props?.orderId,
  () => {
    if (!props?.orderId) return;
    if (props?.type === TypeEnum.AssetManager) {
      getFlowTaskNodeHandleInfo();
    } else {
      getCommonFlowTaskNodeHandleInfo();
    }
  },
  { immediate: true },
);

defineExpose({ getFlowTaskNodeHandleInfo, getCommonFlowTaskNodeHandleInfo });
</script>

<style lang="scss" scoped>
$txtDefaultColor: rgba(0, 0, 0, 0.88);
$textSecondaryColor: rgba(0, 0, 0, 0.45);
$fillDefaultColor: rgba(0, 0, 0, 0.04);
$colorSuccessBase: #52c41a;
$colorPrimaryBase: #1677ff;
$colorErrorBase: #ff4d4f;

.approve-flow {
  :deep(.u-card) {
    border-radius: 16rpx;
  }
}
.color-success {
  color: $colorSuccessBase;
}

.color-primary {
  color: $colorPrimaryBase;
}

.color-error {
  color: $colorErrorBase;
}

.card-content-notice {
  padding: 24rpx;
  background: $fillDefaultColor;
  border-radius: 8rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
}
.card-content-list {
  padding-left: 18rpx;
}
.u-order-title {
  color: $txtDefaultColor;
  font-weight: 500;
  font-size: 30rpx;
  margin-bottom: 16rpx;
}
.u-order-content {
  margin-bottom: 8rpx;
}
.u-order-info {
  display: flex;
  justify-content: space-between;
}
.u-order-user {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  margin-right: 16rpx;
}
.u-order-status {
  font-size: 30rpx;
  flex: 1;
}
.u-order-time {
  color: $textSecondaryColor;
  font-size: 26rpx;
  word-break: keep-all;
}
.u-order-opinion {
  font-size: 26rpx;
  color: $color-text;
  background: $color-border-secondary;
  padding: 8rpx 24rpx;
  border-radius: 8rpx;
}
</style>
