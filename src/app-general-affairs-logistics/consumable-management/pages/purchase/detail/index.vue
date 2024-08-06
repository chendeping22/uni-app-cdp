<template>
  <page custom-overflow="visible" class="material-page">
    <view v-if="Object.keys(detailData).length" class="material-detail">
      <u-image
        v-if="pageParams.type === DetailEnum.Apply"
        class="status-icon"
        :src="getStatusImg()"
        width="112"
        height="112"
        :show-loading="false"
        :fade="false"
      ></u-image>
      <DetailCard :data="cardData" />
      <DetailCollapse
        v-if="!showForm"
        title="采购明细"
        :detail-config="detailConfig(pageParams.type)"
        :detail-data="detailData?.items"
      />

      <form-card v-else style="margin-top: 24rpx" title="采购明细">
        <template #content>
          <DetailInput v-model:value="formState.items" />
        </template>
      </form-card>
      <form-card
        v-if="showForm || detailData?.purchaseStatus === 1"
        style="margin-top: 24rpx"
        title="采购记录"
      >
        <template #content>
          <u-field
            v-model="formState.purchaseUser"
            label="采购人"
            input-align="right"
            :clearable="false"
            disabled
          >
          </u-field>
          <u-field
            v-model="formState.purchaseDeptStr"
            label="所属部门"
            input-align="right"
            :clearable="false"
            disabled
          >
          </u-field>
          <u-field
            v-model="formState.purchaseTel"
            label="联系方式"
            input-align="right"
            :clearable="false"
            disabled
          >
          </u-field>
          <u-field
            v-model="formState.comment"
            type="textarea"
            :maxlength="50"
            label="摘要"
            placeholder="请填写摘要"
            input-align="right"
            :disabled="detailData?.purchaseStatus === 1"
            :trim="false"
            @blur="testInputEmptyAndSpecial(formState.comment)"
          >
          </u-field>
          <UploadFile
            v-if="detailData?.purchaseStatus === 0"
            :max-count="3"
            :max-size="10"
            :default-file-list="fileList"
            @afterUpload="fileAfterUpload"
          ></UploadFile>
          <view v-if="detailData?.fileList.length" class="upload-file">
            <view class="upload-file-head"><view>附件</view> </view>
            <attachments-list
              field-file-name="name"
              field-file-url="url"
              :file-data="detailData?.fileList"
              :show-view-btn="false"
            />
          </view>
        </template>
      </form-card>
      <approve-flow
        v-if="pageParams?.type === DetailEnum.Apply"
        ref="approveFlowRef"
        :order-id="detailData.workId"
        :type="TypeEnum.Common"
      />
    </view>
    <u-empty-custom v-else mode="data" :text="desc"></u-empty-custom>
    <view v-if="pageParams?.type !== DetailEnum.Apply && detailData?.purchaseStatus === 0">
      <template v-if="isApproveUser">
        <view class="foot-bottom"></view>
        <view class="foot">
          <template v-if="!showForm">
            <u-button style="flex: 1" :custom-style="footerItem" @click="showReturn = true"
              >退回</u-button
            >
            <u-button
              style="flex: 1"
              :custom-style="{ background: '#1677ff', color: '#fff' }"
              @click="showForm = true"
              >采购</u-button
            >
          </template>
          <template v-else>
            <u-button style="flex: 1" :custom-style="footerItem" @click="showForm = false"
              >取消</u-button
            >
            <u-button
              style="flex: 1"
              :custom-style="{ background: '#1677ff', color: '#fff' }"
              @click="purchaseSubmit"
              >提交</u-button
            >
          </template>
        </view>
      </template>
    </view>
    <detail-footer
      v-else
      :flow-status="detailData?.status"
      :order-id="pageParams?.id"
      :detail-data="detailData"
      @updateDetail="handleUpdate"
    />
    <u-popup
      v-model="showReturn"
      mode="bottom"
      closeable
      height="30%"
      border-radius="14"
      safe-area-inset-bottom
      close-icon-size="32"
      close-icon-color="rgba(0, 0, 0, 0.88)"
      @close="popupClose"
      @open="showReturn = true"
    >
      <view class="opinion">
        <view class="opinion-header">退回</view>
        <scroll-view scroll-y class="opinion-scroll">
          <view class="opinion-scroll-inner">
            <view class="input-wrap">
              <u-input
                v-model="comment"
                type="textarea"
                maxlength="50"
                clearable
                placeholder="请输入退回原因"
                :trim="false"
                @blur="testInputEmptyAndSpecial(comment)"
              ></u-input>
            </view>
          </view>
        </scroll-view>
        <view class="opinion-bottom">
          <u-button type="primary" @click="handleReturn">确定</u-button>
        </view>
      </view>
    </u-popup>
    <u-modal
      v-model="showPurchaseModal"
      content="确认提交？"
      show-cancel-button
      show-confirm-button
      @confirm="purchaseConfirm"
      @cancel="() => (showPurchaseModal = false)"
    ></u-modal>
  </page>
