<!-- 资产借用 -->
<template>
  <view class="page">
    <view class="main">
      <view class="form">
        <u-field
          v-model="formState.borrowDate"
          required
          label="借用日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          input-align="right"
          @click="selectDate('use')"
        >
        </u-field>
        <u-field
          v-model="formState.borrowUserName"
          required
          label="借用人"
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
          label="借用部门"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          :clearable="false"
          input-align="right"
          @click="showDepartment = true"
        >
        </u-field>
        <u-field
          v-model="formState.preBackTime"
          label="预计归还日期"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          label-width="200"
          input-align="right"
          @click="selectDate('back')"
        >
        </u-field>
        <u-field
          v-model="formState.spaceName"
          label="借用后所在空间"
          placeholder="请选择"
          right-icon="arrow-right"
          disabled
          label-width="200"
          input-align="right"
          @click="handleSelectSpace"
        >
        </u-field>
        <u-field
          v-model="formState.placeAfterBorrow"
          label="借用后存放位置"
          placeholder="请输入"
          label-width="200"
          maxlength="30"
          input-align="right"
        >
        </u-field>
        <u-field
          v-model="formState.assertUsage"
          type="textarea"
          label="借用备注"
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
      ></UploadImg>
      <UploadFile
        :max-count="5"
        :max-size="20"
        :default-file-list="fileList"
        @afterUpload="fileAfterUpload"
      ></UploadFile>
      <AssetSelectedAndScanList
        :assets-list="itemDTOList"
        :api-query="{ assetStatuses: [AssetStatus.Unused] }"
        :order-type="RecordTypeEnum.BorrowRecord"
        @onSelectList="handleSelectList"
      ></AssetSelectedAndScanList>
    </view>
    <SelectorUserDepartment
      :show-department="showDepartment"
      :user-id="formState.borrowUserId"
      @reset-value="getDepartment"
      @cancel="showDepartment = false"
    ></SelectorUserDepartment>
    <u-calendar
      v-model="show"
      max-date="2050-12-30"
      :min-date="
        dateType === 'back'
          ? dayjs(formState.borrowDate).add(1, 'day').format('YYYY-MM-DD')
          : '1950-01-01'
      "
      mode="date"
      @change="change"
    ></u-calendar>
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
  addAssetBorrow,
  getAssetBorrowDetail,
} from '@/app-general-affairs-logistics/assets-manage/services/borrow';
import {
  AssetStatus,
  RecordTypeEnum,
} from '@/app-general-affairs-logistics/assets-manage/utils/constants';
import listIcon from '@/app-general-affairs-logistics/static/assets-manage/list.svg';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { loginStore } from '@/store/modules/login';
import { cloneDeep, omit } from '@/utils/lodash-es';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { onBeforeMount, ref, watch } from 'vue';
import SelectorUserDepartment from '../../components/SelectorUserDepartment';
import UploadFile from '../../components/UploadFile';
import UploadImg from '../../components/UploadImg';
import { useAdmin } from '../../store/useAdmin';
import { useAssetDetailToCreate } from '../../store/useAssetDetailToCreate';

// 资产库跳转过来必须带上当前资产
const assetDetailToCreateStore = useAssetDetailToCreate();
const store = loginStore();
const { userInfo } = store;
const show = ref<boolean>(false);
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
  const { id } = getPageParams();
  if (!id) return;
  showLoading();
  getAssetBorrowDetail(id)
    .then(res => {
      detailData.value = res;
    })
    .finally(() => {
      hideLoading();
    });
});

const formState = ref({
  borrowDate: dayjs().format('YYYY-MM-DD'),
  borrowUserName: userInfo?.name,
  borrowUserId: userInfo?.id,
  deptId: userInfo?.deptId,
  deptName: userInfo?.deptName,
  preBackTime: undefined,
  spaceId: undefined,
  spaceName: undefined,
  placeAfterBorrow: undefined,
  assertUsage: undefined,
  imgList: [],
  fileList: [],
  itemDTOList: [],
});

