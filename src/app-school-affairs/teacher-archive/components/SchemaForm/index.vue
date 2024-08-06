<template>
  <ObjectForm
    v-if="schema.type === 'Object'"
    ref="objectFormRef"
    :schema="schema"
    :dictionaries="dictionaries"
    :preview="preview"
    :auth-flag="authFlag"
    :initial-data="initialData"
    :is-add="!initialPreview"
    @cancel="cancelHandle"
    @edit="editHandle"
    @submit="submitHandle"
  ></ObjectForm>
  <ArrayForm
    v-if="schema.type === 'Array'"
    ref="arrayFormRef"
    :schema="schema"
    :dictionaries="dictionaries"
    :auth-flag="authFlag"
    @submit="arrayFormSubmitHandle"
    @delete="arrayFormDeleteHandle"
  >
    <template #tabs>
      <slot name="tabs"></slot>
    </template>
  </ArrayForm>
</template>
<script setup lang="ts">
import { ref, type PropType } from 'vue';
import type { FieldsGroup } from '../../types/schema';
import ArrayForm from './ArrayForm.vue';
import ObjectForm from './ObjectForm.vue';

const props = defineProps({
  schema: {
    type: Object as PropType<FieldsGroup>,
    required: true,
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
  authFlag: {
    type: Boolean,
    default: true,
  },
  initialPreview: {
    type: Boolean,
    default: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'delete', id: string): void;
}>();

const formValue = ref<any>({});

const objectFormRef = ref();
const arrayFormRef = ref();

const preview = ref(props.initialPreview);

const cancelHandle = () => {
  preview.value = true;
  objectFormRef.value?.setValue(formValue.value);
};
const editHandle = () => {
  // preview.value = false;
  // objectFormRef.value?.setValue(formValue.value);
  objectFormRef.value?.goEditPage(formValue.value);
};
const submitHandle = (data: any) => {
  console.log('ccc ...... > data:', data);
  emit('submit', {
    id: !props.initialPreview ? '' : formValue.value.id,
    data,
  });
};

const arrayFormSubmitHandle = (data: any) => {
  console.log('...... > arrayFormSubmitHandle > data:', data);
  emit('submit', data);
};

const arrayFormDeleteHandle = (id: string) => {
  console.log('...... > arrayFormDeleteHandle > id:', id);
  emit('delete', id);
};

defineExpose({
  setValue: (data: any, resetEditStatus = false) => {
    formValue.value = data;
    if (props.schema.type === 'Object') {
      setTimeout(() => {
        objectFormRef.value?.setValue?.(data);
        if (resetEditStatus) {
          preview.value = true;
        }
      });
    } else if (props.schema.type === 'Array') {
      setTimeout(() => {
        arrayFormRef.value?.setValue?.(data, resetEditStatus);
      });
    }
  },
  setPreview: (value: boolean) => {
    preview.value = value;
  },
});
</script>

<style scoped lang="scss"></style>
