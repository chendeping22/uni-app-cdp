<template>
  <view class="object-form-wrap">
    <view class="top-area">
      <view class="left">
        <view v-if="!!value.updater" class="people">{{ value.updater }}</view>
        <view v-if="value.updateTime" class="time">{{
          dayjs(value.updateTime).format('YYYY-MM-DD HH:mm:ss')
        }}</view>
      </view>
      <view class="right button-area">
        <template v-if="preview">
          <u-button
            v-if="allowDelete"
            plain
            style="margin-right: 8px"
            :disabled="!authFlag"
            @click="visible2 = true"
          >
            <u-icon name="trash" :size="32"></u-icon>
            <text class="button-text">删除</text>
          </u-button>
          <u-button
            plain
            :disabled="!authFlag"
            :custom-style="{ color: !authFlag ? 'rgba(0, 0, 0, 0.3)' : '#1677ff' }"
            @click="editHandle"
          >
            <u-icon name="edit-pen" :size="32"></u-icon>
            <text class="button-text">编辑</text>
          </u-button>
        </template>
        <!-- <template v-else>
          <text style="margin-right: 8px" @click="cancelHandle">取消</text>
          <text @click="submitHandle">保存</text>
        </template> -->
      </view>
    </view>
    <u-empty v-show="isAdd" text="去添加基本信息" style="margin-top: 120rpx">
      <template #bottom>
        <u-button style="height: 80rpx" type="primary" @click="editHandle">去添加</u-button>
      </template>
    </u-empty>
    <Form
      v-show="!isAdd"
      ref="formRef"
      :schema="schema"
      :dictionaries="dictionaries"
      :preview="preview"
      :initial-data="initialData"
      @submitHandlePure="submitHandlePure"
    >
    </Form>
  </view>
  <u-modal
    v-model="visible2"
    confirm-text="确定"
    show-cancel-button
    title=""
    content="确认删除吗"
    @confirm="deleteHandle"
  >
  </u-modal>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, type PropType } from 'vue';
import type { FieldsGroup } from '../../types/schema.ts';
import Form from './Form.vue';

// import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
// import { theme } from 'ant-design-vue';

const props = defineProps({
  schema: {
    type: Object as PropType<FieldsGroup>,
    required: true,
  },
  dictionaries: {
    type: Object as PropType<Record<string, any[]>>,
    default: () => ({}),
  },
  allowDelete: {
    type: Boolean,
    default: false,
  },
  preview: {
    type: Boolean,
    default: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  authFlag: {
    type: Boolean,
    default: true,
  },
  isAdd: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'cancel'): void;
  (e: 'submit', data: any): void;
  (e: 'delete'): void;
}>();

const formRef = ref();
const value = ref<any>({});

const visible2 = ref(false);

const editHandle = () => {
  emit('edit');
};
const cancelHandle = () => {
  emit('cancel');
};
const submitHandle = async () => {
  const values = await formRef.value?.submit();
  if (!values) {
    return Promise.reject();
  }
  emit('submit', values);
};
const submitHandlePure = values => {
  emit('submit', values);
};
const deleteHandle = () => {
  emit('delete');
};

defineExpose({
  setValue: (data: any) => {
    value.value = data;
    setTimeout(() => {
      formRef.value?.setValue?.(data);
    });
  },
  goEditPage(data: any) {
    // formRef.value?.setValue?.(data);
    formRef.value?.goEditPage(props.isAdd ? props.initialData : data);
  },
});

// onMounted(() => {
//   if (props.isAdd) {
//     editHandle();
//   }
// });
</script>

<style scoped lang="scss">
.object-form-wrap {
  /* width: 100%;
  height: 100%;
  overflow: auto; */
  padding: 24rpx 32rpx;
  background-color: #f5f5f5;
  .top-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14rpx;
    font-size: 26rpx;
    .left {
      display: flex;
      align-items: center;
      color: rgba(0, 0, 0, 0.65);

      .people {
        margin-right: 12rpx;
      }
      .time {
        flex: none;
        margin-right: 12rpx;
      }
    }
    .right {
      display: flex;
      align-items: center;
      /* .edit-area {
        color: #1677ff;
      } */
    }
    .button-area {
      flex: none;
      .u-btn {
        padding: 0;
        font-size: 26rpx;
        height: 36rpx;
        background-color: transparent;
        &::after {
          display: none;
        }
      }
      .button-text {
        margin-left: 12rpx;
      }
    }
  }
  .info-block {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx 32rpx;
    overflow: hidden;
    .info-item {
      font-size: 30rpx;
      display: flex;
      justify-content: space-between;
      .label {
        color: rgba(0, 0, 0, 0.45);
        width: 50%;
      }
      .content {
        color: rgba(0, 0, 0, 0.88);
        width: 50%;
        text-align: right;
        word-break: break-word;
      }
      & + .info-item {
        margin-top: 16rpx;
      }
    }
  }
}
</style>
