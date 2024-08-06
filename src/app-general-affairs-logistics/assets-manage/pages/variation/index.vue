<template>
  <view class="page">
    <view class="main">
      <view class="form">
        <u-field
          v-model="formState.applyUserName"
          required
          label="申请人"
          placeholder="请选择"
          right-icon="arrow-right"
          :clearable="false"
          disabled
          input-align="right"
          @click="handleSelectPersons"
        >
        </u-field>
        <u-field
          v-model="formState.departmentName"
          required
          label="申请部门"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          :clearable="false"
          input-align="right"
          @click="showDepartment = true"
        >
        </u-field>
        <u-field
          v-model="formState.applyTime"
          required
          label="申请日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          :clearable="false"
          input-align="right"
          @click="() => (show = true)"
        >
        </u-field>
        <u-field
          v-model="formState.methodDesc"
          required
          label="变更方式"
          placeholder="请选择"
          input-align="right"
          right-icon="arrow-right"
          disabled
          @click="() => (showMethod = true)"
        >
        </u-field>
        <u-field
          v-model="formState.spaceName"
          label="变更空间"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="handleSelectSpace"
        >
        </u-field>
        <u-field
          v-model="formState.place"
          label="变更位置"
          placeholder="请输入"
          maxlength="30"
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.reason"
          required
          type="textarea"
          label="变更原因"
          placeholder="请输入"
          maxlength="200"
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.content"
          type="textarea"
          label="变更内容"
          placeholder="请输入"
          maxlength="200"
          input-align="right"
        >
        </u-field>
      </view>
      <AssetSelectedAndScanList
        :assets-list="formState?.itemDTOList"
        :api-query="selectAssetParams"
        :order-type="RecordTypeEnum.VariationRecord"
        @onSelectList="handleSelectList"
      />
    </view>
    <SelectorUserDepartment
      :show-department="showDepartment"
      :user-id="formState.applyUserId || ''"
      @reset-value="getDepartment"
      @cancel="showDepartment = false"
    ></SelectorUserDepartment>

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
      <u-select
        v-model="showMethod"
        :list="methodsList"
        safe-area-inset-bottom
        @cancel="() => (showMethod = false)"
        @confirm="handleMethodConfirm"
      ></u-select>
    </view>
  </view>
</template>

