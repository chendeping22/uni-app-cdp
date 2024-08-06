<template>
  <view class="page">
    <view class="main">
      <view class="form">
        <u-field
          v-model="formState.disposalTime"
          required
          label="处置日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="() => (show = true)"
        >
        </u-field>
        <u-field
          v-model="formState.disposalUserName"
          required
          label="处置操作人"
          label-width="140"
          placeholder="请选择"
          :clearable="false"
          disabled
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.disposalTypeName"
          required
          label="处置类型"
          placeholder="请输入"
          input-align="right"
          right-icon="arrow-right"
          disabled
          @click="() => (showType = true)"
        >
        </u-field>
        <u-field
          v-model="formState.disposalAmount"
          label="处置金额(元)"
          label-width="160"
          placeholder="请输入"
          input-align="right"
          @blur="handleDisposalAmount"
        >
        </u-field>
        <u-field
          v-model="formState.assertUsage"
          type="textarea"
          label="处置备注"
          placeholder="请输入"
          maxlength="200"
          input-align="right"
        >
        </u-field>
      </view>
      <UploadImg
        :max-count="5"
        :max-size="5"
        :default-file-list="formState.imgList"
        @afterUpload="imgAfterUpload"
      ></UploadImg>
      <UploadFile
        :max-count="5"
        :max-size="20"
        :default-file-list="formState.fileList"
        @afterUpload="fileAfterUpload"
      ></UploadFile>
      <AssetSelectedAndScanList
        :assets-list="formState?.itemDTOList"
        :api-query="{
          excludeAssetStatuses: [
            AssetStatus.WaitingRepair,
            AssetStatus.Repair,
            AssetStatus.Disposed,
            AssetStatus.Approve,
          ],
        }"
        :order-type="RecordTypeEnum.DisposeRecord"
        @onSelectList="handleSelectList"
      />
    </view>
    <u-calendar v-model="show" mode="date" max-date="2050-12-30" @change="change"></u-calendar>
    <view class="footer">
      <u-image
        :src="listIcon"
        width="36"
        height="36"
        :show-loading="false"
        :fade="false"
        style="margin-right: 8rpx"
        @click="handleToApprove"
      ></u-image>
      <view style="margin-right: 24rpx" @click="handleToApprove">审批列表</view>
      <u-button type="primary" :loading="loading" :style="{ flex: 1 }" @click="submit"
        >提交</u-button
      >
      <u-modal
        v-model="showModal"
        content="确认放弃提交吗？"
        show-cancel-button
        show-confirm-button
        @confirm="handleToList"
        @cancel="() => (showModal = false)"
      ></u-modal>
    </view>
    <u-select
      v-model="showType"
      :list="typeList"
      safe-area-inset-bottom
      @cancel="() => (showType = false)"
      @confirm="handleTypeConfirm"
    ></u-select>
  </view>
</template>

