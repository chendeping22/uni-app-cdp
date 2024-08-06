<template>
  <u-modal
    v-model="showModal"
    v-bind="modalProps"
    @confirm="confirmHandle"
    @cancel="cancelHandle"
  ></u-modal>
</template>
<script setup lang="ts">
import { noop } from 'lodash-es';
import { ref } from 'vue';

export type ConfirmParams = {
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
};

const showModal = ref(false);
const promiseHandle = ref({
  resolve: noop as (value: boolean) => void,
  reject: noop as (value: boolean) => void,
});
const modalProps = ref<any>({});

const confirmHandle = () => {
  promiseHandle.value?.resolve(true);
};

const cancelHandle = () => {
  promiseHandle.value?.resolve(false);
};

const showModalHandle = (showConfirmButton: boolean) => async (params: ConfirmParams) => {
  showModal.value = true;
  modalProps.value = {
    showTitle: !!params.title,
    showCancelButton: true,
    showConfirmButton,
    ...params,
  };
  return new Promise<boolean>((resolve, reject) => {
    promiseHandle.value = { resolve, reject };
  });
};

defineExpose({
  confirm: showModalHandle(true),
  alert: showModalHandle(false),
});
</script>
<style lang="scss" scoped></style>
