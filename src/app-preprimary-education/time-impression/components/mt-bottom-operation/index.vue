<template>
  <view style="position: fixed; bottom: 0; width: 100%">
    <view class="flex-center bg-white">
      <view
        v-for="(item, inx) in displayList"
        :key="`mt_bottom_operation_${inx}`"
        class="flex-column ptb-xs w-208"
        @click="handleClickItem(item)"
      >
        <c-icon :name="item.icon" :size="48" color-type="base" />
        <view class="color-placeholder font-desc mt-xxs">{{ item.label }}</view>
      </view>
    </view>
    <c-empty-line :need-safe-bottom="true" :height="'0px'" bg-type="white" />
  </view>

  <c-action-sheet
    v-model:show="showActionSheet"
    :list="actionSheetList"
    @on-select="handleSelect"
  />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';

export interface IOpreItem {
  label: string;
  value: string;
  icon: string;
  url?: string;
}
interface IProps {
  list: IOpreItem[];
}

interface ICActionSheetItem {
  text: string;
  value: string;
  colorType: IColor;
  disabled: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  list: () => [],
});

const emits = defineEmits(['onClickOpre']);

const showActionSheet = ref(false);

const displayList = computed(() => {
  const { list } = props;
  if (list.length <= 3) return list;
  else {
    const tmp = list.slice(0, 2);
    tmp.push({
      label: '更多',
      icon: 'icon_more',
      value: 'mt_bottom_operation_more',
    });
    return tmp;
  }
});

const actionSheetList = computed(() => {
  const { list } = props;
  if (list.length <= 3) return [] as ICActionSheetItem[];
  else
    return list.slice(2).map(t => {
      return {
        text: t.label,
        value: t.value,
        disabled: false,
        colorType: 'base',
      } as ICActionSheetItem;
    });
});

const handleClickItem = (item: IOpreItem) => {
  if (item.value === 'mt_bottom_operation_more') {
    showActionSheet.value = true;
  } else {
    emits('onClickOpre', item);
  }
};

const handleSelect = (inx: number) => {
  const tmp = actionSheetList.value[inx].value;
  const item = props.list.find(t => t.value === tmp);
  emits('onClickOpre', item);
};
</script>
