<script setup lang="ts">
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import MaterialEnter from '@/app-general-affairs-logistics/consumable-management/components/MaterialEnter/index.vue';
import MaterialUserInfo from '@/app-general-affairs-logistics/consumable-management/components/MaterialUserInfo.vue';
import { saveMaterialOuts } from '@/app-general-affairs-logistics/consumable-management/services/materialOut';
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
import { reactive, ref } from 'vue';

const store = loginStore();
const { userInfo } = store || {};
const infoConfig = ref<any>({
  title: '申请人信息',
  list: [
    {
      value: 'code',
      label: '出库单号',
      placeholder: '提交后自动生成',
    },
    {
      value: 'applyUser',
      label: '领用人',
    },
    {
      value: 'departmentName',
      label: '领用部门',
    },
    {
      value: 'applyTime',
      label: '领用时间',
    },
  ],
});

const formState = reactive<IMaterialState>({
  code: '',
  applyUser: userInfo?.name,
  applyUserId: userInfo?.id,
  departmentId: userInfo?.deptId,
  departmentName: userInfo?.deptName,
  applyTime: dayjs().format('YYYY-MM-DD HH:mm'),
});

const enterParams = reactive<IMaterialEnterParams>({
  emptyTxt: '未添加要出库的耗材',
  countLabel: '领用数量',
  countFileName: 'num',
  type: SelectorTypeEnum.warehouse,
  limitField: 'leftNum',
});
const showConfirm = ref<boolean>(false);

const handleSave = async () => {
  try {
    const params = {
      ...omit(formState, ['code']),
      flag: 0,
      applyTime: dayjs(formState.applyTime)?.valueOf(),
      items: map(cloneDeep(formState.items), v => omit(v, 'createTime')),
    };
    showLoading();
    await saveMaterialOuts(params);
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
  if (!formState?.items?.length) {
    showInfo('出库明细请至少选择一项');
    return;
  }
  const emptyCount = findIndex(formState.items || [], v => isNil(v?.num));
  if (emptyCount > -1) {
    showInfo('领用数量必填');
    return;
  }
  const overCount = findIndex(formState.items || [], v => +v?.num > +v?.leftNum);
  if (overCount > -1) {
    showInfo('领用数量不可大于库存数量');
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
</script>
<template>
  <page custom-overflow="visible" class="material-page">
    <view class="page-content">
      <MaterialUserInfo :form-state="formState" :infoConfig="infoConfig" />
      <form-card title="出库信息">
        <template #content>
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
      <form-card title="出库明细">
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
