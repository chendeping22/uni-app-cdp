<template>
  <view>
    <u-popup
      v-model="show"
      mode="bottom"
      closeable
      height="90%"
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
      @close="handleClose"
      @open="show = true"
    >
      <view class="opinion">
        <view class="opinion-header">{{ popupTitle }}</view>
        <scroll-view scroll-y class="opinion-scroll">
          <view class="opinion-scroll-inner">
            <u-card
              title="审批意见"
              :show-foot="false"
              :head-style="{
                'background-color': 'rgba(0, 0, 0, 0.15)',
                'border-radius': '16rpx 16rpx 0 0',
              }"
              border-radius="32"
              full
              margin="0"
            >
              <template #body>
                <u-input
                  v-model="state.comment"
                  type="textarea"
                  maxlength="200"
                  clearable
                  placeholder="请输入审批意见"
                ></u-input>
              </template>
            </u-card>
            <UploadFile
              :max-count="5"
              :max-size="20"
              :default-file-list="state.files"
              @afterUpload="fileAfterUpload"
            ></UploadFile>
            <view class="notice-txt"
              >支持上传文档（pdf、doc、docx、xls、xlsx、txt、wps），最多可上传5个附件，每个附件不超过20MB</view
            >
          </view>
        </scroll-view>
        <view class="opinion-bottom">
          <u-button type="primary" @click="handleCommit">确认{{ popupTitle }}</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import { PropType, reactive, ref, watch } from 'vue';
import {
  getApprovalWorkOrderCommit,
  getWorkOrderCommit,
  getWorkOrderReject,
} from '../services/approve-operate';
import UploadFile from './UploadFile.vue';

interface IFile {
  fileId: string;
  name: string;
  url: string;
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
    type: String,
    default: 'common',
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

const popupTitle = ref<string>('同意');

const state = reactive<{
  comment?: string;
  files?: IFile[];
  type: string;
  orderId: string;
}>({
  comment: '',
  files: undefined,
  type: '',
  orderId: '',
});

const fileAfterUpload = (files: IFile[]) => {
  state.files = files;
};
/** 提交 */
const handleCommit = async () => {
  const params = {
    orderId: state.orderId,
    data: {
      comment: state.comment,
      fileIds: state.files,
      woId: state.orderId,
    },
  };
  if (state.type === TypeEnum.Reject && !state.comment) {
    showInfo('请填写审批意见');
    return;
  }

  try {
    showLoading();
    if (
      state.type === TypeEnum.Commit &&
      props.approvalType === 'purchases' &&
      props.detailData.purchaseStatus === 1
    ) {
      emits('onAssetList', params);
    } else {
      await (state.type === TypeEnum.Commit
        ? props.approvalType === 'common'
          ? getWorkOrderCommit(params)
          : getApprovalWorkOrderCommit(params)
        : getWorkOrderReject(params));
      showInfo('提交成功');
      handleClose();
      emits('onAfterSubmit');
    }
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
  state.files = [];
  emits('onClose');
};

watch(
  () => props.showOpinion,
  val => {
    show.value = val;
    if (val) {
      state.type = props.opinionParams?.type || '';
      state.orderId = props.opinionParams?.orderId || '';
      const title = props.opinionParams?.type === TypeEnum.Commit ? '同意' : '驳回';
      popupTitle.value = title;
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
    padding: 0 32rpx 24rpx 32rpx;
  }
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
</style>
