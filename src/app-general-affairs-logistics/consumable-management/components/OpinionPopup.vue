<template>
  <view>
    <u-popup
      v-model="show"
      mode="bottom"
      closeable
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
      @close="handleClose"
      @open="show = true"
    >
      <view class="opinion">
        <view class="opinion-header">审批处理</view>
        <scroll-view scroll-y class="opinion-scroll">
          <view class="opinion-scroll-inner">
            <view class="select-wrap">
              <view
                class="select-wrap-btn"
                :class="selected === 1 ? 'selected' : ''"
                @click="selected = 1"
                >同意</view
              >
              <view
                class="select-wrap-btn"
                :class="selected === 2 ? 'selected' : ''"
                @click="selected = 2"
                >驳回</view
              >
            </view>
            <u-input
              v-model="state.comment"
              class="textarea"
              type="textarea"
              :focus="show"
              maxlength="50"
              padding="18rpx 24rpx"
              :cursor-spacing="180"
              :height="120"
              adjust-position
              clearable
              placeholder="请输入审批意见"
              :trim="false"
              @blur="testInputEmptyAndSpecial(state.comment)"
            ></u-input>
          </view>
        </scroll-view>
        <view class="opinion-bottom">
          <u-button type="primary" @click="handleCommit">确定</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { commonProcess } from '@/app-general-affairs-logistics/consumable-management/services/purchase';
import { testInputEmptyAndSpecial } from '@/app-general-affairs-logistics/consumable-management/utils/tools';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { PropType, reactive, ref, watch } from 'vue';
// import {
//   getApprovalWorkOrderCommit,
//   getWorkOrderCommit,
//   getWorkOrderReject,
// } from '../services/approve-operate';

interface IFile {
  fileId: string;
  name: string;
  url: string;
}

interface IPopupParams {
  orderId: string;
  type: string;
}

enum TypeEnum {
  Commit = 'commit',
  Reject = 'reject',
}

const props = defineProps({
  // 详情
  detailData: {
    type: Object,
    default: {},
  },
  // 审批类型  采购同意特殊处理
  approvalType: {
    type: Number,
    default: 1,
  },
  /** 弹窗状态 */
  showOpinion: {
    type: Boolean,
    default: false,
  },
  opinionParams: {
    type: Object as PropType<{ orderId?: string; type?: string }>,
    default: {},
  },
});
const emits = defineEmits<{
  (e: 'onAfterSubmit'): void;
  (e: 'onAssetList', params: any): void;
  (e: 'onClose'): void;
}>();

const show = ref<boolean>(false);

const state = reactive<{
  comment?: string;
  type: string;
  orderId: string;
}>({
  comment: '',
  type: '',
  orderId: '',
});

const selected = ref<number>(1);

/** 提交 */
const handleCommit = async () => {
  if (!state.comment) {
    showInfo('请填写审批意见');
    return;
  }

  try {
    showLoading();
    await commonProcess({
      action: selected.value === 1 ? 5 : 3,
      code: 'materialPurchase',
      comment: state.comment,
      id: state.orderId,
      status: 1,
    });
    emits('onAfterSubmit');
    showInfo('提交成功');
    handleClose();
  } catch (e: any) {
    showInfo(e?.msg || '提交失败');
  } finally {
    hideLoading();
  }
};

const handleClose = () => {
  show.value = false;
  state.comment = undefined;
  state.orderId = '';
  emits('onClose');
};

watch(
  () => props.showOpinion,
  val => {
    show.value = val;
    if (val) {
      selected.value = props.opinionParams?.type === TypeEnum.Commit ? 1 : 2;
      state.orderId = props.opinionParams?.orderId || '';
    }
  },
);
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.opinion {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.opinion-header {
  display: flex;
  justify-content: center;
  font-size: 34rpx;
  color: $textDefaultColor;
  margin: 24rpx 0;
  font-weight: 500;
}
.opinion-scroll {
  height: 100%;
  flex: 1;
  overflow: hidden;
  &-inner {
    display: flex;
    flex-direction: column;
    padding: 0 32rpx 24rpx 32rpx;
    height: 100%;
  }
}
.textarea {
  background-color: rgba(0, 0, 0, 0.06);
  border-radius: 16rpx;
  flex: 1;
  font-size: 32rpx;
  line-height: 32rpx;
}
.opinion-bottom {
  padding: 24rpx 32rpx;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
}
.upload-file {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.notice-txt {
  padding: 24rpx 0;
  font-size: 26rpx;
  color: $textSecondaryColor;
}
.select-wrap {
  display: flex;
  padding-bottom: 24rpx;
  .selected {
    background: #e6f4ff;
    color: #1677ff;
  }
  &-btn {
    height: 80rpx;
    line-height: 80rpx;
    flex: 1;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 8rpx;
    text-align: center;
    font-size: 30rpx;
    font-style: normal;
    &:first-child {
      margin-right: 24rpx;
    }
  }
}
</style>
