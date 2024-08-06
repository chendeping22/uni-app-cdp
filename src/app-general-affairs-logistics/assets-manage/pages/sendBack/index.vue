<template>
  <view class="page">
    <view class="main">
      <view class="form">
        <u-field
          v-model="formState.returnDate"
          required
          label="退还日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="selectDate('use')"
        >
        </u-field>
        <u-field
          v-model="formState.returnUserName"
          required
          label="领用人"
          placeholder="请选择"
          :right-icon="isAdminStore.isAdmin ? 'arrow-right' : undefined"
          :clearable="false"
          disabled
          input-align="right"
          @click="handleSelectPersons"
        >
        </u-field>
        <u-field
          v-model="formState.deptName"
          required
          label="领用部门"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          :clearable="false"
          input-align="right"
          @click="showDepartment = true"
        >
        </u-field>
        <u-field
          v-model="formState.spaceName"
          label="退还后所在空间"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          label-width="200"
          input-align="right"
          @click="handleSelectSpace"
        >
        </u-field>
        <u-field
          v-model="formState.placeAfterReturn"
          label="退还后存放位置"
          placeholder="请输入"
          label-width="200"
          maxlength="30"
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.assertUsage"
          type="textarea"
          label="退还备注"
          placeholder="请输入"
          maxlength="200"
          input-align="right"
          :border-bottom="false"
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
          assetStatuses: [AssetStatus.InUse],
          recipientIdList: [formState.returnUserId],
        }"
        :order-type="RecordTypeEnum.SendBackRecord"
        @onSelectList="handleSelectList"
      />
    </view>
    <SelectorUserDepartment
      :show-department="showDepartment"
      :user-id="formState.returnUserId || ''"
      @reset-value="getDepartment"
      @cancel="showDepartment = false"
    ></SelectorUserDepartment>
    <u-calendar
      v-model="show"
      max-date="2050-12-30"
      :min-date="dateType === 'back' ? formState.returnDate : '1950-01-01'"
      mode="date"
      @change="change"
    ></u-calendar>
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
        title=""
        content="确认放弃提交吗？"
        show-cancel-button
        show-confirm-button
        @confirm="handleToList"
        @cancel="() => (showModal = false)"
      ></u-modal>
    </view>
  </view>
</template>

