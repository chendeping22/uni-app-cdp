<template>
  <view>
    <view v-if="showFooter" class="foot-bottom"></view>
    <view v-if="showFooter" class="foot">
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
        :custom-style="{ background: '#1677ff', color: '#fff' }"
        @click="handleOpinion('commit')"
        >通过</u-button
      >
      <template v-if="showResubmit">
        <u-button
          style="flex: 1"
          :custom-style="{ color: '#1677ff', marginRight: '24rpx' }"
          @click="showDeleteModal = true"
        >
          删除
        </u-button>
        <u-button
          style="flex: 1"
          :custom-style="{ color: '#1677ff', marginRight: '24rpx' }"
          @click="handleEdit"
        >
          编辑
        </u-button>
        <u-button
          style="flex: 1"
          :custom-style="{ background: '#1677ff', color: '#fff' }"
          @click="showAgainModal = true"
        >
          重新提交
        </u-button>
      </template>
    </view>
    <opinion-popup
      :showOpinion="showOpinion"
      :opinionParams="opinionParams"
      :detail-data="detailData"
      @onAfterSubmit="handleAfterSubmit"
      @onAssetList="handleAssetList"
      @onClose="handleClose"
    />
    <u-modal
      v-model="showDeleteModal"
      title="删除确认"
      :content="`您确定删除${detailData.deptName || ''}${detailData.applyUser}的采购申请吗？`"
      show-cancel-button
      show-confirm-button
      confirm-text="确认删除"
      @confirm="handleDelete"
      @cancel="() => (showDeleteModal = false)"
    ></u-modal>
    <u-modal
      v-model="showAgainModal"
      content="确认重新提交？"
      show-cancel-button
      show-confirm-button
      @confirm="handleResubmit"
      @cancel="() => (showAgainModal = false)"
    ></u-modal>
    <view v-if="!showFooter" class="u-fixed-placeholder safe-area-inset-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import OpinionPopup from '@/app-general-affairs-logistics/consumable-management/components/OpinionPopup.vue';
import {
  commonProcess,
  deleteMaterialPurchasesById,
} from '@/app-general-affairs-logistics/consumable-management/services/purchase';
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
});

const userInfo = loginStore().userInfo;
const showOpinion = ref<boolean>(false);
const opinionParams = reactive<{ orderId?: string; type?: string }>({});

/** 撤回弹窗状态 */
const showDeleteModal = ref<boolean>(false);
const showAgainModal = ref<boolean>(false);
/** 是否为发起人 */
const isCreator = computed(
  () => props?.detailData?.applyUserId && props?.detailData?.applyUserId === userInfo?.userId,
);

/** 是否为审批人 */
const isApproveUser = computed(() => {
  const approverList = props?.detailData?.approverList;
  if (!approverList?.length) return false;
  return (
    approverList?.findIndex(
      (v: { userId: string | undefined }) => v?.userId === userInfo?.userId,
    ) >= 0
  );
});

/** 是否驳回:3 退回：4状态 */
const isResubmit = computed(() =>
  [StatusEnum.Reject, StatusEnum.Return].includes(props?.flowStatus),
);
/** 审批人操作：审批人;单据状态不为已撤回、已驳回 */
const showApproverBtn = computed(() => {
  return !isResubmit.value && isApproveUser.value && StatusEnum.Adopt !== props?.flowStatus;
});

/** 再次提交操作：发起人;单据状态已撤回、驳回状态  */
const showResubmit = computed(() => isResubmit.value && isCreator.value);
/** 发起人操作：发起人;单据状态不为已撤回、已驳回*/
const showCreatorBtn = computed(
  () =>
    isCreator.value &&
    !isResubmit.value &&
    props?.detailData?.approverList?.length &&
    StatusEnum.Adopt !== props?.flowStatus &&
    StatusEnum.Submitted !== props?.flowStatus,
);
const showFooter = computed(
  () => showApproverBtn.value || showResubmit.value || showCreatorBtn.value,
);

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
// 删除
const handleDelete = async () => {
  try {
    await deleteMaterialPurchasesById(props.orderId);
    showInfo('删除成功');
    uni.navigateBack();
  } catch (error: any) {
    console.log('file: index.vue:164 ~ handleSubmit ~ error:', error);
  }
};
const handleEdit = async () => {
  uni.redirectTo({
    url: `/app-general-affairs-logistics/consumable-management/pages/purchase/index?id=${props.orderId}`,
  });
};
/** 重新提交 */
const handleResubmit = async () => {
  try {
    showLoading();
    await commonProcess({
      action: 1,
      code: 'materialPurchase',
      comment: '重新提交',
      id: props.orderId,
      status: 3,
    });
    showInfo('提交成功');
    emits('updateDetail');
  } catch (error: any) {
    showInfo(error?.msg || '提交失败');
  } finally {
    hideLoading();
  }
};
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
