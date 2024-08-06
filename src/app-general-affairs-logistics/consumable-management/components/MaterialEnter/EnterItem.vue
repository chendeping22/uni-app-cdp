<template>
  <view>
    <view class="enter-header">
      <u-image :src="subtract_circle_filed" :width="48" :height="48" @click="handleDelete" />
      <view class="enter-header-right" @click="handleOpen">
        <view class="enter-header-text">{{ data?.name }}</view>
        <view class="enter-header-icon">
          <view v-if="props.enterParams?.type === SelectorTypeEnum.base" style="margin-right: 24rpx"
            >{{
              data?.price ? sp_round(fixNumber(data?.price * (itemState.count || 0)), 2) : 0
            }}元</view
          >
          <u-icon :name="open ? 'arrow-up' : 'arrow-down'" color="rgba(0, 0, 0, 0.45)"></u-icon>
        </view>
      </view>
    </view>
    <view v-show="open" class="enter-content">
      <view v-if="enterParams.showPrice" class="enter-content-item">
        <view v-if="enterParams.priceLabel" class="enter-content-label">{{
          enterParams.priceLabel
        }}</view>
        <u-input
          v-model="itemState.price"
          placeholder="请输入单价"
          :border="true"
          @change="changeState"
          @blur="handlePriceFormat"
        ></u-input>
      </view>
      <view class="enter-content-item">
        <view v-if="enterParams.countLabel" class="enter-content-label">{{
          enterParams.countLabel
        }}</view>
        <number-box
          v-model="itemState.count"
          :max="limitCount"
          :min="0.01"
          @change="changeState"
        ></number-box>
      </view>
      <view class="enter-content-item">
        <view class="enter-content-label">{{ enterParams.remarkLabel || '备注' }}</view>
        <u-input
          v-model="itemState.remark"
          :border="true"
          placeholder="请输入"
          clearable
          :maxlength="enterParams.type === SelectorTypeEnum.base ? 100 : 30"
          :trim="false"
          @blur="changeState"
        />
      </view>
    </view>
    <MaterialItemContent v-show="open" :data="data" :schema="schema" />
  </view>
</template>

<script setup lang="ts">
import { fixNumber, sp_round } from '@/app-general-affairs-logistics/assets-manage/utils/tools';
import MaterialItemContent from '@/app-general-affairs-logistics/consumable-management/components/MaterialItemContent.vue';
import * as contentSchema from '@/app-general-affairs-logistics/consumable-management/pages/material-selector/schema';
import subtract_circle_filed from '@/app-general-affairs-logistics/static/subtract_circle_filed.svg';
import { showInfo } from '@/utils/tools';
import { cloneDeep, find, isNil } from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import { IMaterialEnterParams, Material, SelectorTypeEnum } from '../../types/material';
import { testInputEmptyAndSpecial } from '../../utils/tools';
import NumberBox from './NumberBox.vue';
import { back } from './schema';

interface IItemState {
  count?: number;
  remark?: string;
  price?: number | string;
}

const props = defineProps<{
  data: Material;
  openId: string;
  enterParams: IMaterialEnterParams;
  open?: boolean;
}>();

const emit = defineEmits<{
  (e: 'onOpen', id: string): void;
  (e: 'onDelete', id: string): void;
  (e: 'onChange', data: IItemState): void;
}>();

const open = ref<boolean>(false);
const itemState = reactive<IItemState>({});
// 采购有重新编辑需要赋值
watch(
  () => [props.enterParams, props.data],
  () => {
    if (props.enterParams.type === SelectorTypeEnum.base) {
      if (props.enterParams?.countFileName && props.data[props.enterParams?.countFileName]) {
        itemState.count = props.data[props.enterParams?.countFileName];
      }
      if (props.enterParams?.remarkName && props.data[props.enterParams?.remarkName]) {
        itemState.remark = props.data[props.enterParams?.remarkName];
      }
    }
  },
  { immediate: true },
);
const limitLabel = computed(
  () => find(schema.value, v => v?.key === props?.enterParams?.limitField)?.title,
);

const limitCount = computed(() =>
  props?.enterParams?.limitField ? props?.data[props?.enterParams?.limitField] : 10000000,
);
const changeState = () => {
  testInputEmptyAndSpecial(itemState.remark);
  if (itemState?.count && limitCount.value && +itemState?.count > +limitCount.value) {
    // 入库
    if (limitLabel.value && props?.enterParams.countLabel) {
      const name = limitLabel.value?.includes('数量')
        ? limitLabel.value
        : `${limitLabel.value}数量`;
      showInfo(`${props?.enterParams.countLabel}不可大于${name}`);
    } else {
      // 采购数量
      showInfo(`数量不能超过${limitCount.value}`);
    }
    itemState.count = limitCount.value;
  }

  const data = {
    ...props.data,
    ...(props.enterParams?.remarkName
      ? { [props.enterParams?.remarkName]: itemState.remark }
      : { remark: itemState.remark }),
    ...(props.enterParams?.countFileName
      ? { [props.enterParams?.countFileName]: itemState.count }
      : { count: itemState.count }),
  };
  emit('onChange', data);
};

const handlePriceFormat = (val?: number | string) => {
  if (isNil(val)) return;
  if (!isNil(+val) && +val < 0) {
    itemState.price = 0;
    return;
  }
  itemState.price = (+val ?? 0).toFixed(2);
};

const handleOpen = () => {
  open.value = !open.value;
  emit('onOpen', props.data?.id || '');
};

const handleDelete = () => {
  emit('onDelete', props.data?.id);
};

const schema = computed(() => {
  switch (props.enterParams.type) {
    case SelectorTypeEnum.purchase:
      return cloneDeep(contentSchema.purchase).filter((v: any) => v.key !== 'name');
    case SelectorTypeEnum.warehouse:
      return cloneDeep(contentSchema.warehouse).filter((v: any) => !['no', 'name'].includes(v.key));
    case SelectorTypeEnum.base:
      return contentSchema.base;
    default:
      return back;
  }
});

watch(
  () => props.openId,
  val => {
    open.value = val === props.data?.id;
  },
  { immediate: true },
);

watch(
  () => props.open,
  val => {
    open.value = val;
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.enter-header {
  display: flex;
  width: 100%;
  &-right {
    display: flex;
    justify-content: space-between;
    flex: 1;
  }
  &-text {
    margin-left: 32rpx;
  }
  &-icon {
    display: flex;
    align-items: center;
  }
}
.enter-content {
  margin: 24rpx 0 24rpx 80rpx;
  &-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    align-items: center;
    width: 100%;
  }
  &-label {
    color: #000000a6;
    font-size: 30rpx;
    margin-right: 32rpx;
  }
}
</style>