watch(
  () => detailData.value,
  newVal => {
    if (newVal) {
      formState.value.borrowDate = dayjs(newVal.borrowDate).format('YYYY-MM-DD');
      formState.value.borrowUserName = newVal.borrowUserName;
      formState.value.borrowUserId = newVal.borrowUserId;
      formState.value.deptId = newVal.deptId;
      formState.value.deptName = newVal.deptName;
      formState.value.preBackTime = newVal.preBackTime
        ? dayjs(newVal.preBackTime).format('YYYY-MM-DD')
        : undefined;
      formState.value.spaceId = newVal.spaceId;
      formState.value.spaceName = newVal.spaceName;
      formState.value.placeAfterBorrow = newVal.placeAfterBorrow;
      formState.value.assertUsage = newVal.assertUsage;
      imgList.value = newVal.imgList.map(img => {
        return {
          fileId: img.fileId,
          url: img.fileUrl,
        };
      });
      fileList.value = newVal.fileList.map(file => {
        return {
          fileId: file.fileId,
          url: file.fileUrl,
          name: file.fileName,
        };
      });
      itemDTOList.value = newVal.itemDTOList;
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
  formState.value.imgList = imgList.value;
};
// 文件上传后回调
const fileAfterUpload = files => {
  fileList.value = files;
  formState.value.fileList = fileList.value;
};

const selectDate = (type: 'use' | 'back') => {
  if (type === 'back' && !formState.value.borrowDate) {
    uni.showToast({
      title: '请先选择借用日期',
      icon: 'none',
    });
    return;
  }
  dateType.value = type;
  show.value = true;
};
const change = (e: any) => {
  if (dateType.value === 'use') {
    formState.value.borrowDate = e.result;
    if (formState.value.preBackTime && new Date(e.result) > new Date(formState.value.preBackTime)) {
      formState.value.preBackTime = undefined;
    }
  } else {
    if (e.result === formState.value.borrowDate) {
      uni.showToast({
        title: '归还日期应大于借用日期',
        icon: 'none',
      });
      return;
    }
    formState.value.preBackTime = e.result;
  }
};

// 使用人
const handleSelectPersons = () => {
  // 普通人员不允许选人
  if (!isAdminStore.isAdmin) return;
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: false,
    value: formState.value.borrowUserId,
    callback: (value, data) => {
      formState.value.borrowUserId = value || '';
      formState.value.borrowUserName = data?.name || '';
      if (!value) {
        formState.value.deptId = '';
        formState.value.deptName = '';
      }
    },
  });
};

const handleSelectSpace = () => {
  showSelector({
    type: SelectorTypeEnum.space,
    multiple: false,
    value: formState.value.spaceId,
    callback: (value, data) => {
      formState.value.spaceId = value || '';
      formState.value.spaceName = data?.name || '';
    },
  });
};

const getDepartment = (val: any) => {
  formState.value.deptId = val.value;
  formState.value.deptName = val.label;
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
      url: `/app-general-affairs-logistics/assets-manage/pages/approve/index?tab=${RecordTypeEnum.BorrowRecord}`,
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
  if (!formState.value.borrowDate) {
    uni.showToast({
      title: '请选择借用日期',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.borrowUserId) {
    uni.showToast({
      title: '请选择借用人',
      icon: 'none',
    });
    return;
  }
  if (!formState.value.deptId) {
    uni.showToast({
      title: '请选择部门',
      icon: 'none',
    });
    return;
  }
  if (!itemDTOList.value.length) {
    uni.showToast({
      title: '请选择要借用的资产',
      icon: 'none',
    });
    return;
  }
  formState.value.itemDTOList = itemDTOList.value.map(item => {
    return {
      assetId: item.assetId,
    };
  });
  if (imgList.value.length) {
    formState.value.imgList = imgList.value.map(item => {
      return {
        fileId: item.fileId,
      };
    });
  }
  if (fileList.value.length) {
    formState.value.fileList = fileList.value.map(item => {
      return {
        fileId: item.fileId,
      };
    });
  }
  const params = {
    ...omit(formState.value, ['borrowUserName', 'deptName', 'spaceName']),
  };
  uni.showLoading();
  loading.value = true;
  addAssetBorrow(params)
    .then(res => {
      uni.hideLoading();
      uni.showToast({
        title: '借用成功',
        icon: 'success',
      });
      handleToList();
    })
    .catch(e => {
      uni.hideLoading();
      showInfo(e?.msg || '借用失败');
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
