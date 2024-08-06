<!-- 资产报修 -->
<template>
  <view class="page">
    <view class="main">
      <view class="form">
        <u-field
          v-model="formState.applyTime"
          required
          label="申请日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="selectDate('use')"
        >
        </u-field>
        <u-field
          v-model="formState.applyUserName"
          required
          label="申请人"
          placeholder="请选择"
          :right-icon="isAdminStore.isAdmin ? 'arrow-right' : undefined"
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
          v-model="formState.urgencyName"
          required
          label="紧急程度"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="showUrgency = true"
        >
        </u-field>
        <u-field
          v-model="formState.hopeTime"
          label="期望完成维修日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          label-width="240"
          input-align="right"
          @click="selectDate('back')"
        >
        </u-field>
        <u-field
          v-model="formState.faultDesc"
          type="textarea"
          required
          label="故障描述"
          placeholder="请输入"
          maxlength="200"
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.expectAmount"
          type="digit"
          label="预算金额（元）"
          placeholder="请输入"
          label-width="200"
          maxlength="20"
          input-align="right"
          :clearable="false"
          @blur="(e: any) => handleNumberBlur(e.detail.value)"
        >
        </u-field>
      </view>
      <UploadImg
        :max-count="5"
        :max-size="5"
        :default-file-list="imgList"
        @afterUpload="imgAfterUpload"
      ></UploadImg>
      <UploadFile
        :max-count="5"
        :max-size="20"
        :default-file-list="fileList"
        @afterUpload="fileAfterUpload"
      ></UploadFile>
      <AssetSelectedAndScanList
        :assets-list="itemDTOList"
        :api-query="{
          assetStatuses: getAssetStatuses(),
          ...(isAdminStore.isAdmin && formState.applyUserId === userInfo?.id
            ? {}
            : { recipientIdList: [formState?.applyUserId] }),
        }"
        :order-type="RecordTypeEnum.RepairRecord"
        @onSelectList="handleSelectList"
      ></AssetSelectedAndScanList>
    </view>
    <SelectorUserDepartment
      :show-department="showDepartment"
      :user-id="formState.applyUserId"
      @reset-value="getDepartment"
      @cancel="showDepartment = false"
    ></SelectorUserDepartment>
    <u-calendar
      v-model="show"
      max-date="2050-12-30"
      :min-date="
        dateType === 'back'
          ? dayjs(formState.applyTime).add(1, 'day').format('YYYY-MM-DD')
          : '1950-01-01'
      "
      mode="date"
      @change="change"
    ></u-calendar>
    <u-picker
      ref="uPicker"
      v-model="showUrgency"
      mode="selector"
      :default-selector="[0]"
      :range="urgencyList"
      range-key="label"
      @confirm="confirm"
    ></u-picker>
    <view class="footer">
      <view class="footer-nav" @click="handleToApprove">
        <u-image
          :src="listIcon"
          width="36"
          height="36"
          :show-loading="false"
          :fade="false"
          style="margin-right: 8rpx"
        ></u-image>
        <view style="margin-right: 24rpx">审批列表</view>
      </view>
      <u-button type="primary" :loading="loading" style="flex: 1" @click="submit">提交</u-button>
      <u-modal
        v-model="showModal"
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
import {
  assetAssetRepairsCreate,
  getAssetAssetRepairsDetail,
} from '@/app-general-affairs-logistics/assets-manage/services/repair';
import {
  AssetStatus,
  RecordTypeEnum,
  urgencyList,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import listIcon from '@/app-general-affairs-logistics/static/assets-manage/list.svg';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { loginStore } from '@/store/modules/login';
import { cloneDeep, omit } from '@/utils/lodash-es';
import { getPageParams, hideLoading, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, ref, watch } from 'vue';
import SelectorUserDepartment from '../../components/SelectorUserDepartment';
import UploadFile from '../../components/UploadFile';
import UploadImg from '../../components/UploadImg';
import { useAdmin } from '../../store/useAdmin';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';
import { fixNumber, sp_round } from '../../utils/tools';

// 资产库跳转过来必须带上当前资产
const assetDetailToCreateStore = useAssetDetailToCreate();

const store = loginStore();
const { userInfo } = store;
const show = ref<boolean>(false);
const showUrgency = ref<boolean>(false);
const detailData = ref<any>();
const isAdminStore = useAdmin();

onLoad((options: any) => {
  // 资产库跳转过来必须带上当前资产
  if (options.assetId && options.assetId === assetDetailToCreateStore.assetInfo.assetId) {
    const _asset = cloneDeep(assetDetailToCreateStore.assetInfo);
    itemDTOList.value = [_asset] as any;
    assetDetailToCreateStore.$reset();
  }
});

onBeforeMount(() => {
  console.log(getCurrentPages());
  const { id } = getPageParams();
  if (!id) return;
  showLoading();
  getAssetAssetRepairsDetail(id)
    .then(res => {
      detailData.value = res;
    })
    .finally(() => {
      hideLoading();
    });
});

const formState = ref({
  applyTime: dayjs().format('YYYY-MM-DD'),
  applyUserName: userInfo?.name,
  applyUserId: userInfo?.id,
  department: userInfo?.departId,
  departmentName: userInfo?.departName,
  urgency: 0,
  urgencyName: '一般',
  hopeTime: undefined,
  faultDesc: undefined,
  expectAmount: null,
  imagesList: [],
  attachList: [],
  assetIdList: [],
});

const confirm = (num: any[]) => {
  formState.value.urgency = num[0];
  formState.value.urgencyName = urgencyList?.find(v => v?.value === num[0]).label;
};
watch(
  () => detailData.value,
  newVal => {
    if (newVal) {
      formState.value.applyTime = dayjs(newVal.applyTime).format('YYYY-MM-DD');
      formState.value.applyUserName = newVal.applyUserName;
      formState.value.applyUserId = newVal.applyUserId;
      formState.value.department = newVal.department;
      formState.value.departmentName = newVal.departmentName;
      formState.value.expectAmount = newVal.expectAmount;
      formState.value.hopeTime = newVal.hopeTime
        ? dayjs(newVal.hopeTime).format('YYYY-MM-DD')
        : undefined;
      formState.value.faultDesc = newVal.faultDesc;
      imgList.value = newVal.imagesList.map(img => {
        return {
          fileId: img.fileId,
          url: img.url,
        };
      });
      fileList.value = newVal.attachList.map(file => {
        return {
          fileId: file.fileId,
          url: file.url,
          name: file.name,
        };
      });
      itemDTOList.value = newVal.assetList;
    }
  },
  {
    immediate: true,
  },
);
const dateType = ref<'use' | 'back'>('use');
const showDepartment = ref<boolean>(false);
// 上传照片
const imgList = ref<any[]>([]);
// 文件
const fileList = ref<any[]>([]);
// 资产
const itemDTOList = ref<any[]>([]);
// 加载中
const loading = ref<boolean>(false);
const showModal = ref<boolean>(false);
// 上传后回调
const imgAfterUpload = imgs => {
  imgList.value = imgs;
};
// 文件上传后回调
const fileAfterUpload = files => {
  fileList.value = files;
};

const selectDate = (type: 'use' | 'back') => {
  if (type === 'back' && !formState.value.applyTime) {
    uni.showToast({
      title: '请先选择报修时间',
      icon: 'none',
    });
    return;
  }
  dateType.value = type;
  show.value = true;
};
const change = (e: any) => {
  if (dateType.value === 'use') {
    formState.value.applyTime = e.result;
    if (formState.value.hopeTime && new Date(e.result) > new Date(formState.value.hopeTime)) {
      formState.value.hopeTime = undefined;
    }
  } else {
    if (e.result === formState.value.applyTime) {
      uni.showToast({
        title: '期望完成日期应大于申请日期',
        icon: 'none',
      });
      return;
    }
    formState.value.hopeTime = e.result;
  }
};

// 使用人
const handleSelectPersons = () => {
  // 普通人员不允许选人
  if (!isAdminStore.isAdmin) return;
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: formState.value.applyUserId,
    callback: (value, data) => {
      formState.value.applyUserId = value || '';
      formState.value.applyUserName = data?.name || '';
      itemDTOList.value = [];
      if (!value) {
        formState.value.department = '';
        formState.value.departmentName = '';
      }
    },
  });
};
// 管理员-申请人是本人-选择资产：闲置、借用、在用；
// 管理员-申请人非本人-选择资产：借用、在用；
// 普通用户：选择资产：借用、在用；
const getAssetStatuses = () => {
  if (isAdminStore.isAdmin && formState.value.applyUserId === userInfo?.id)
    return [AssetStatus.Unused, AssetStatus.InUse, AssetStatus.Borrow];
  return [AssetStatus.InUse, AssetStatus.Borrow];
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
    formState.value.expectAmount = sp_round(fixNumber(_price), 2);
  }
};
const getDepartment = (val: any) => {
  formState.value.department = val.value;
  formState.value.departmentName = val.label;
};
// 资产选择处理
const handleSelectList = (val: Record<string, any>[]) => {
  itemDTOList.value = val;
};
// 前往审批列表
const handleToList = () => {
  const { type } = getPageParams();
  if (type === 'home') {
    uni.redirectTo({
      url: `/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=${RecordTypeEnum.RepairRecord}`,
    });
  } else {
    uni.navigateBack({
      delta: 1,
    });
  }
};
const handleToApprove = () => {
  if (itemDTOList.value.length) {
    showModal.value = true;
    return;
  }
  handleToList();
};
// 提交吐出表单
const submit = async () => {
  if (!formState.value.applyTime) {
    uni.showToast({
      title: '请选择报修日期',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.applyUserId) {
    uni.showToast({
      title: '请选择申请人',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.department) {
    uni.showToast({
      title: '请选择部门',
      icon: 'none',
    });
    return;
  }

  if (!formState.value.faultDesc) {
    uni.showToast({
      title: '请输入故障描述',
      icon: 'none',
    });
    return;
  }
  if (!itemDTOList.value.length) {
    uni.showToast({
      title: '请选择要报修资产',
      icon: 'none',
    });
    return;
  }
  formState.value.assetIdList = itemDTOList.value.map(item => item.assetId);
  if (imgList.value.length) {
    formState.value.imagesList = imgList.value.map(item => {
      return {
        fileId: item.fileId,
      };
    });
  }
  if (fileList.value.length) {
    formState.value.attachList = fileList.value.map(item => {
      return {
        fileId: item.fileId,
        name: item.name,
      };
    });
  }
  const params = {
    ...omit(formState.value),
  };
  uni.showLoading();
  loading.value = true;
  assetAssetRepairsCreate(params)
    .then(res => {
      uni.hideLoading();
      uni.showToast({
        title: '报修成功',
        icon: 'success',
      });
      handleToList();
    })
    .catch(error => {
      uni.hideLoading();
      uni.showToast({
        title: error.msg,
        icon: 'none',
      });
    })
    .finally(() => {
      loading.value = false;
    });
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
  z-index: 2;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.footer-nav {
  display: flex;
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
</style>