</template>

<script setup lang="ts">
import UploadFile from '@/app-general-affairs-logistics/assets-manage/components/UploadFile';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants.ts';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import DetailCard from '@/app-general-affairs-logistics/consumable-management/components/DetailCard.vue';
import DetailCollapse from '@/app-general-affairs-logistics/consumable-management/components/DetailCollapse/index.vue';
import DetailFooter from '@/app-general-affairs-logistics/consumable-management/components/DetailFooter.vue';
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import {
  commonProcess,
  getMaterialPurchasesDetails,
  saveMaterialPurchases,
} from '@/app-general-affairs-logistics/consumable-management/services/purchase';
import { testInputEmptyAndSpecial } from '@/app-general-affairs-logistics/consumable-management/utils/tools';
import adoptSVG from '@/app-general-affairs-logistics/static/consumable-management/adopt.svg';
import rejectSVG from '@/app-general-affairs-logistics/static/consumable-management/reject.svg';
import returnSVG from '@/app-general-affairs-logistics/static/consumable-management/return.svg';
import submittedSVG from '@/app-general-affairs-logistics/static/consumable-management/submitted.svg';
import { loginStore } from '@/store/modules/login';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onBackPress } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { find } from 'lodash-es';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { StatusEnum } from '../../../utils/constants';
import DetailInput from './DetailInput.vue';
import { detailConfig } from './detailConfig.ts';

enum DetailEnum {
  /** 申请 */
  Apply = '1',
  /** 清单 */
  List = '2',
}
const store = loginStore();
const { userInfo } = store || {};
const pageParams = ref<{ id: string; type: string }>({ id: '', type: '1' });
const detailData = ref<any>({});
const desc = ref<string>('');
const approveFlowRef = ref();

const showReturn = ref<boolean>(false);
const comment = ref<string>('');
const showForm = ref<boolean>(false);
const showPurchaseModal = ref<boolean>(false);
// 文件
const fileList = ref<any[]>([]);

/** 是否为审批人 */
const isApproveUser = computed(() => {
  const approverList = detailData.value.approverList;
  if (!approverList?.length) return false;
  return (
    approverList?.findIndex(
      (v: { userId: string | undefined }) => v?.userId === userInfo?.userId,
    ) >= 0
  );
});
const footerItem = {
  color: '#1677ff',
  marginRight: '16rpx',
  borderRadius: '16rpx',
};

const formState = reactive<any>({
  purchaseUser: userInfo?.name,
  purchaseUserId: userInfo?.id,
  purchaseTel: userInfo?.tel,
  purchaseDeptStr: userInfo?.deptName,
  fileIds: [],
  // time: dayjs().format('YYYY-MM-DD HH:mm'),
  items: [],
  // arrivalNoticeTime: null,
  comment: null,
  // academyId: null,
  // academyName: null,
});