<script setup lang="ts">
import AssetSelectedAndScanList from '@/app-general-affairs-logistics/assets-manage/components/AssetSelectedAndScanList.vue';
import SelectorUserDepartment from '@/app-general-affairs-logistics/assets-manage/components/SelectorUserDepartment.vue';
import {
  getAssetChangeDetails,
  saveAssetAssetChange,
} from '@/app-general-affairs-logistics/assets-manage/services/variation.ts';
import {
  AssetStatus,
  RecordTypeEnum,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import listIcon from '@/app-general-affairs-logistics/static/assets-manage/list.svg';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { loginStore } from '@/store/modules/login';
import { cloneDeep, isNil, map, omit } from '@/utils/lodash-es';
import { getFormatDate, getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { onBeforeMount, reactive, ref } from 'vue';

import dayjs from 'dayjs';
import { getChangeTypeList } from '../../services/variation';
import { useAdmin } from '../../store/useAdmin';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';

// 资产库跳转过来必须带上当前资产
const assetDetailToCreateStore = useAssetDetailToCreate();

/** 新增数据类型 */
type IForm = {
  applyTime?: string | number;
  applyUserName?: string;
  applyUserId?: string;
  department?: string;
  departmentName?: string;
  spaceId?: string;
  spaceName?: string;
  place?: string; // 变更位置
  itemDTOList?: any[];
  method?: string; // 变更方式id
  methodDesc?: string; // 变更方式描述
  reason?: string; // 变更原因
  content?: string; // 变更内容
};

/** 编辑数据类型 */
type IDetail = {
  id?: string;
  changeItemList: any[];
} & IForm;

const isAdminStore = useAdmin();
const store = loginStore();
const { userInfo } = store || {};
const show = ref<boolean>(false);
const formState = reactive<IForm>({
  applyTime: dayjs().format('YYYY-MM-DD'),
  applyUserName: userInfo?.name,
  applyUserId: userInfo?.id,
  department: userInfo?.department,
  departmentName: userInfo?.departmentName,
  spaceId: undefined,
  spaceName: undefined,
  place: undefined,
  reason: undefined,
  content: undefined,
  itemDTOList: [],
  method: undefined,
  methodDesc: undefined,
});

const showDepartment = ref<boolean>(false);
// 加载中
const loading = ref<boolean>(false);
const showModal = ref<boolean>(false);
const showMethod = ref<boolean>(false);
const methodsList = ref<{ label: string; value: string }[]>([]);
// const scanRef = ref();
const excludeParams = {
  excludeAssetStatuses: [AssetStatus.WaitingRepair, AssetStatus.Repair, AssetStatus.Approve],
};
const selectAssetParams = ref<Record<string, any>>(excludeParams);

const handleInitData = (data?: IDetail) => {
  formState.applyTime = getFormatDate(data?.applyTime);
  formState.applyUserName = data?.applyUserName;
  formState.applyUserId = data?.applyUserId;
  formState.department = data?.department;
  formState.departmentName = data?.departmentName;
  formState.method = data?.method;
  formState.methodDesc = data?.methodDesc;
  formState.spaceId = data?.spaceId;
  formState.spaceName = data?.spaceName;
  formState.place = data?.place;
  formState.reason = data?.reason;
  formState.content = data?.content;
  formState.itemDTOList = data?.changeItemList;
};

/** 获取变更类型数据 */
const fetchChangeTypes = async () => {
  try {
    const res: any = await getChangeTypeList();
    methodsList.value = res;
  } catch (e: any) {
    methodsList.value = [];
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
  getAssetChangeDetails(id)
    .then((res: any) => {
      if (res) {
        handleInitData(res);
      }
    })
    .finally(() => {
      hideLoading();
    });
});

const change = (e: any) => {
  formState.applyTime = e.result;
};

// 使用人
const handleSelectPersons = () => {
  // 普通人员不允许选人
  if (!isAdminStore.isAdmin) return;
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: formState.applyUserId,
    callback: (value: any, data: any) => {
      formState.applyUserId = value || '';
      formState.applyUserName = data?.name || '';
      formState.itemDTOList = [];
      if (!value) {
        formState.department = '';
        formState.departmentName = '';
      }
      /** 申请人为发起人本人：选择资产不为待维修、维修中、审批中
       *  申请人不为发起人本人：选择资产为借用/在用且保管人为申请人的资产
       */
      if (value === userInfo?.id) {
        selectAssetParams.value = excludeParams;
      } else {
        selectAssetParams.value = {
          assetStatuses: [AssetStatus.Borrow, AssetStatus.InUse],
          recipientIdList: [value],
        };
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
  formState.department = val.value;
  formState.departmentName = val.label;
};

const handleSelectList = (val: Record<string, any>[]) => {
  formState.itemDTOList = val;
};

// 变更方式选择
const handleMethodConfirm = (val: any[]) => {
  formState.method = val?.[0]?.value;
  formState.methodDesc = val?.[0]?.label;
};
// 提交吐出表单
const submit = async () => {
  if (!formState.applyUserId) {
    showInfo('请选择申请人');
    return;
  }
  if (!formState.applyTime) {
    showInfo('请选择申请日期');
    return;
  }

  if (!formState.department) {
    showInfo('请选择申请部门');
    return;
  }
  if (isNil(formState.method)) {
    showInfo('请选择变更方式');
    return;
  }
  if (!formState.reason) {
    showInfo('请输入变更原因');
    return;
  }
  if (!formState.itemDTOList?.length) {
    showInfo('请选择要变更的资产');
    return;
  }
  const formData = cloneDeep(formState);
  formData.itemDTOList = map(formState.itemDTOList, v => ({ assetId: v?.assetId }));

  const params = {
    ...omit(formData, ['departmentName', 'itemDTOList', 'spaceName']),
    changeItemList: formData.itemDTOList,
  };
  uni.showLoading();
  loading.value = true;
  saveAssetAssetChange(params)
    .then(() => {
      uni.hideLoading();
      showInfo('变更成功');
      handleToList();
    })
    .catch((e: any) => {
      uni.hideLoading();
      showInfo(e?.msg || '变更失败');
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
      url: `/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=${RecordTypeEnum.VariationRecord}`,
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
