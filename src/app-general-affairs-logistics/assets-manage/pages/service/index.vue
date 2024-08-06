<!-- 资产维修 -->
<template>
  <page custom-overflow="visible">
    <view
      class="main"
      :class="
        detailData?.status === StatusEnum.Approve && isApprovedUser ? 'btn-main ' : 'no-btn-main'
      "
    >
      <view v-if="detailData" class="head">
        <view class="head-top"
          ><view class="head-title">资产维修</view>
          <StatusTag :status="detailData?.status" :type="RecordTypeEnum.ServiceRecord" /> </view
        ><view class="head-bottom">{{ detailData?.taskCode }}</view>
      </view>
      <template v-if="detailData?.status === StatusEnum.Approve && isApprovedUser">
        <view class="form">
          <u-field
            v-model="formState.repairTime"
            required
            label="维修日期"
            placeholder="请选择"
            right-icon="arrow-right"
            disabled
            input-align="right"
            @click="show = true"
          >
          </u-field>
          <u-field
            v-model="formState.repairAmount"
            label="维修金额（元）"
            placeholder="请输入"
            label-width="200"
            maxlength="20"
            input-align="right"
            type="digit"
            :clearable="false"
            @blur="(e: any) => handleNumberBlur(e.detail.value)"
          >
          </u-field>
          <u-field
            v-model="formState.personName"
            label="维修人"
            placeholder="请选择"
            right-icon="arrow-right"
            disabled
            input-align="right"
            @click="handleSelectPersons"
          >
          </u-field>
          <u-field
            v-model="formState.repairName"
            label="维修单位"
            placeholder="请选择"
            right-icon="arrow-right"
            label-width="200"
            input-align="right"
            disabled
            @click="showSupplier = true"
          >
          </u-field>
          <u-field
            v-model="formState.repairTel"
            label="外部承修联系电话"
            placeholder="请输入"
            label-width="240"
            maxlength="30"
            input-align="right"
          >
          </u-field>
          <u-field
            v-model="formState.repairRemark"
            type="textarea"
            required
            label="维修说明"
            placeholder="请输入"
            maxlength="200"
            input-align="right"
          >
          </u-field>
        </view>
        <UploadImg
          :max-count="5"
          :max-size="5"
          :default-file-list="imgList"
          @afterUpload="imgAfterUpload"
        ></UploadImg
      ></template>
      <template v-else>
        <view class="detail-text">
          <view class="main-item">
            <view class="main-item-title">维修时间</view>
            <view class="main-item-content">{{
              detailData?.repairTime ? dayjs(detailData?.repairTime).format('YYYY-MM-DD') : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">维修金额（元）</view>
            <view class="main-item-content">{{
              detailData?.repairAmount ? detailData?.repairAmount : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">维修人</view>
            <view class="main-item-content">{{
              detailData?.repairPersonName ? detailData?.repairPersonName : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">维修单位</view>
            <view class="main-item-content">{{
              detailData?.supplierDetail?.name ? detailData?.supplierDetail?.name : '/'
            }}</view>
            <u-icon
              v-if="detailData?.supplierDetail"
              name="info-circle"
              color="#00000073"
              size="38"
              @click="showSupplierDetail = true"
            ></u-icon>
          </view>
          <view class="main-item">
            <view class="main-item-title">外部承修联系电话</view>
            <view class="main-item-content">{{
              detailData?.repairTel ? detailData?.repairTel : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">维修说明</view>
            <view class="main-item-content">{{
              detailData?.repairRemark ? detailData?.repairRemark : '/'
            }}</view>
          </view>
          <view v-if="detailData?.taskImgList.length > 0" class="upload-img">
            <view style="margin-bottom: 24rpx">图片</view>
            <view class="upload-img-wrap">
              <view
                v-for="(img, index) in detailData?.taskImgList"
                :key="img.fileId"
                class="upload-img-item"
                @click="handleClickImgs(detailData?.taskImgList, 'url', index)"
              >
                <u-image
                  :src="img.url"
                  width="142"
                  height="142"
                  border-radius="16"
                  mode="aspectFill"
                >
                </u-image
              ></view>
            </view>
          </view>
        </view>
      </template>
      <template v-if="detailData">
        <view class="detail-text">
          <view style="font-weight: bold">报修信息</view>
          <view class="main-item">
            <view class="main-item-title">申请日期</view>
            <view class="main-item-content">{{
              dayjs(detailData?.applyTime).format('YYYY-MM-DD')
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">申请人</view>
            <view class="main-item-content">{{ detailData?.applyUserName }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">申请部门</view>
            <view class="main-item-content">{{
              detailData?.department ? detailData?.department : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">紧急程度</view>
            <view class="main-item-content">{{
              detailData?.urgencyName ? detailData?.urgencyName : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">期望完成维修日期</view>
            <view class="main-item-content">{{
              detailData?.hopeTime ? dayjs(detailData?.hopeTime).format('YYYY-MM-DD') : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">故障描述</view>
            <view class="main-item-content">{{
              detailData?.faultDesc ? detailData?.faultDesc : '/'
            }}</view>
          </view>
          <view class="main-item">
            <view class="main-item-title">预算金额（元）</view>
            <view class="main-item-content">{{
              detailData?.expectAmount ? detailData?.expectAmount : '/'
            }}</view>
          </view>
          <view v-if="detailData?.imagesList.length > 0" class="upload-img">
            <view style="margin-bottom: 24rpx">图片</view>
            <view class="upload-img-wrap">
              <view
                v-for="(img, index) in detailData?.imagesList"
                :key="img.fileId"
                class="upload-img-item"
                @click="handleClickImgs(detailData?.imagesList, 'url', index)"
              >
                <u-image
                  :src="img.url"
                  width="142"
                  height="142"
                  border-radius="16"
                  mode="aspectFill"
                >
                </u-image
              ></view>
            </view>
          </view>
        </view>
        <view v-if="detailData?.attachList.length" class="upload-file">
          <view class="upload-file-head"><view>附件</view></view>
          <attachments-list
            :file-data="detailData?.attachList"
            :show-view-btn="false"
            field-file-name="name"
            field-file-url="url"
          />
        </view>
        <asset-detail-list :asset-list="detailData?.assetList" />
      </template>
      <approve-flow
        ref="approveFlowRef"
        :order-id="pageParams?.orderId"
        :type="TypeEnum.AssetManager"
      />
    </view>
    <u-calendar
      v-model="show"
      max-date="2050-12-30"
      :min-date="dayjs().format('YYYY-MM-DD')"
      mode="date"
      @change="change"
    ></u-calendar>

    <u-select
      v-model="showSupplier"
      mode="single-column"
      :list="suppliers"
      @confirm="onConfirmSupplier"
    ></u-select>
    <view
      v-if="detailData?.status === StatusEnum.Approve && isApprovedUser"
      class="footer-bottom"
    ></view>
    <view v-if="detailData?.status === StatusEnum.Approve && isApprovedUser" class="footer">
      <u-button
        style="flex: 1"
        :custom-style="{ color: '#1677ff', marginRight: '12rpx' }"
        @click="submit('Y')"
        >完成维修</u-button
      >
      <u-button style="flex: 1" :custom-style="{ color: '#1677ff' }" @click="submit('N')"
        >不维修</u-button
      >
    </view>
    <SupplierPopup
      :show="showSupplierDetail"
      :name="detailData?.supplierDetail?.name"
      :code="detailData?.supplierDetail?.code"
      :tel="detailData?.supplierDetail?.tel"
      :address="detailData?.supplierDetail?.address"
      :remark="detailData?.supplierDetail?.notes"
      @close="showSupplierDetail = false"
    ></SupplierPopup>
    <u-modal
      v-model="showModal"
      :content="`确认${submitType === 'Y' ? '完成' : '不'}维修吗？`"
      :show-cancel-button="true"
      @confirm="confirm"
      @cancel="showModal = false"
    ></u-modal>
  </page>
</template>

<script setup lang="ts">
import AssetDetailList from '@/app-general-affairs-logistics/assets-manage/components/AssetDetailList.vue';
import StatusTag from '@/app-general-affairs-logistics/assets-manage/components/StatusTag.vue';
import {
  assetAssetRepairTask,
  getAssetAssetRepairTaskDetail,
} from '@/app-general-affairs-logistics/assets-manage/services/repair';
import { RecordTypeEnum } from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import { handleClickImgs } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import { TypeEnum } from '@/app-general-affairs-logistics/components/approve-flow/constants';
import ApproveFlow from '@/app-general-affairs-logistics/components/approve-flow/index.vue';
import AttachmentsList from '@/app-general-affairs-logistics/components/attachments-list/index.vue';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { loginStore } from '@/store/modules/login';
import { omit } from '@/utils/lodash-es';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, ref } from 'vue';
import SupplierPopup from '../../components/SupplierPopup';
import UploadImg from '../../components/UploadImg';
import { getAssetSuppliers } from '../../services/common.ts';
import { StatusEnum } from '../../utils/constants';
import { fixNumber, sp_round } from '../../utils/tools';

const store = loginStore();
const { userInfo } = store;
const show = ref<boolean>(false);
const detailData = ref<any>();
const pageParams = ref<{ orderId?: string }>();

const flowStatus = ref<number>(); // 流程状态
const approveFlowRef = ref();
const isApprovedUser = ref<boolean>(false);

const showModal = ref<boolean>(false);
const submitType = ref<string>('Y');
const suppliers = ref<any>([]);
const showSupplier = ref<boolean>(false);
const showSupplierDetail = ref<boolean>(false);

const formState = ref({
  repairTime: dayjs().format('YYYY-MM-DD'),
  repairAmount: undefined,
  repairPersonName: undefined,
  personName: undefined,
  repairOrg: undefined,
  repairName: undefined,
  repairTel: undefined,
  repairRemark: undefined,
  taskImgList: [],
});
const getSuppliers = async () => {
  getAssetSuppliers({
    type: [2],
    currentPage: 1,
    pageSize: 999999,
  })
    .then((res: any) => {
      suppliers.value = (res?.list || []).map((i: any) => ({
        value: i.id,
        label: i.name,
        tel: i.tel,
      }));
    })
    .catch((error: any) => {
      if (error?.msg) {
        showInfo(error?.msg);
      }
    });
};
const onConfirmSupplier = (e: any) => {
  if (e?.[0]) {
    formState.value.repairOrg = suppliers.value[e?.[0].index].value;
    formState.value.repairName = suppliers.value[e?.[0].index].label;
    formState.value.repairTel = suppliers.value[e?.[0].index].tel;
  }
};
const getDetail = async () => {
  showLoading();
  getAssetAssetRepairTaskDetail(pageParams.value?.orderId || '')
    .then(res => {
      detailData.value = res;
      flowStatus.value = res?.status;
      /** 是否为审批人 */
      const taskAssigneeList = res?.flowTaskNodeModel?.taskAssigneeList;
      if (!taskAssigneeList?.length) isApprovedUser.value = false;
      isApprovedUser.value =
        taskAssigneeList?.findIndex(
          (v: { userId: string | undefined }) => v?.userId === userInfo?.userId,
        ) >= 0;
    })
    .finally(() => {
      uni.stopPullDownRefresh();
      hideLoading();
    });
};
onBeforeMount(() => {
  uni.setNavigationBarTitle({
    title: '维修单详情',
  });
  const params = getPageParams();
  pageParams.value = params || {};
  getSuppliers();
  getDetail();
});
onPullDownRefresh(() => {
  getDetail();
});

// 上传照片
const imgList = ref<any[]>([]);
// 加载中
const loading = ref<boolean>(false);
// 上传后回调
const imgAfterUpload = imgs => {
  imgList.value = imgs;
};
const change = (e: any) => {
  formState.value.repairTime = e.result;
};

// 使用人
const handleSelectPersons = () => {
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    callback: (value, data) => {
      formState.value.repairPersonName = value || '';
      formState.value.personName = data?.name || '';
    },
  });
};

// 前往审批列表
const goToApprove = () => {
  uni.navigateBack({
    delta: 1,
  });
};
const handleNumberBlur = (v: any) => {
  let _price = v;
  // 小程序可以输入多个.
  const _priceSplit = _price.split('.');
  if (_priceSplit.length > 2) {
    _price = `${_priceSplit[0]}.${_priceSplit[1]}`;
  }

  if (_price.length && +_price < 0.01) {
    _price = '0.01';
  }

  if (_price) {
    formState.value.repairAmount = sp_round(fixNumber(_price), 2);
  }
};
// 提交吐出表单
const submit = async (type: string) => {
  submitType.value = type;
  showModal.value = true;
};
let params = {};
const confirm = () => {
  if (submitType.value === 'Y') {
    if (!formState.value.repairTime) {
      uni.showToast({
        title: '请选择维修日期',
        icon: 'none',
      });
      return;
    }
    if (!formState.value.repairRemark) {
      uni.showToast({
        title: '请填写维修说明',
        icon: 'none',
      });
      return;
    }
    if (imgList.value.length) {
      formState.value.taskImgList = imgList.value.map(item => {
        return {
          fileId: item.fileId,
        };
      });
    }
    params = {
      ...omit(formState.value, ['personName']),
      repairStatus: 2,
      fId: detailData.value?.id,
    };
  } else {
    params = {
      repairStatus: 3,
      fId: detailData.value?.id,
    };
  }
  uni.showLoading();
  loading.value = true;
  assetAssetRepairTask(params)
    .then(res => {
      uni.hideLoading();
      uni.showToast({
        title: '审批成功！',
        icon: 'success',
      });
      goToApprove();
    })
    .catch(e => {
      uni.hideLoading();
      showInfo(e?.msg || '审批失败');
    })
    .finally(() => {
      showModal.value = false;
      loading.value = false;
    });
};
</script>

<style lang="scss" scoped>
@import '@/app-general-affairs-logistics/assets-manage/assets/style.scss';
.head {
  margin-bottom: 24rpx;
  display: flex;
  padding: 24rpx 32rpx;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  background: #fff;
  border-radius: 16rpx;
}
.head-top {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}
.head-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1 0 0;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  font-family: 'PingFang SC';
  font-size: 36rpx;
  font-style: normal;
  font-weight: 500;
  line-height: 52rpx;
}
.head-bottom {
  color: rgba(0, 0, 0, 0.45);
  font-family: 'PingFang SC';
  font-size: 24rpx;
  font-style: normal;
  font-weight: 400;
  line-height: 36rpx;
}
.page {
  position: relative;
  overflow: auto;
  // #ifdef H5
  height: calc(100vh - 88rpx);
  // #endif
  // #ifdef APP-PLUS || MP-WEIXIN
  height: 100vh;
  // #endif
}
.footer {
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
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
  .u-btn {
    flex: 1;
    color: $colorPrimaryBase;
    border-radius: 16rpx;
    margin-right: 16rpx;
  }
  :last-child {
    margin-right: 0;
  }
}
.footer-nav {
  display: flex;
}
.main {
  padding: 24rpx 32rpx;
  overflow: auto;
}
.form {
  border-radius: 16rpx;
  background: #fff;
}
.detail-text {
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  border-radius: 16rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.main-item {
  display: flex;
  gap: 24rpx;
  .main-item-title {
    color: rgba(0, 0, 0, 0.65);
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
    white-space: nowrap;
  }
  .main-item-content {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    color: rgba(0, 0, 0, 0.88);
    text-overflow: ellipsis;
    font-size: 28rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
  }
}
.upload-img {
  margin-top: 32rpx;

  .upload-img-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
}
.upload-file {
  padding: 32rpx;
  border-radius: 16rpx;
  background: #fff;
  margin-top: 24rpx;
}

.upload-file-head {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 16rpx 0;
  align-items: center;
}
</style>