// 文件上传后回调
const fileAfterUpload = files => {
  fileList.value = files;
  formState.fileIds = fileList.value.map(file => file.fileId);
};
const cardData = computed(() => [
  {
    title: '申请人信息',
    content: [
      { label: '采购单号', value: detailData.value?.code },
      { label: '申请人', value: detailData.value?.applyUser },
      { label: '所属部门', value: detailData.value?.deptName },
      {
        label: '申请时间',
        value: detailData.value?.createTime
          ? dayjs(detailData.value?.createTime).format('YYYY-MM-DD HH:mm')
          : '',
      },
    ],
  },
  {
    title: '请购信息',
    content: [
      {
        label: '期望到货日期',
        value: detailData.value?.arrivalNoticeTime
          ? dayjs(detailData.value?.arrivalNoticeTime).format('YYYY-MM-DD HH:mm')
          : '',
      },
      {
        label: '摘要',
        value: detailData.value?.requestRemark,
      },
      {
        label: userInfo?.locationType === 'K12' ? '所属学段' : '所属学院',
        value: detailData.value?.academyName,
      },
    ],
  },
]);

const getStatusImg = () => {
  switch (detailData.value.status) {
    case StatusEnum.Submitted:
      return submittedSVG;
    case StatusEnum.Reject:
      return rejectSVG;
    case StatusEnum.Return:
      return returnSVG;
    case StatusEnum.Adopt:
      return adoptSVG;
  }
};
const popupClose = () => {
  comment.value = '';
  showReturn.value = false;
};
const getDetail = async () => {
  showLoading();
  try {
    const res = await getMaterialPurchasesDetails(pageParams.value.id);
    detailData.value = res || {};
    formState.items = detailData.value.items;
    formState.comment = detailData.value.comment;
  } catch (e: any) {
    desc.value = e?.desc;
  } finally {
    hideLoading();
  }
};
const handleReturn = async () => {
  if (!comment.value) {
    showInfo('请填写退回原因');
    return;
  }
  try {
    showLoading();
    await commonProcess({
      action: 4,
      code: 'materialPurchase',
      comment: comment.value,
      id: pageParams.value?.id,
      status: 5,
    });
    showInfo('提交成功');
    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.desc || '提交失败');
  } finally {
    showReturn.value = false;
    hideLoading();
  }
};
const purchaseSubmit = () => {
  const purchase = find(detailData.value.items, v => v.purchasePrice !== 0 && !v.purchasePrice);
  if (purchase) {
    showInfo(`请填写${purchase.name}采购单价`);
    return;
  }
  showPurchaseModal.value = true;
};
const purchaseConfirm = async () => {
  try {
    showLoading();
    const params = {
      ...detailData.value,
      ...formState,
      purchaseStatus: 1,
    };
    await saveMaterialPurchases(params);
    showInfo('提交成功');
    uni.navigateBack();
    handleUpdate();
  } catch (e: any) {
    showInfo(e?.desc || '提交失败');
  } finally {
    showReturn.value = false;
    hideLoading();
  }
};
const handleUpdate = () => {
  getDetail();
  approveFlowRef.value?.getFlowTaskNodeHandleInfo();
};
onMounted(() => {
  const { id, type } = getPageParams();
  pageParams.value.id = id;
  pageParams.value.type = type || '1';

  if (pageParams.value.id) {
    getDetail();
  }
});
watch(
  () => [showForm.value, pageParams.value.type],
  () => {
    uni.setNavigationBarTitle({
      title: showForm.value
        ? '采购清单'
        : pageParams.value.type === DetailEnum.Apply
        ? '采购申请详情'
        : '采购清单详情',
    });
  },
  { deep: true },
);
onBackPress(e => {
  if (showForm.value) {
    showForm.value = false;
    return true;
  }
  return false;
});
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.material-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.status-icon {
  position: absolute;
  top: 24rpx;
  right: 32rpx;
}
.material-detail {
  position: relative;
  padding: 24rpx 32rpx;
  flex: 1;
}
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
.input-wrap {
  height: 200rpx;
  margin-bottom: 48rpx;
  padding: 24rpx 36rpx;
  border: 1rpx solid #0000000f;
  border-radius: 16rpx;
}

.upload-file {
  padding: 24rpx 32rpx;
  background: #fff;
}
.upload-file-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx 0;
  align-items: center;
}
:deep(.approval-comment-textarea .u-input__right-icon) {
  align-items: flex-start !important;
  padding-top: 8rpx !important;
}
</style>