<script setup lang="ts">
import AssetSelectedAndScanList from '@/app-general-affairs-logistics/assets-manage/components/AssetSelectedAndScanList.vue';
import UploadFile from '@/app-general-affairs-logistics/assets-manage/components/UploadFile.vue';
import UploadImg from '@/app-general-affairs-logistics/assets-manage/components/UploadImg.vue';
import {
  getAssetDisposalsDetails,
  saveAssetDisposals,
} from '@/app-general-affairs-logistics/assets-manage/services/dispose';
import {
  AssetStatus,
  RecordTypeEnum,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import listIcon from '@/app-general-affairs-logistics/static/assets-manage/list.svg';
import { loginStore } from '@/store/modules/login';
import { cloneDeep, isNil, map, omit } from '@/utils/lodash-es';
import { getFormatDate, getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { onBeforeMount, reactive, ref } from 'vue';

import dayjs from 'dayjs';
import { getAssetDisposalsList } from '../../services/dispose';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';

// 资产库跳转过来必须带上当前资产
const assetDetailToCreateStore = useAssetDetailToCreate();

/** 新增数据类型 */
type IForm = {
  disposalTime?: string | number;
  disposalUserName?: string;
  disposalUserId?: string;
  disposalType?: string | number;
  disposalTypeName?: string;
  disposalAmount?: number | string;
  assertUsage?: string;
  imgList?: Record<string, any>[];
  fileList?: Record<string, any>[];
  itemDTOList?: any[];
};

/** 编辑数据类型 */
type IDetail = {
  images: any[];
  attach: any[];
  assetItemList: any[];
} & IForm;

const store = loginStore();
const { userInfo } = store || {};
const show = ref<boolean>(false);
const formState = reactive<IForm>({
  disposalTime: dayjs().format('YYYY-MM-DD'),
  disposalUserName: userInfo?.name,
  disposalUserId: userInfo?.id,
  disposalTypeName: undefined,
  disposalType: undefined,
  disposalAmount: undefined,
  assertUsage: undefined,
  imgList: [],
  fileList: [],
  itemDTOList: [],
});

// 加载中
const loading = ref<boolean>(false);
const showModal = ref<boolean>(false);
const showType = ref<boolean>(false);
const typeList = ref<{ label: string; value: string }[]>([]);

const handleDisposalAmount = (e: any) => {
  const val = +(e.detail.value ?? 0);
  if (!(val && typeof val === 'number')) {
    formState.disposalAmount = undefined;
    return;
  }
  if (val < 0) {
    formState.disposalAmount = undefined;
    return;
  }
  formState.disposalAmount = val?.toFixed(2);
};

const handleTypeConfirm = (val: any[]) => {
  formState.disposalType = val?.[0]?.value;
  formState.disposalTypeName = val?.[0]?.label;
};

const handleInitData = (data?: IDetail) => {
  formState.disposalTime = getFormatDate(data?.disposalTime);
  formState.disposalUserName = data?.disposalUserName;
  formState.disposalUserId = data?.disposalUserId;
  formState.disposalType = data?.disposalType;
  formState.disposalTypeName = data?.disposalTypeName;
  formState.disposalAmount = data?.disposalAmount;
  formState.assertUsage = data?.assertUsage;
  formState.imgList = data?.images;
  formState.fileList = data?.attach;
  formState.itemDTOList = data?.assetItemList;
};

/** 获取变更类型数据 */
const fetchChangeTypes = async () => {
  try {
    const res: any = await getAssetDisposalsList();
    typeList.value = res;
    formState.disposalType = typeList.value?.[0]?.value;
    formState.disposalTypeName = typeList.value?.[0]?.label;
  } catch (e: any) {
    typeList.value = [];
  }
};

onLoad((options: any) => {
  // 资产库跳转过来必须带上当前资产
  if (options.assetId && options.assetId === assetDetailToCreateStore.assetInfo.assetId) {
    const _asset = cloneDeep(assetDetailToCreateStore.assetInfo);
    formState.itemDTOList = [_asset] as any;
    assetDetailToCreateStore.$reset();
  }
  fetchChangeTypes();
});

onBeforeMount(() => {
  const { id } = getPageParams();
  if (!id) return;
  showLoading();
  getAssetDisposalsDetails(id)
    .then((res: any) => {
      if (res) {
        handleInitData(res);
      }
    })
    .finally(() => {
      hideLoading();
    });
});

// 上传后回调
const imgAfterUpload = (imgs: any[]) => {
  formState.imgList = imgs;
};
// 文件上传后回调
const fileAfterUpload = (files: any[]) => {
  formState.fileList = files;
};

const change = (e: any) => {
  formState.disposalTime = e.result;
};

const handleSelectList = (val: Record<string, any>[]) => {
  formState.itemDTOList = val;
};

// 提交吐出表单
const submit = async () => {
  if (!formState.disposalTime) {
    showInfo('请选择处置日期');
    return;
  }
  if (!formState.disposalUserId) {
    showInfo('请选择处置人');
    return;
  }
  if (isNil(formState.disposalType)) {
    showInfo('请选择处置类型');
    return;
  }

  if (!formState.itemDTOList?.length) {
    showInfo('请选择要处置的资产');
    return;
  }
  const formData = cloneDeep(formState);
  formData.itemDTOList = map(formState.itemDTOList, v => ({ assetId: v?.assetId }));
  formData.imgList = map(formState.imgList, v => ({ fileId: v?.fileId }));
  formData.fileList = map(formState.fileList, v => ({ fileId: v?.fileId }));

  const params = {
    ...omit(formData, ['itemDTOList', 'fileList', 'imgList']),
    assetDisposalItemList: formData.itemDTOList,
    attach: formData.fileList,
    images: formData.imgList,
  };
  uni.showLoading();
  loading.value = true;
  saveAssetDisposals(params)
    .then(() => {
      uni.hideLoading();
      showInfo('处置成功');
      handleToList();
    })
    .catch(e => {
      uni.hideLoading();
      showInfo(e?.msg || '处置失败');
    })
    .finally(() => {
      loading.value = false;
    });
};

/** 审批列表 */
const handleToList = () => {
  const { type } = getPageParams();
  if (type === 'home') {
    uni.redirectTo({
      url: `/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=${RecordTypeEnum.DisposeRecord}`,
    });
  } else {
    uni.navigateBack({
      delta: 1,
    });
  }
};

const handleToApprove = () => {
  if (formState?.itemDTOList?.length) {
    showModal.value = true;
    return;
  }
  handleToList();
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  overflow: auto;
}
.footer {
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: #fff;
  box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.08);
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.main {
  padding: 24rpx 32rpx;
  // #ifdef H5
  height: calc(100vh - 216rpx);
  // #endif
  // #ifdef APP-PLUS || MP-WEIXIN
  height: calc(100vh - 128rpx - env(safe-area-inset-bottom));
  height: calc(100vh - 128rpx - constant(safe-area-inset-bottom));
  // #endif
  overflow: auto;
}
.form {
  border-radius: 16rpx;
  background: #fff;
}
.upload-file {
  padding: 0 32rpx;
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
.file-list {
  overflow: hidden;
  padding-right: 24rpx;
}
.file-item {
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 24rpx 32rpx;
}
.file-item-icon {
  height: 48rpx;
  width: 48rpx;
  display: block;
}
.file-item-name {
  margin: 0 32rpx 0 36rpx;
  flex: 1;
  color: rgba(0, 0, 0, 0.88);
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.file-item-delete {
  color: #1677ff;
  font-size: 26rpx;
}
</style>
