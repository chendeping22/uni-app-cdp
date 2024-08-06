<script setup lang="ts">
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import MaterialEnter from '@/app-general-affairs-logistics/consumable-management/components/MaterialEnter/index.vue';
import MaterialUserInfo from '@/app-general-affairs-logistics/consumable-management/components/MaterialUserInfo.vue';
import {
  getMaterialPurchasesDetails,
  saveMaterialPurchases,
} from '@/app-general-affairs-logistics/consumable-management/services/purchase';
import {
  IMaterialEnterParams,
  SelectorTypeEnum,
} from '@/app-general-affairs-logistics/consumable-management/types/material';
import { loginStore } from '@/store/modules/login';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { findIndex, isNil, omit } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { getCollegesOrSectionsList } from '../../services/common';
import { testInputEmptyAndSpecial } from '../../utils/tools';

const store = loginStore();
const { userInfo } = store || {};
const pageParams = ref<{ id: string }>({ id: '' });
const detailData = ref<any>({});

const showPurchaseModal = ref<boolean>(false);
const formState = reactive<any>({
  applyUser: userInfo?.name,
  applyUserId: userInfo?.id,
  deptId: userInfo?.deptId,
  deptName: userInfo?.deptName,
  time: dayjs().format('YYYY-MM-DD HH:mm'),
  items: [],
  arrivalNoticeTime: null,
  requestRemark: null,
  academyId: null,
  academyName: null,
});
const storeList = ref<any[]>([]);
const showDate = ref<boolean>(false);
const showStore = ref<boolean>(false);
const infoConfig = ref<any>({
  title: '申请人信息',
  list: [
    {
      value: 'code',
      label: '申请单号',
      placeholder: '提交后自动生成',
    },
    {
      value: 'applyUser',
      label: '申请人',
    },
    {
      value: 'deptName',
      label: '所属部门',
      key: 'deptName',
    },
    {
      value: 'time',
      label: '申请时间',
    },
  ],
});

const enterParams = reactive<IMaterialEnterParams>({
  emptyTxt: '未添加要采购的耗材',
  countFileName: 'requestNum',
  remarkName: 'requestRemark',
  showPrice: false,
  type: SelectorTypeEnum.base,
});

const getStoreData = async () => {
  try {
    const res: any = await getCollegesOrSectionsList();
    storeList.value = res;
  } catch (e: any) {
    storeList.value = [];
  }
};

const handleConfirmStore = (val: { value?: string; label?: string }[]) => {
  formState.academyId = val?.[0]?.value;
  formState.academyName = val?.[0]?.label;
};

const change = (e: any) => {
  formState.arrivalNoticeTime = e.result;
};

