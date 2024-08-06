<template>
  <view class="bg-fill-default pt-l mlr-l">
    <c-card v-if="handleTypeArray?.length > 1" class="mb-b">
      <view class="flex-around handle-type-container">
        <view
          v-for="item in handleTypeArray"
          :key="item?.value"
          class="handle-type-item flex-grow flex-center"
          :class="[item?.value === selectedHandleType ? 'selected-handle-type' : 'handle-type']"
          @click="handleTypeChange(item?.value as HandleTypeCodeEnum)"
        >
          {{ item?.label }}
        </view>
      </view>
    </c-card>
    <c-card v-if="selectedHandleType === HandleTypeCodeEnum.DISPOSE">
      <c-radio-group value="0" class-name="flex-column-plain" @change="handleWayChange">
        <c-radio
          v-for="item in HandleWayEnum ?? []"
          :key="item.value"
          class-name="box-border mtb-s font-regular font-title color-base text-left no-bold"
          :name="item.value"
        >
          {{ item.label }}
        </c-radio>
      </c-radio-group>
    </c-card>
    <c-card v-else-if="selectedHandleType === HandleTypeCodeEnum.UPGRADE">
      <view class="upgrade-title">升级选择</view>
      <view class="flex flex-between mtb-s">
        <view class="no-shrink font-title">选择方式</view>
        <c-radio-group
          :value="UpgradeTypeCodeEnum.PERSON"
          class-name="flex-right"
          @change="handleWayChange"
        >
          <c-radio
            v-for="item in UpgradeTypeEnum ?? []"
            :key="item.value"
            class-name="box-border mtb-s ml-b font-regular font-title color-base text-left no-bold"
            :name="item.value"
          >
            {{ item.label }}
          </c-radio>
        </c-radio-group>
      </view>
      <view class="flex flex-between mtb-s">
        <view class="no-shrink font-title">选择范围</view>
        <view class="flex flex-center" @click="handleSelector">
          <view v-if="!selectedNameStr" class="color-placeholder lh-10">请选择</view>
          <view v-else class="selected-name lh-10">{{ selectedNameStr }}</view>
          <c-icon
            name="icon_arrow_right"
            size="48"
            :color-type="selectedNameStr ? '' : 'placeholder'"
          />
        </view>
      </view>
    </c-card>
    <c-card class="mt-b">
      <c-input
        font-size="content"
        type="textarea"
        min-height="107"
        placeholder="请输入处理描述"
        maxlength="50"
        @input="textAreaInput"
      />
      <view
        class="mb-b mr-l h-36 font-regular font-secondary color-placeholder text-right lh-5 no-bold"
        >{{ disposeDescription.length + '/50' }}</view
      >
    </c-card>

    <c-bottom>
      <slot />
      <c-button class="mt-xs mlr-l" @click="handleConfirm">确定</c-button>
    </c-bottom>
  </view>
</template>
<script lang="ts" setup>
import {
  HandleTypeCodeEnum,
  HandleTypeEnum,
  UpgradeTypeCodeEnum,
  UpgradeTypeEnum,
} from '@/app-school-safe/constants/HandleTypeEnum';
import { HandleWayEnum } from '@/app-school-safe/constants/HandleWayEnum';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import { showInfo } from '@/utils/tools';
import { computed, ref, toRefs } from 'vue';
interface IProps {
  handleTypes?: HandleTypeCodeEnum[];
  selectedHandleType?: HandleTypeCodeEnum; // 处理方式
  selectedWay: string; // 处置-处理方式 升级-升级方式
  selectedIds?: string[]; // 升级选择的人员或部门
  disposeDescription: string; // 处理描述
}

const props = withDefaults(defineProps<IProps>(), {
  handleTypes: () => [HandleTypeCodeEnum.DISPOSE],
  selectedHandleType: HandleTypeCodeEnum.DISPOSE,
  selectedIds: () => [],
  disposeDescription: '',
});

const { handleTypes, selectedHandleType, selectedWay, selectedIds } = toRefs(props);

const emits = defineEmits([
  'confirm',
  'update:selectedHandleType',
  'update:selectedWay',
  'update:selectedIds',
  'update:disposeDescription',
]);

// 界面上展示的处理方式选项
const handleTypeArray = computed(() => {
  return handleTypes.value?.map(item => {
    return HandleTypeEnum.find(jtem => jtem.value === item);
  });
});

const selectedNameStr = ref<string>();

// 切换处理方式
const handleTypeChange = (value: number) => {
  emits('update:selectedHandleType', value);
  emits(
    'update:selectedWay',
    value === HandleTypeCodeEnum.DISPOSE ? '0' : UpgradeTypeCodeEnum.PERSON,
  );
  emits('update:selectedIds', []);
  selectedNameStr.value = undefined;
};

// 选择处理/升级的处理方式
const handleWayChange = (value: string) => {
  emits('update:selectedWay', value);
};

// 输入描述
const textAreaInput = (value: string) => {
  emits('update:disposeDescription', value);
};

const handleSelector = () => {
  showSelector<false>({
    type:
      Number(selectedWay.value) === UpgradeTypeCodeEnum.PERSON
        ? SelectorTypeEnum.person
        : SelectorTypeEnum.department,
    value: selectedIds.value,
    callback: (value, data) => {
      emits('update:selectedIds', value);
      const selectedNames = (data || []).map(item => item.name);
      selectedNameStr.value = selectedNames.length
        ? selectedNames.length === 1
          ? selectedNames[0]
          : `${selectedNames[0]}(共${selectedNames.length}个)`
        : undefined;
    },
  });
};

const handleConfirm = () => {
  if (selectedHandleType.value === HandleTypeCodeEnum.UPGRADE && !selectedIds.value?.length) {
    return showInfo(
      `请选择${UpgradeTypeEnum.find(item => item.value === Number(selectedWay.value))?.label}范围`,
    );
  }
  emits('confirm');
};
</script>

<style scoped lang="scss">
.handle-type-container {
  column-gap: 24rpx;
}
.handle-type-item {
  padding: 20rpx 0;
}
.handle-type {
  color: $color-text;
  background-color: $color-bg-container-disabled;
}
.selected-handle-type {
  color: $color-primary;
  background-color: $blue-01;
}
.upgrade-title {
  color: $color-text;
  font-weight: 500;
  font-size: 32rpx;
}
.selected-name {
  color: $color-text;
}
</style>
