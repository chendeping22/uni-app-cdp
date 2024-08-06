<script lang="ts" setup>
import { getDeptList } from '@/app-general-affairs-logistics/services/assets-manage.ts';
import { computed, ref, unref, watch } from 'vue';

const props = defineProps<{
  userId: string;
  showDepartment: boolean;
}>();

const emit = defineEmits<{
  (event: 'resetValue', value: any): void;
  (event: 'cancel'): void;
}>();

const options = ref<{ value: string; label: string }[]>([]);

watch(
  () => props.userId,
  async newVal => {
    console.log(newVal, 'newVal');
    if (newVal) {
      const res = await getDeptList(newVal);
      options.value = (res || []).map((i: any) => {
        return { value: i.id, label: i.name };
      });
      emit('resetValue', options.value[0]);
    }
  },
  {
    immediate: true,
  },
);
const cancel = () => {
  emit('cancel');
};
const confirm = (val: any) => {
  emit('resetValue', val[0]);
  emit('cancel');
};
const show = computed(() => unref(props.showDepartment));
</script>
<template>
  <u-select
    v-model="show"
    :list="options"
    :mask-close-able="false"
    @cancel="cancel"
    @confirm="confirm"
  ></u-select>
</template>
