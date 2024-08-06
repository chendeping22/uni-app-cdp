<script setup lang="ts">
import { loginStore } from '@/store/modules/login';
import { computed, nextTick, ref, type PropType } from 'vue';
import { convert } from './helper/utils';
import type { FieldsGroup } from './types/schema';
// import { PlusCircleFilled } from '@ant-design/icons-vue';
// import { theme } from 'ant-design-vue';
import { filter, forEach } from 'lodash-es';
import Empty from '../Empty/index.vue';
import ObjectForm from './ObjectForm.vue';
import { NEW_ID } from './helper/constants';

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
});

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'delete', id: string): void;
}>();

// const { token } = theme.useToken();
// console.log('...... > token:', token);
const listValue = ref<any[]>([]);

const formRef = ref();

const editId = ref('');

const addDisabled = computed(() => {
  return false;
  // return !!find(listValue.value, v => v.id === NEW_ID);
});

const resetForm = () => {
  forEach(listValue.value, (v, i) => {
    formRef.value?.[i]?.setValue?.(v);
  });
};

const extData = computed(() => {
  // console.log('🚀ccc ~ extData ~ extData:', loginStore().userInfo.locationName);
  return {
    locationName: loginStore().userInfo?.locationName,
  };
});

const defaultFormData = computed(() => {
  const result: any = {};
  forEach(props.schema.fields, f => (result[f.name] = convert(f.default, {}, extData.value)));
  return result;
});

const addHandle = async (disabled: boolean) => {
  if (disabled) {
    return;
  }
  // listValue.value = [
  //   {
  //     id: NEW_ID,
  //   },
  //   ...listValue.value,
  // ];
  // editId.value = NEW_ID;

  uni.navigateTo({
    url: `/app-school-affairs/teacher-archive/edit/index`,
    events: {
      dataToParent: function (data) {
        console.log('🚀ccc ~ dataToParent :', data);
        // emit('submitHandlePure', data);
        emit('submit', {
          id: '',
          // id: editId.value === NEW_ID ? '' : editId.value,
          data,
        });
      },
    },
    success: function (res) {
      // 通过eventChannel向被打开页面传送数据
      res.eventChannel.emit('dataToChild', {
        props: { ...props },
        formData: { ...defaultFormData.value },
      });
    },
  });

  // 刷新dom后listValue的new才能渲染出来，才有ref，
  // 有问题：app会闪一下出现再跳过去页面，小程序则直接不跳页面
  // await nextTick();
  // formRef.value?.[0]?.goEditPage({});

  // 有问题：app会闪一下出现再跳过去页面，小程序跳过去再回来不会去掉新增的，可能是onBackPress的updateArrayForm不生效？
  // nextTick(() => {
  //   setTimeout(() => {
  //     formRef.value?.[0]?.goEditPage({});
  //   }, 100);
  // });
};

const editHandle = async (id: string, index: number) => {
  // cancelHandle();
  // await nextTick();
  // editId.value = id;
  // resetForm();
  editId.value = id;
  formRef.value?.[index]?.goEditPage(listValue.value[index]);
};
const cancelHandle = () => {
  if (editId.value === NEW_ID) {
    listValue.value = filter(listValue.value, v => v.id !== NEW_ID);
  } else {
    resetForm();
  }

  editId.value = '';
};
const deleteHandle = async (id: string) => {
  cancelHandle();
  await nextTick();
  emit('delete', id);
};
const submitHandle = (data: any) => {
  emit('submit', {
    id: editId.value === NEW_ID ? '' : editId.value,
    data,
  });
};

defineExpose({
  setValue: (data: any, resetEditStatus = false) => {
    listValue.value = [];
    nextTick(() => {
      listValue.value = data;
      setTimeout(() => {
        if (resetEditStatus) {
          editId.value = '';
        }
        forEach(data, (val, i) => {
          // 小程序：没有300延迟，编辑保存后后退页面不刷新
          setTimeout(() => {
            formRef.value?.[i]?.setValue?.(val);
          }, 300);
        });
      }, 0);
    });
  },
});

// onBeforeMount(() => {
//   uni.$on('updateArrayForm', cancelHandle);
// });

// onBeforeUnmount(() => {
//   uni.$off('updateArrayForm', cancelHandle);
// });
</script>
<template>
  <view
    class="fix-add-button"
    :class="addDisabled || !authFlag ? 'disabled' : ''"
    @click="addHandle(addDisabled || !authFlag)"
    ><u-icon name="plus" :size="30"></u-icon
  ></view>
  <view class="array-form-wrap">
    <slot name="tabs"></slot>
    <ObjectForm
      v-for="(value, index) in listValue"
      :key="value.id"
      ref="formRef"
      :schema="schema"
      :dictionaries="dictionaries"
      allow-delete
      :preview="editId !== value.id || true"
      :auth-flag="authFlag"
      @delete="deleteHandle(value.id)"
      @edit="editHandle(value.id, index)"
      @submit="submitHandle"
      @cancel="cancelHandle()"
    >
    </ObjectForm>
    <Empty v-if="listValue.length === 0">
      <!-- <template #description>
        <view>暂无{{ schema.title }}信息</view>
        <view>您可以直接将国家教师信息系统导出的档案进行导入</view>
      </template> -->
    </Empty>
  </view>
</template>
<style scoped lang="scss">
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.title {
  line-height: 28px;
  font-size: 20px;
  font-weight: bold;
}
.fix-add-button {
  position: fixed;
  right: 32rpx;
  bottom: 92rpx;
  height: 92rpx;
  width: 92rpx;
  background-color: #1677ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 10;
  &.disabled {
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>