<script setup lang="ts">
import AssetSelectedAndScanList from '@/app-general-affairs-logistics/assets-manage/components/AssetSelectedAndScanList.vue';
import SelectorUserDepartment from '@/app-general-affairs-logistics/assets-manage/components/SelectorUserDepartment.vue';
import UploadFile from '@/app-general-affairs-logistics/assets-manage/components/UploadFile.vue';
import UploadImg from '@/app-general-affairs-logistics/assets-manage/components/UploadImg.vue';
import {
  getAssetAcceptanceReturnCreate,
  getAssetAcceptanceReturnDetails,
} from '@/app-general-affairs-logistics/assets-manage/services/sendBack';
import {
  AssetStatus,
  RecordTypeEnum,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import listIcon from '@/app-general-affairs-logistics/static/assets-manage/list.svg';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { loginStore } from '@/store/modules/login';
import { cloneDeep, map, omit } from '@/utils/lodash-es';
import { getFormatDate, getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, reactive, ref } from 'vue';
import { useAdmin } from '../../store/useAdmin';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';

// 资产库跳转过来必须带上当前资产
const assetDetailToCreateStore = useAssetDetailToCreate();

/** 新增数据类型 */
type IForm = {
  returnDate?: string | number;
  returnUserName?: string;
  returnUserId: string;
  deptId?: string;
  deptName?: string;
  spaceId?: string;
  spaceName?: string;
  placeAfterReturn?: string;
  assertUsage?: string;
  imgList?: Record<string, any>[];
  fileList?: Record<string, any>[];
  itemDTOList?: any[];
};

/** 编辑数据类型 */
type IDetail = {
  images: any[];
  attach: any[];
  assetAcceptanceReturnAssetInfoList: any[];
} & IForm;

const isAdminStore = useAdmin();
const store = loginStore();
const { userInfo } = store || {};
const show = ref<boolean>(false);
const formState = reactive<IForm>({
  returnDate: dayjs().format('YYYY-MM-DD'),
  returnUserName: userInfo?.name,
  returnUserId: userInfo?.id || '',
  deptId: userInfo?.deptId,
  deptName: userInfo?.deptName,
  spaceId: undefined,
  spaceName: undefined,
  placeAfterReturn: undefined,
  assertUsage: undefined,
  imgList: [],
  fileList: [],
  itemDTOList: [],
});
const dateType = ref<'use' | 'back'>('use');
const showDepartment = ref<boolean>(false);
// 加载中
const loading = ref<boolean>(false);
const showModal = ref<boolean>(false);

const handleInitData = (data?: IDetail) => {
  formState.returnDate = getFormatDate(data?.returnDate);
  formState.returnUserName = data?.returnUserName;
  formState.returnUserId = data?.returnUserId || '';
  formState.deptId = data?.deptId;
  formState.deptName = data?.deptName;
  formState.spaceId = data?.spaceId;
  formState.spaceName = data?.spaceName;
  formState.placeAfterReturn = data?.placeAfterReturn;
  formState.assertUsage = data?.assertUsage;
  formState.imgList = map(data?.images, v => ({ ...v, name: v?.fileName, url: v?.fileUrl }));
  formState.fileList = map(data?.attach, v => ({ ...v, name: v?.fileName, url: v?.fileUrl }));
  formState.itemDTOList = map(data?.assetAcceptanceReturnAssetInfoList, v => ({
    ...v,
    assetInfoImgVOList: v?.assetInfoImgVOList,
  }));
};

onLoad((options: any) => {
  // 资产库跳转过来必须带上当前资产
  if (options.assetId && options.assetId === assetDetailToCreateStore.assetInfo.assetId) {
    const _asset = cloneDeep(assetDetailToCreateStore.assetInfo);
    formState.itemDTOList = [_asset] as any;
    if (_asset.recipientId) {
      formState.returnUserId = _asset.recipientId;
      formState.returnUserName = _asset.recipientName;
    }
    assetDetailToCreateStore.$reset();
  }
});

onBeforeMount(() => {
  const { id } = getPageParams();
  if (!id) return;
  showLoading();
  getAssetAcceptanceReturnDetails(id)
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

const selectDate = (type: 'use' | 'back') => {
  if (type === 'back' && !formState.returnDate) {
    uni.showToast({
      title: '请先选择领用日期',
      icon: 'none',
    });
    return;
  }
  dateType.value = type;
  show.value = true;
};
const change = (e: any) => {
  if (dateType.value === 'use') {
    formState.returnDate = e.result;
  }
};

// 使用人
const handleSelectPersons = () => {
  // 普通人员不允许选人
  if (!isAdminStore.isAdmin) return;
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: formState.returnUserId,
    callback: (value: any, data: any) => {
      console.log(data);
      formState.returnUserId = value || '';
      formState.returnUserName = data?.name || '';
      formState.itemDTOList = [];
      if (!value) {
        formState.deptId = '';
        formState.deptName = '';
      }
    },
  });
};

const handleSelectSpace = () => {
  showSelector({
    type: SelectorTypeEnum.space,
    multiple: false,
    value: formState.spaceId,
    callback: (value: any, data: any) => {
      formState.spaceId = value || '';
      formState.spaceName = data?.name || '';
    },
  });
};

const getDepartment = (val: any) => {
  formState.deptId = val.value;
  formState.deptName = val.label;
};

const handleSelectList = (val: Record<string, any>[]) => {
  formState.itemDTOList = val;
};

// 提交吐出表单
const submit = async () => {
  if (!formState.returnDate) {
    showInfo('请选择退还日期');
    return;
  }
  if (!formState.returnUserId) {
    showInfo('请选择领用人');
    return;
  }
  if (!formState.deptId) {
    showInfo('请选择部门');
    return;
  }
  if (!formState.itemDTOList?.length) {
    showInfo('请选择要退还的资产');
    return;
  }
  const formData = cloneDeep(formState);
  formData.itemDTOList = map(formState.itemDTOList, item => ({ assetId: item.assetId }));
  formData.imgList = map(formState?.imgList, item => ({ fileId: item?.fileId }));
  formData.fileList = map(formState.fileList, item => ({ fileId: item.fileId }));
  const params = {
    ...omit(formData, ['deptName', 'itemDTOList', 'fileList', 'imgList', 'spaceName']),
    assetAcceptanceReturnItem: formData.itemDTOList,
    attach: formData.fileList,
    images: formData.imgList,
  };
  uni.showLoading();
  loading.value = true;
  getAssetAcceptanceReturnCreate(params)
    .then(res => {
      uni.hideLoading();
      showInfo('退还成功');
      handleToList();
    })
    .catch(e => {
      uni.hideLoading();
      showInfo(e?.msg || '退还失败');
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
      url: `/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=${RecordTypeEnum.SendBackRecord}`,
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
  background: #fff;
  z-index: 2;
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
