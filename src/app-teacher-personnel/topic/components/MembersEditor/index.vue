<template>
  <view>
    <view v-if="mode === 'select'" class="selector-wrap" @click="handleSelectPersons()">
      <view class="items-wrap">
        <template v-if="modelValue?.length">
          <view v-for="item in modelValue" :key="item.userId" class="item">
            <text class="item-name">{{ item.name }}</text>
            <view class="item-del" @click.stop="handleDeleteMember(item)">
              <u-icon name="close" :size="24" color="#000000a6"></u-icon>
            </view>
          </view>
        </template>
        <view v-else class="placeholder">
          <text>请选择成员</text>
        </view>
      </view>
      <view class="arrow-wrap">
        <u-icon name="arrow-right" color="#00000073"></u-icon>
      </view>
    </view>
    <view v-if="modelValue?.length" class="list-wrap">
      <view v-for="item in modelValue" :key="item.userId" class="item">
        <u-image class="icon" width="48rpx" height="48rpx" :src="avatarDefault"></u-image>
        <text class="item-name">{{ item.name }}</text>
        <text v-if="mode === 'add'" class="item-btn" @click="handleDeleteMember(item)">删除</text>
        <text class="item-btn" @click="handleEditMember(item)">编辑</text>
      </view>
    </view>
    <view v-if="mode === 'add'" class="btn-add" @click="handleSelectPersons()">
      <u-icon :size="40" class="icon" name="plus-circle-fill"></u-icon>
      <text class="text">新增成员</text>
    </view>
  </view>
  <u-popup v-model="showEditPopup" mode="bottom" :border-radius="16">
    <view class="popup-wrap">
      <view class="header">
        <view class="btn cancel-btn" @click="showEditPopup = false">
          <text>取消</text>
        </view>
        <view class="title">
          <text>编辑个人信息</text>
        </view>
        <view class="btn" @click="handlePopupSubmit">
          <text>保存</text>
        </view>
      </view>
      <view class="body">
        <SchemaForm
          @mounted="formRef = $event"
          :schema="memberSchema"
          :dictionaries="dictionaries"
          :preview="false"
        ></SchemaForm>
      </view>
    </view>
  </u-popup>
</template>
<script setup lang="ts">
import SchemaForm from '@/app-teacher-personnel/components/SchemaForm/Form.vue';
import { memberSchema } from '@/app-teacher-personnel/topic/helper/schema';
import { useDictionaries } from '@/app-teacher-personnel/utils/dicts';
import showSelector from '@/components/selector/show-selector';
import { SelectorTypeEnum } from '@/components/selector/types';
import avatarDefault from '@/static/avatar.png';
import dayjs from 'dayjs';
import { compact, filter, find, map } from 'lodash-es';
import { nextTick, ref } from 'vue';
import { getInitMembers } from '../../api/topicMember';

const props = withDefaults(
  defineProps<{
    modelValue: any[] | null;
    disabledItemIds: string[];
    maxCount: number;
    mode: 'select' | 'add';
  }>(),
  {
    modelValue: () => [],
    disabledItemIds: () => [],
    maxCount: 1,
    mode: 'select',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]);
  (e: 'change', value: any[]);
}>();

const changeModelValue = (value: any[]) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const dictionaries = useDictionaries([memberSchema]);

const formRef = ref();

const showEditPopup = ref(false);

const handleSelectPersons = (isAdd = false) => {
  const userIds = map(props.modelValue, m => m.userId);
  const disabledItemIds = [...(props.disabledItemIds || []), ...(isAdd ? userIds : [])];
  showSelector({
    type: SelectorTypeEnum.person,
    multiple: true,
    value: isAdd ? [] : userIds,
    disabledItemIds,
    callback: async (value, data) => {
      const userIds = compact(
        map(data, (p: any) => {
          return p.level === 2 && p.id;
        }),
      );
      const userList = userIds?.length ? await getInitMembers(userIds) : [];
      const oldList = props.modelValue || [];
      let newModelValue = map(userList, o => {
        const oldItem = find(oldList, i => i.userId === o.userId);
        return (
          oldItem || {
            id: o.id,
            name: o.name,
            birthday: o.birthday ? dayjs(o.birthday) : o.birthday,
            workOrg: o.workOrg,
            techPost: o.techPost,
            researchExpertise: o.researchExpertise,
            userId: o.userId,
          }
        );
      });
      if (isAdd) {
        newModelValue = [...oldList, ...newModelValue];
      }
      if (newModelValue.length > props.maxCount) {
        uni.showToast({
          title: `课题组成员上限${props.maxCount}人`,
          duration: 3000,
          icon: 'none',
        });
        return;
      }
      changeModelValue(newModelValue);
    },
  });
};

const handleDeleteMember = (item: any) => {
  const newModelValue = filter(props.modelValue, m => m.userId !== item.userId);
  changeModelValue(newModelValue);
};

const handleEditMember = (item: any) => {
  showEditPopup.value = true;
  nextTick(() => {
    formRef.value?.setValue?.(item);
  });
};

const handlePopupSubmit = async () => {
  const formValues = await formRef.value?.submit();
  const newModelValue = map(props.modelValue, m => {
    if (m.userId === formValues.userId) {
      return {
        ...m,
        ...formValues,
      };
    }
    return m;
  });
  changeModelValue(newModelValue);
  showEditPopup.value = false;
};
</script>
<style lang="scss" scoped>
.selector-wrap {
  display: flex;
  align-items: baseline;
  .items-wrap {
    display: flex;
    flex-wrap: wrap;
    margin: -10rpx;
    flex: auto;
  }
  .item {
    padding: 6rpx 16rpx;
    display: flex;
    align-items: center;
    background-color: #0000000a;
    border-radius: 8rpx;
    margin: 10rpx;
  }
  .item-name {
    font-size: 26rpx;
    line-height: 36rpx;
    color: #000000a6;
  }
  .item-del {
    margin-left: 20rpx;
  }
  .placeholder {
    height: 48rpx;
    margin: 10rpx;
    color: #00000073;
    display: flex;
    align-items: center;
  }
  .arrow-wrap {
    flex: none;
  }
}
.list-wrap {
  margin-top: 32rpx;
  .item {
    padding: 16rpx 0;
    display: flex;
    border-top: 1rpx solid #0000000f;
    align-items: center;
    &:last-child {
      border-bottom: 1rpx solid #0000000f;
    }
  }
  .icon {
    margin-right: 32rpx;
    flex: none;
  }
  .item-name {
    flex: auto;
    font-size: 32rpx;
    color: #000000e0;
  }
  .item-btn {
    flex: none;
    font-weight: 500rpx;
    font-size: 26rpx;
    color: #1677ff;
    padding: 16rpx;
  }
}
.btn-add {
  color: #1677ff;
  align-items: center;
  display: flex;
  margin-top: 26rpx;
  .text {
    display: inline-block;
    margin-left: 28rpx;
    margin-bottom: 4rpx;
  }
}
.popup-wrap {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-bottom: 1px solid #0000000f;
    .btn {
      flex: none;
      color: #1677ff;
      font-size: 32rpx;
      line-height: 44rpx;
      &.cancel-btn {
        color: #000000a6;
      }
    }
    .title {
      flex: auto;
      font-size: 34rpx;
      color: #000000e0;
      line-height: 48rpx;
      text-align: center;
    }
  }
}
</style>
