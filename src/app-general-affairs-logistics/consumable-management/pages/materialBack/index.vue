<script setup lang="ts">
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import MaterialEnter from '@/app-general-affairs-logistics/consumable-management/components/MaterialEnter/index.vue';
import MaterialUserInfo from '@/app-general-affairs-logistics/consumable-management/components/MaterialUserInfo.vue';
import {
  IMaterialEnterParams,
  IMaterialState,
} from '@/app-general-affairs-logistics/consumable-management/types/material';
import { loginStore } from '@/store/modules/login';
import { blankAndSpecialCharacter } from '@/utils/reg';
import { getPageParams, hideLoading, showInfo, showLoading } from '@/utils/tools';
import dayjs from 'dayjs';
import { cloneDeep, findIndex, isNil, map, omit } from 'lodash-es';
import { onMounted, reactive, ref } from 'vue';
import { saveMaterialBack } from '../../services/materialBack';
import { getMaterialOutsDetail } from '../../services/materialOut';
import { useTab } from '../../store/homeTab';
import { RecordTypeEnum } from '../home/constants';

const store = loginStore();
const tabStore = useTab();
const { userInfo } = store || {};
const infoConfig = ref<any>({
  title: '申请人信息',
  list: [
    {
      value: 'code',
      label: '退库单号',
      placeholder: '提交后自动生成',
    },
    {
      value: 'applyUser',
      label: '申请人',
    },
    {
      value: 'departmentName',
      label: '申请部门',
    },
    {
      value: 'applyTime',
      label: '申请时间',
    },
  ],
});

const enterParams = reactive<IMaterialEnterParams>({
  emptyTxt: '未添加要退库的耗材',
  countLabel: '退库数量',
  countFileName: 'backNum',
  limitField: 'num',
});

const formState = reactive<IMaterialState>({
  code: '',
  applyUser: userInfo?.name,
  applyUserId: userInfo?.id,
  departmentId: userInfo?.deptId,
  departmentName: userInfo?.deptName,
  applyTime: dayjs().format('YYYY-MM-DD HH:mm'),
});

const showConfirm = ref<boolean>(false);

const handleSave = async () => {
  try {
    const params = {
      ...formState,
      flag: 1,
      applyTime: dayjs(formState.applyTime)?.valueOf(),
      items: map(cloneDeep(formState.items), v => omit(v, 'createTime')),
    };
    showLoading();
    await saveMaterialBack(params);
    hideLoading();
    showInfo('提交成功');
    tabStore.$set(RecordTypeEnum.ConsumablesReturnRecord);
    uni.navigateBack({ delta: 2 });
  } catch (e: any) {
    hideLoading();
    showInfo(e?.desc || '提交失败');
  }
};

const handleSubmit = async () => {
  if (formState?.remark && !blankAndSpecialCharacter.test(formState?.remark)) {
    showInfo('摘要不支持全空格和全特殊字符');
    return;
  }
  if (!formState?.items?.length) {
    showInfo('退库明细请至少选择一项');
    return;
  }
  const emptyCount = findIndex(formState.items || [], v => isNil(v?.backNum));
  if (emptyCount > -1) {
    showInfo('退库数量必填');
    return;
  }
  const overCount = findIndex(formState.items || [], v => +v?.backNum > +v?.num);
  if (overCount > -1) {
    showInfo('退库数量不可大于领用数量');
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

const getDetail = async (id: string | number) => {
  try {
    showLoading();
    const res: any = await getMaterialOutsDetail(id);
    formState.items = res?.items;
  } catch (e: any) {
    showInfo(e?.desc || '获取详情失败');
  } finally {
    hideLoading();
  }
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

onMounted(() => {
  const pageParams = getPageParams();
  if (pageParams?.id) {
    getDetail(pageParams?.id);
  }
});
</script>
<template>
  <page custom-overflow="visible" class="material-page">
    <view class="page-content">
      <MaterialUserInfo :form-state="formState" :info-config="infoConfig" />
      <form-card title="退库信息">
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
      <form-card title="退库明细">
        <template #content>
          <material-enter
            v-model:value="formState.items"
            :enter-params="enterParams"
            :show-add="false"
          />
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
