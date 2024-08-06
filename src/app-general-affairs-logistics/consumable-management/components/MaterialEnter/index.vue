<template>
  <view>
    <view class="material-enter">
      <view v-if="state.list?.length" class="material-collapse">
        <view
          v-for="(item, index) in state.list"
          :key="item.id"
          :index="index"
          class="material-collapse-item"
        >
          <EnterItem
            :open="index === 0"
            :data="item"
            :open-id="openId"
            :enter-params="enterParams"
            @on-open="handleOpenItem"
            @on-delete="handleDeleteItem"
            @on-change="handleItemChange"
          />
        </view>
      </view>
      <u-empty-custom v-else :text="enterParams?.emptyTxt"></u-empty-custom>
      <view v-if="showAdd" class="material-enter-btn">
        <u-button :custom-style="{ color: '#1677ff' }" @click="handleSelect"
          ><u-icon name="plus" color="#2979ff" size="24" style="margin-right: 12rpx"></u-icon
          >手选添加</u-button
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import showSelector from '@/app-general-affairs-logistics/consumable-management/pages/material-selector/show-selector';
import { cloneDeep, map } from 'lodash-es';
import { PropType, reactive, ref, watch } from 'vue';
import { IMaterialEnterParams, SelectorTypeEnum } from '../../types/material';
import EnterItem from './EnterItem.vue';

const emit = defineEmits<{
  (e: 'update:value', data: any[]): void;
}>();

const props = defineProps({
  enterParams: {
    type: Object as PropType<IMaterialEnterParams>,
    default: {
      showPrice: false,
      emptyTxt: undefined,
      countLabel: undefined,
      remarkLabel: '备注',
      countFileName: undefined,
      type: undefined,
      priceLabel: undefined,
      limitField: undefined,
    },
  },
  value: {
    type: Array,
    default: [],
  },
  showAdd: {
    type: Boolean,
    default: true,
  },
});

const state = reactive<{
  list: any[];
}>({
  list: [],
});
const openId = ref<string>('');

const handleItemChange = (val?: Record<string, any>) => {
  const list = map(cloneDeep(state.list), v => (v.id === val?.id ? val : v));
  emit('update:value', list);
};

const handleDeleteItem = (id: string) => {
  state.list = cloneDeep(state.list).filter(i => i.id !== id);
  emit('update:value', state.list);
};

const handleOpenItem = (id: string) => {
  openId.value = id;
};

const handleSelect = () => {
  const enterType = props?.enterParams?.type || SelectorTypeEnum.base;
  showSelector({
    value: state.list,
    type: (props?.enterParams?.type || SelectorTypeEnum.base) as SelectorTypeEnum,
    disabledIds: state.list.map((i: any) =>
      enterType === SelectorTypeEnum.base ? i?.baseId || i.id : i.id,
    ),
    callback: data => {
      state.list = data;
      emit('update:value', state.list);
    },
  });
};

watch(
  () => props?.value,
  val => {
    if (val) {
      state.list = val;
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss" scoped>
.material-enter {
  padding: 24rpx 32rpx;
  &-btn {
    margin-top: 48rpx;
  }
}
.material-collapse {
  &-item {
    padding: 24rpx 0;
    border-bottom: 0.5px solid #0000000f;
  }
}
</style>
