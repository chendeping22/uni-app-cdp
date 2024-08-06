<template>
  <view>
    <view v-if="showFooter" class="foot-bottom"></view>
    <view v-if="showFooter" class="foot">
      <u-button
        v-if="showCreatorBtn"
        style="flex: 1"
        :custom-style="footerItem"
        @click="() => (showWithdrawModal = true)"
      >
        撤回
      </u-button>
      <u-button
        v-if="showCreatorBtn"
        style="flex: 1"
        :custom-style="{ color: '#1677ff', marginRight: showApproverBtn ? '16rpx' : 0 }"
        @click="handlePress"
      >
        催办
      </u-button>
      <u-button
        v-if="showApproverBtn"
        style="flex: 1"
        :custom-style="footerItem"
        @click="handleOpinion('reject')"
        >驳回</u-button
      >
      <u-button
        v-if="showApproverBtn"
        style="flex: 1"
        :custom-style="{ color: '#1677ff' }"
        @click="handleOpinion('commit')"
        >同意</u-button
      >
      <u-button
        v-if="showResubmit"
        style="flex: 1"
        :custom-style="{ color: '#1677ff' }"
        @click="handleResubmit"
      >
        再次提交
      </u-button>
    </view>
    <opinion-popup
      :showOpinion="showOpinion"
      :opinionParams="opinionParams"
      :detail-data="detailData"
      :approval-type="approvalType"
      @onAfterSubmit="handleAfterSubmit"
      @onAssetList="handleAssetList"
      @onClose="handleClose"
    />
    <u-modal
      v-model="showWithdrawModal"
      title=""
      content="单据一旦撤回不可恢复，确认要撤回吗？"
      show-cancel-button
      show-confirm-button
      @confirm="handleWithdraw"
      @cancel="() => (showWithdrawModal = false)"
    ></u-modal>
    <view v-if="!showFooter" class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import OpinionPopup from '@/app-general-affairs-logistics/assets-manage/components/OpinionPopup.vue';
import {
  getFlowLaunchPress,
  getWorkOrderWithdraw,
} from '@/app-general-affairs-logistics/assets-manage/services/approve-operate';
import { loginStore } from '@/store/modules/login';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { computed, reactive, ref } from 'vue';
import { StatusEnum } from '../utils/constants';

const emits = defineEmits(['updateDetail', 'onResubmit', 'getAssetList']);

const footerItem = {
  color: '#1677ff',
  marginRight: '16rpx',
  borderRadius: '16rpx',
};

const props = defineProps({
  flowStatus: {
    // 审批状态
    type: Number,
    default: 0,
  },
  orderId: {
    // 单据id
    type: String,
    default: '',
  },
  // 详情
  detailData: {
    type: Object,
    default: {},
  },
  // 审批类型  采购同意特殊处理
  approvalType: {
    type: String,
    default: 'common',
  },
});

const userInfo = loginStore().userInfo;
const showOpinion = ref<boolean>(false);
const opinionParams = reactive<{ orderId?: string; type?: string }>({});

/** 撤回弹窗状态 */
const showWithdrawModal = ref<boolean>(false);
/** 是否为发起人 */
const isCreator = computed(
  () => props?.detailData?.createBy && props?.detailData?.createBy === userInfo?.userId,
);

/** 是否为审批人 */
const isApproveUser = computed(() => {
  const taskAssigneeList = props?.detailData?.flowTaskNodeModel?.taskAssigneeList;
  if (!taskAssigneeList?.length) return false;
  return (
    taskAssigneeList?.findIndex(
      (v: { userId: string | undefined }) => v?.userId === userInfo?.userId,
    ) >= 0
  );
});

/** 是否为已撤回、驳回状态*/
const isResubmit = computed(() =>
  [StatusEnum.Reject, StatusEnum.Withdraw].includes(props?.flowStatus),
);
/** 审批人操作：审批人;单据状态不为已撤回、已驳回 */
const showApproverBtn = computed(() => {
  return !isResubmit.value && isApproveUser.value;
});

/** 再次提交操作：发起人;单据状态已撤回、驳回状态   采购无再提交*/
const showResubmit = computed(
  () => isResubmit.value && isCreator.value && props.approvalType === 'common',
);
/** 发起人操作：发起人;单据状态不为已撤回、已驳回*/
const showCreatorBtn = computed(
  () =>
    isCreator.value &&
    !isResubmit.value &&
    props?.detailData?.flowTaskNodeModel?.taskAssigneeList?.length,
);

const showFooter = computed(
  () => showApproverBtn.value || showResubmit.value || showCreatorBtn.value,
);

/** 撤回 */
const handleWithdraw = async () => {
  try {
    showLoading();
    await getWorkOrderWithdraw(props?.orderId);
    showInfo('撤回成功');
    emits('updateDetail');
  } catch (e: any) {
    showInfo(e?.msg || '撤回失败');
  } finally {
    hideLoading();
  }
};

/** 催办 */
const handlePress = async () => {
  try {
    await getFlowLaunchPress(props?.orderId);
    showInfo('已发送催办通知');
  } catch (e: any) {
    showInfo(e?.msg || '催办失败');
  }
};

const handleOpinion = (type: string) => {
  opinionParams.orderId = props?.orderId;
  opinionParams.type = type;
  showOpinion.value = true;
};
const handleClose = () => {
  showOpinion.value = false;
};

const handleAfterSubmit = () => {
  emits('updateDetail');
};
const handleAssetList = (params: any) => {
  emits('getAssetList', params);
};

/** 再次提交 */
const handleResubmit = () => {
  emits('onResubmit');
};

defineExpose({
  handleClose,
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';

.foot {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
  position: fixed;
  width: 100%;
  bottom: 0;
  z-index: 2;
  background-color: $colorWhite;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  &-bottom {
    padding-bottom: 128rpx;
  }
  :last-child {
    margin-right: 0;
  }
}
</style>
