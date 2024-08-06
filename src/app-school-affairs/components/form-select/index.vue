<template>
  <FormItem :title="title" :value="label" :required="required" :show-clear="showClear" @onClick="showSelect = true"
    @onClear="$emit('onClear')">
  </FormItem>
  <c-select v-model:show="showSelect" :list="list" :title="selectTitle" :title-type="titleType"
    :auto-close-after-select="autoCloseAfterSelect" :show-check-icon="showCheckIcon" @onSelect="handleSelect"
    @onConfirm="handleConfirm" />
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import FormItem from '../form-item/index.vue';
export default defineComponent({
  components: { FormItem },
  props: {
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
  },
  emits: ['update:list', 'onClear', 'change'],
  setup(props, ctx) {
    const showSelect = ref(false);

    const label = computed(() => {
      return props.list.find((item: any) => item.checked)?.text || '';
    });

    const handleSelect = (inx: number) => {
      if (!props.autoCloseAfterSelect) return;
      const newList = props.list.map((item: any, index: number) => {
        return {
          ...item,
          checked: index === inx,
        };
      });
      ctx.emit('update:list', newList);
    };

    const handleConfirm = (inx: number[]) => {
      const newList = props.list.map((item: any, index: number) => {
        return {
          ...item,
          checked: index === inx[0],
        };
      });
      ctx.emit('update:list', newList);
      ctx.emit('change', inx);
    };
    return { showSelect, label, handleSelect, handleConfirm };
  },
});
</script>
