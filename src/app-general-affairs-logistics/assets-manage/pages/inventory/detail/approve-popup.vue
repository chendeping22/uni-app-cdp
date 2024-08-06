<template>
  <view>
    <u-popup
      v-model="show"
      mode="bottom"
      closeable
      height="70%"
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
      @close="handleClose"
      @open="show = true"
    >
      <view class="popup">
        <view class="popup-header">提交审核</view>
        <scroll-view scroll-y class="popup-scroll">
          <view class="popup-scroll-inner">
            <textarea
              v-model="state.comment"
              :maxlength="200"
              auto-height
              class="textarea"
              placeholder-class="textarea-placeholder"
              placeholder="请输入提交审核备注"
              @blur="handleChangeComment"
            ></textarea>
          </view>
        </scroll-view>
        <view class="popup-bottom">
          <u-button type="primary" :loading="loading" @click="handleBeforeCommit">提交</u-button>
        </view>
      </view>
    </u-popup>
    <u-modal
      v-model="showNoticeModal"
      :show-title="false"
      :content="noticeTxt"
      show-cancel-button
      show-confirm-button
      @confirm="handleCommit"
      @cancel="() => (showNoticeModal = false)"
    ></u-modal>
  </view>
</template>

<script setup lang="ts">
import { checkAssetInventory } from '@/app-general-affairs-logistics/assets-manage/services/operate-inventory';
import { showInfo } from '@/utils/tools';
import { reactive, ref } from 'vue';

interface IPopupParams {
  inventoryTaskId?: string;
  /** 未盘点数量 */
  noInventoryNum?: number;
  /** 审批人列表 */
  inventoryBys?: string[];
}

const emit = defineEmits(['onClose']);
const show = ref<boolean>(false);

const popupParams = ref<IPopupParams>(); // 弹窗参数
const state = reactive<{
  comment?: string;
}>({
  comment: '',
});

const showNoticeModal = ref<boolean>(false);
const noticeTxt = ref<string>('');
const loading = ref<boolean>(false);

/** 弹窗展示 */
const handleShowPopup = (params: IPopupParams) => {
  console.log('🚀 ~ handleShowPopup ~ params:', params);
  popupParams.value = params;
  show.value = true;
};

const handleBeforeCommit = () => {
  const count = popupParams.value?.noInventoryNum;
  const inventoryBys = popupParams.value?.inventoryBys?.length;
  if (!inventoryBys) {
    showInfo('当前未存在盘点人');
    return;
  }
  if (count && inventoryBys === 1) {
    showNoticeModal.value = true;
    noticeTxt.value = '存在未盘点资产，确认提交吗？';
    return;
  }
  if (inventoryBys && inventoryBys > 1) {
    showNoticeModal.value = true;
    noticeTxt.value = `当前任务有多人参与盘点${count ? '且存在未盘点资产' : ''}，确认提交吗？`;
    return;
  }
  showNoticeModal.value = false;
  noticeTxt.value = '';
  handleCommit();
};

/** 提交 */
const handleCommit = async () => {
  try {
    loading.value = true;
    const params = {
      woId: popupParams.value?.inventoryTaskId,
      comment: state.comment,
    };
    await checkAssetInventory(params);
    showInfo('提交审核成功');
    handleClose();
    emit('onClose');
  } catch (e: any) {
    showInfo(e?.msg || '提交审核失败');
  } finally {
    loading.value = false;
  }
};

const handleChangeComment = (e: any) => {
  const value = e.detail.value;
  // 清除头尾空格，连续空格替换为1个
  let _newValue = value.trim()?.replace(/ +/g, ' ');
  state.comment = _newValue.length ? _newValue : undefined;
};

const handleClose = () => {
  show.value = false;
  state.comment = undefined;
};

defineExpose({
  handleShowPopup,
  handleClose,
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.popup-header {
  display: flex;
  justify-content: center;
  font-size: 34rpx;
  color: $textDefaultColor;
  margin: 24rpx 0;
  font-weight: 500;
}
.popup-scroll {
  height: 100%;
  flex: 1;
  overflow: hidden;
  &-inner {
    padding: 0 32rpx 24rpx 32rpx;
    height: 100%;
  }
}
.popup-bottom {
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
.popup-picture {
  background-color: rgba(0, 0, 0, 0.04);
  height: 70%;
  border-radius: 32rpx;
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  //   padding: 32rpx;
  position: relative;
  &-view {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }
  &-bottom {
    position: absolute;
    z-index: 999;
    display: flex;
    bottom: 32rpx;
  }
  &-note {
    color: rgba(0, 0, 0, 0.45);
    margin-top: 16rpx;
  }
  &-btn {
    background-color: #ffffff;
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    box-shadow: 0 4px 8px 0 #00000029;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 16rpx;
  }
}
.textarea {
  background-color: rgba(0, 0, 0, 0.06);
  width: 100%;
  border-radius: 16rpx;
  padding: 32rpx;
  min-height: 100%;
  font-size: 32rpx;
  line-height: 32rpx;
}
.textarea-placeholder {
  color: rgba(0, 0, 0, 0.45);
  font-size: 28rpx;
}
</style>