const purchaseSubmit = () => {
  if (!formState?.items?.length) {
    showInfo('采购明细请至少选择一项');
    return;
  }
  const emptyCount = findIndex(formState.items || [], v => isNil(v?.requestNum));
  if (emptyCount > -1) {
    showInfo('采购明细请填写实际采购数量');
    return;
  }
  showPurchaseModal.value = true;
};
const handleSubmit = async () => {
  try {
    const params = {
      ...(Object.keys(detailData).length ? detailData.value : {}),
      ...omit(formState, ['time', 'deptName', 'storeName', 'items']),
      items: formState.items.map(item => {
        return {
          ...(item.baseId
            ? item
            : { ...omit(item, ['id', 'createTime', 'updateTime']), baseId: item.id }),
        };
      }),
      departmentName: formState.deptName,
      mobilePagePath: {
        targetType: 1,
        pageType: 'native',
        todo: '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index?view=1&type=1',
        completed:
          '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index?view=1&type=2',
        copy: '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index?view=1',
        launch:
          '/app-general-affairs-logistics/consumable-management/pages/purchase/detail/index?view=1',
      },
      webPagePath: {
        completed: '/consumable-management/purchase/apply/edit?view=1',
        copy: '/consumable-management/purchase/apply/edit?view=1',
        launch: '/consumable-management/purchase/apply/edit?view=1',
        targetType: 3,
        todo: '/consumable-management/purchase/apply/edit?view=1',
      },
    };
    showLoading();
    await saveMaterialPurchases(params);
    showInfo('提交成功');

    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.desc || '提交失败');
  } finally {
    hideLoading();
  }
};
const setDepartment = (val: any) => {
  formState.deptId = val.value;
  formState.deptName = val.label;
};
const getDetail = async () => {
  try {
    showLoading();
    const res: any = await getMaterialPurchasesDetails(pageParams.value.id);
    detailData.value = res || {};
    formState.applyUser = detailData.value?.applyUser;
    formState.applyUserId = detailData.value?.applyUserId;
    formState.deptName = detailData.value?.deptName;
    formState.time = dayjs(detailData.value?.createTime).format('YYYY-MM-DD HH:mm');
    formState.items = detailData.value?.items;
    formState.arrivalNoticeTime = detailData.value.arrivalNoticeTime
      ? dayjs(detailData.value?.arrivalNoticeTime).format('YYYY-MM-DD HH:mm')
      : null;
    formState.requestRemark = detailData.value?.requestRemark;
    formState.academyId = detailData.value?.academyId;
    formState.academyName = detailData.value?.academyName;
  } catch (e: any) {
    showInfo(e?.desc || '获取详情失败');
  } finally {
    hideLoading();
  }
};
onMounted(() => {
  getStoreData();
  pageParams.value = getPageParams();
  if (pageParams.value.id) {
    getDetail();
  }
});
</script>
<template>
  <!-- <Detail /> -->
  <page custom-overflow="visible" class="material-page">
    <view class="page-content">
      <MaterialUserInfo
        :form-state="formState"
        :info-config="infoConfig"
        @getDepartment="setDepartment"
      />
      <form-card title="请购信息">
        <template #content>
          <u-field
            v-model="formState.arrivalNoticeTime"
            label="期望到货日期"
            :label-width="200"
            placeholder="请先选择期望到货日期"
            :clearable="false"
            disabled
            input-align="right"
            right-icon="arrow-right"
            @click="showDate = true"
          >
          </u-field>
          <u-field
            v-model="formState.requestRemark"
            label="摘要"
            placeholder="请填写摘要"
            input-align="right"
            type="textarea"
            :maxlength="100"
            :trim="false"
            @blur="testInputEmptyAndSpecial(formState.requestRemark)"
          >
          </u-field>
          <u-field
            v-model="formState.academyName"
            :label="userInfo?.locationType === 'K12' ? '所属学段' : '所属学院'"
            :placeholder="userInfo?.locationType === 'K12' ? '请选择所属学段' : '请选择所属学院'"
            :clearable="false"
            disabled
            input-align="right"
            right-icon="arrow-right"
            @click="showStore = true"
          >
          </u-field>
        </template>
      </form-card>
      <form-card title="采购明细">
        <template #content>
          <material-enter v-model:value="formState.items" :enter-params="enterParams" />
        </template>
      </form-card>
    </view>
    <view class="page-bottom">
      <u-button type="primary" @click="purchaseSubmit">提交</u-button>
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
  </page>

  <u-calendar
    v-model="showDate"
    max-date="2050-12-30"
    min-date="1950-01-01"
    mode="date"
    @change="change"
  ></u-calendar>
  <u-select
    v-model="showStore"
    :list="storeList"
    label-name="value"
    value-name="key"
    @cancel="showStore = false"
    @confirm="handleConfirmStore"
  ></u-select>
  <u-modal
    v-model="showPurchaseModal"
    content="确认提交？"
    show-cancel-button
    show-confirm-button
    @confirm="handleSubmit"
    @cancel="() => (showPurchaseModal = false)"
  ></u-modal>
</template>
<style lang="scss" scoped>
.material-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  .page-content {
    flex: 1;
    padding: 24rpx 32rpx;
  }
  .page-bottom {
    position: sticky;
    bottom: 0;
    padding: 24rpx 32rpx;
    z-index: 2;
    box-shadow: $shadow-light-up-md;
    background: $color-background-base;
  }
}
</style>
