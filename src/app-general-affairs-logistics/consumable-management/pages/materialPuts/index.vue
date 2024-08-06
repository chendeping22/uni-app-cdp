<script setup lang="ts">
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import MaterialEnter from '@/app-general-affairs-logistics/consumable-management/components/MaterialEnter/index.vue';
import MaterialUserInfo from '@/app-general-affairs-logistics/consumable-management/components/MaterialUserInfo.vue';
import {
  IMaterialEnterParams,
  IMaterialState,
  SelectorTypeEnum,
} from '@/app-general-affairs-logistics/consumable-management/types/material';
import { loginStore } from '@/store/modules/login';
import { blankAndSpecialCharacter } from '@/utils/reg';
import { hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { cloneDeep, findIndex, isNil, map, omit } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { getStoresBySpaceId } from '../../services/common';
import { saveMaterialPuts } from '../../services/materialPuts';

const store = loginStore();
const { userInfo } = store || {};
const formState = reactive<IMaterialState>({
  applyUser: userInfo?.name,
  applyUserId: userInfo?.id,
  deptId: userInfo?.deptId,
  deptName: userInfo?.deptName,
  time: dayjs().format('YYYY-MM-DD HH:mm'),
  items: [],
});
const storeList = ref<any[]>([]);
const showStore = ref<boolean>(false);
const infoConfig = ref<any>({
  title: '申请人信息',
  list: [
    {
      value: 'code',
      label: '入库单号',
      placeholder: '提交后自动生成',
    },
    {
      value: 'applyUser',
      label: '申请人',
    },
    {
      value: 'deptName',
      label: '申请部门',
    },
    {
      value: 'time',
      label: '申请时间',
    },
  ],
});
const showConfirm = ref<boolean>(false);

const enterParams = reactive<IMaterialEnterParams>({
  emptyTxt: '未添加要入库的耗材',
  countLabel: '实际入库数量',
  countFileName: 'realPutNum',
  type: SelectorTypeEnum.purchase,
  limitField: 'putNum',
});

const getStoreData = async () => {
  try {
    const res: any = await getStoresBySpaceId();
    storeList.value = res;
  } catch (e: any) {
    storeList.value = [];
  }
};

const handleConfirmStore = (val: { value?: string; label?: string }[]) => {
  formState.storeId = val?.[0]?.value;
  formState.storeName = val?.[0]?.label;
};

const handleCheckRemark = (e?: Record<string, any>) => {
  const val = e?.detail?.value;
  if (isNil(val)) {
    return;
  }
  if (!blankAndSpecialCharacter.test(val)) {
    showInfo('不能输入全空格或全特殊字符');
    return;
  }
};

const handleSave = async () => {
  try {
    const params = {
      ...omit(formState, ['time', 'deptName', 'deptId', 'storeName']),
      departmentName: formState.deptName,
      items: map(cloneDeep(formState?.items) || [], v => ({ ...omit(v, 'id'), relationId: v?.id })),
    };
    showLoading();
    await saveMaterialPuts(params);
    hideLoading();
    showInfo('提交成功');
    uni.navigateBack();
  } catch (e: any) {
    hideLoading();
    showInfo(e?.desc || '提交失败');
  }
};

const handleSubmit = async () => {
  if (formState.remark && !blankAndSpecialCharacter.test(formState.remark)) {
    showInfo('摘要不支持全空格和全特殊字符');
    return;
  }

  if (isNil(formState.storeId)) {
    showInfo('请选择入库仓库');
    return;
  }
  if (!formState?.items?.length) {
    showInfo('入库明细请至少选择一项');
    return;
  }

  const emptyCount = findIndex(formState.items || [], v => isNil(v?.realPutNum));
  if (emptyCount > -1) {
    showInfo('实际入库数量必填');
    return;
  }

  const hasMaxCount = findIndex(formState.items || [], v => +v?.realPutNum > +v?.putNum);
  if (hasMaxCount > -1) {
    showInfo('实际入库数量大于可入库数量');
    return;
  }
  const remarkError = findIndex(
    formState.items || [],
    v => v?.remark && !blankAndSpecialCharacter.test(v?.remark),
  );
  if (remarkError > -1) {
    showInfo('备注不能输入全空格或全符号');
    return;
  }
  showConfirm.value = true;
};

onMounted(() => {
  getStoreData();
});
</script>
<template>
  <page custom-overflow="visible" class="material-page">
    <view class="page-content">
      <MaterialUserInfo :form-state="formState" :infoConfig="infoConfig" />
      <form-card title="入库信息">
        <template #content>
          <u-field
            v-model="formState.storeName"
            required
            label="入库仓库"
            placeholder="请先选择入库仓库"
            :clearable="false"
            disabled
            input-align="right"
            right-icon="arrow-right"
            @click="showStore = true"
          >
          </u-field>
          <u-field
            v-model="formState.remark"
            label="摘要"
            placeholder="请填写摘要"
            input-align="right"
            :border-bottom="false"
            maxlength="50"
            clearable
            :trim="false"
            @blur="handleCheckRemark"
          >
          </u-field>
        </template>
      </form-card>
      <form-card title="入库明细">
        <template #content>
          <material-enter v-model:value="formState.items" :enterParams="enterParams" />
        </template>
      </form-card>
    </view>
    <view class="page-bottom">
      <u-button type="primary" @click="handleSubmit">提交</u-button>
      <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    </view>
  </page>
  <u-select
    v-model="showStore"
    :list="storeList"
    label-name="name"
    value-name="id"
    @cancel="showStore = false"
    @confirm="handleConfirmStore"
  ></u-select>
  <u-modal
    v-model="showConfirm"
    :show-title="false"
    content="确认提交？"
    show-cancel-button
    mask-close-able
    @confirm="handleSave"
    @cancel="showConfirm = false"
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
