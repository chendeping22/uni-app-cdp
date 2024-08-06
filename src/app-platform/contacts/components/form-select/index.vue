<template>
  <FormItem
    :title="title"
    :value="label"
    :required="required"
    :need-line="needLine"
    :show-clear="showClear"
    :show-del="showDel"
    @del="$emit('del')"
    @onClick="showSelect = true"
    @onClear="$emit('onClear')"
  >
  </FormItem>
  <u-select
    v-model="showSelect"
    :list="list"
    :title="selectTitle"
    confirm-text="确定"
    safe-area-inset-bottom
    @confirm="handleConfirmNew"
  />
</template>
<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import FormItem from '../form-item/index.vue';
const props = defineProps({
  title: { type: String, default: '' },
  selectTitle: { type: String, default: '请选择' },
  autoCloseAfterSelect: { type: Boolean, default: true },
  showCheckIcon: { type: Boolean, default: true },
  titleType: { type: String, default: 'icon' },
  required: {
    type: Boolean,
    default: true,
  },
  list: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  showClear: {
    type: Boolean,
    default: false,
  },
  needLine: {
    type: Boolean,
    default: false,
  },
  showDel: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:list', 'onClear', 'del', 'change']);
const showSelect = ref(false);

const label = computed(() => {
  return props.list.find((item: any) => item.checked)?.label || '';
});

const handleSelect = (inx: number) => {
  if (!props.autoCloseAfterSelect) return;
  const newList = props.list.map((item: any, index: number) => {
    return {
      ...item,
      checked: index === inx,
    };
  });
  emits('update:list', newList);
};

const handleConfirm = (inx: number[]) => {
  const newList = props.list.map((item: any, index: number) => {
    return {
      ...item,
      checked: index === inx[0],
    };
  });
  emits('update:list', newList);
};

const handleConfirmNew = (res: any) => {
  const newList = props.list.map((item: any) => {
    return {
      ...item,
      checked: item.value === res[0].value,
    };
  });
  emits('update:list', newList);
  emits('change', res);
};
</script>
