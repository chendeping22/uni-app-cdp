<template>
  <view>
    <form-card :title="infoConfig?.title">
      <template #content>
        <template v-for="item in infoConfig.list" :key="item.value">
          <u-field
            v-if="!item?.key"
            v-model="formState[item.value]"
            :label="item.label"
            :placeholder="item?.placeholder"
            disabled
            :clearable="false"
            label-width="200"
            input-align="right"
          >
          </u-field>
          <u-field
            v-else
            v-model="formState[item.value]"
            :label="item.label"
            :placeholder="item?.placeholder"
            label-width="200"
            right-icon="arrow-right"
            disabled
            :clearable="false"
            input-align="right"
            @click="showDepartment = true"
          >
          </u-field>
        </template>
        <SelectorUserDepartment
          :show-department="showDepartment"
          :user-id="formState.applyUserId"
          @reset-value="getDepartment"
          @cancel="showDepartment = false"
        ></SelectorUserDepartment>
      </template>
    </form-card>
  </view>
</template>

<script setup lang="ts">
import SelectorUserDepartment from '@/app-general-affairs-logistics/assets-manage/components/SelectorUserDepartment';
import FormCard from '@/app-general-affairs-logistics/consumable-management/components/FormCard.vue';
import { PropType, ref } from 'vue';
interface IConfig {
  title?: string;
  list?: {
    value: string;
    label?: string;
    placeholder?: string;
  }[];
}
const emit = defineEmits<{
  (e: 'getDepartment', val: any): void;
}>();
const showDepartment = ref<boolean>(false);
const getDepartment = (val: any) => {
  emit('getDepartment', val);
};
const props = defineProps({
  formState: {
    type: Object,
    default: {},
  },
  infoConfig: {
    type: Object as PropType<IConfig>,
    default: {},
  },
});
</script>

<style lang="scss" scoped></style>
