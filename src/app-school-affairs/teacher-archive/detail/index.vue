<template>
  <!-- loading -->
  <view class="teacher-archive-detail">
    <u-tabs
      v-model="currentGroupIndex"
      name="title"
      :list="schema"
      @change="groupTabChange"
    ></u-tabs>
    <view class="teacher-archive-detail-body">
      <!-- <BasePane v-show="currentTabObj.id === TabIdEnum.base" /> -->
      <!-- <view v-show="loading" class="loading">
        <u-loading></u-loading>
      </view> -->
      <!-- <u-mask :show="true" :mask-click-able="false">
        <template #default>
          <u-loading></u-loading>
        </template>
      </u-mask> -->
      <Form
        :key="currentSchema.name"
        ref="formRef"
        :schema="currentSchema"
        :dictionaries="dictionaries"
        :initial-preview="!isAdd"
        :initial-data="bindData"
        :auth-flag="authFlag"
        @submit="submitHandleWrap"
        @delete="deleteHandleWrap"
      >
        <template v-if="tabs.length" #tabs>
          <u-tabs
            v-model="currentTabIndex"
            class="u-sub-tabs"
            name="title"
            :list="tabs"
            @change="tabChange"
          ></u-tabs>
          <!-- <view class="sub-tabs">
            <view ref="subTabsRef" class="inner">
              <view
                v-for="(item, index) in tabs"
                :key="item.title"
                :class="['tabitem', index == currentTabIndex ? 'active' : '']"
                @click="tabChange(index)"
              >
                {{ item.title }}
              </view>
            </view>
          </view> -->
        </template>
      </Form>
    </view>
  </view>
</template>
<script setup lang="ts">
// import { message, theme } from 'ant-design-vue';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { find, findIndex, map, pick } from 'lodash-es';
import { computed, ref, watch } from 'vue';
import Form from '../components/SchemaForm/index.vue';
import {
  createArchiveBaseInfo,
  createSubInfo,
  deleteSubInfo,
  getArchiveBaseInfo,
  getSubInfoList,
  updateArchiveBaseInfo,
  updateSubInfo,
} from '../helper/api.ts';
import { useAuth } from '../helper/auth';
import { useDictionaries } from '../helper/dicts.ts';
import schema from '../helper/schema/index';
import { inputFormDataFormat, outputFormDataFormat } from '../helper/utils.ts';
import type { FieldsGroup, Group, TabsGroup } from '../types/schema';

// const route = useRoute();
// const router = useRouter();
// const { token } = theme.useToken();
// const confirm = useConfirm();
const formRef = ref();
const { authFlag } = useAuth();

const baseId = ref();
const isAdd = ref();
const bindData = ref();
// const baseId = computed(() => '547064448406584197');

const dictionaries = useDictionaries(schema);

const currentGroup = ref(schema[0].name);
const currentTab = ref('');
const setCurrentTab = (tabName = '') => (currentTab.value = tabName);
const setCurrentGroup = (groupName: string) => {
  if (isAdd.value) {
    // message.warn('请先保存基本信息');
    uni.showToast({
      title: '请先添加基本信息',
    });
    return;
  }
  if (currentGroup.value === groupName) {
    return;
  }
  currentGroup.value = groupName;
  setCurrentTab((find(schema, (g: Group) => g.name === groupName) as TabsGroup)?.groups?.[0].name);
};

const tabs = computed(() => {
  const group = find(schema, (g: Group) => g.name === currentGroup.value)!;
  return (group as TabsGroup).groups || [];
});

const currentSchema = computed(() => {
  const group = find(schema, (g: Group) => g.name === currentGroup.value)!;
  if ((group as FieldsGroup).fields) {
    return group as FieldsGroup;
  }
  const tab = find((group as TabsGroup).groups, g => g.name === currentTab.value)!;
  return tab;
});

const loading = ref(false);

const loadData = async () => {
  if (isAdd.value) {
    return;
  }
  loading.value = true;
  if (currentSchema.value.name === 'info') {
    return getArchiveBaseInfo(baseId.value)
      .then(res => {
        const formData = inputFormDataFormat(res, currentSchema.value.fields);
        formRef.value?.setValue(formData, true);
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    return getSubInfoList(currentSchema.value.name, baseId.value)
      .then(res => {
        const formData = map(res, item => inputFormDataFormat(item, currentSchema.value.fields));
        if (currentSchema.value.type === 'Array') {
          formRef.value?.setValue(formData, true);
        } else if (currentSchema.value.type === 'Object') {
          formRef.value?.setValue(formData[0] || {}, true);
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

async function submitHandleWrap(...rest) {
  await submitHandle(...rest);
  uni.$emit('updateTeacherMyPanel');
  uni.$emit('editGoBack');
}

const submitHandle = async ({ data, id }: any) => {
  if (currentSchema.value.name === 'info') {
    if (!id) {
      // 新增会从我的档案直接到edit/index页面，所以不会进入这里了
      loading.value = true;
      const res = await createArchiveBaseInfo(
        outputFormDataFormat(data, currentSchema.value.fields),
      ).catch(e => {
        loading.value = false;
        return Promise.reject(e);
      });
      // message.success('保存成功');
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
      loading.value = false;
      // 因为有uni.$emit('editGoBack')，所以这里只需要返回一层
      uni.navigateBack();
      // uni.redirectTo({
      //   url: `/app-school-affairs/teacher-archive/detail/index?id=${res.id}`,
      // });
    } else {
      loading.value = true;
      await updateArchiveBaseInfo(id, outputFormDataFormat(data, currentSchema.value.fields)).catch(
        e => {
          loading.value = false;
          return Promise.reject(e);
        },
      );
      // message.success('保存成功');
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
      await loadData();
    }
  } else {
    loading.value = true;
    if (!id) {
      await createSubInfo(currentSchema.value.name, {
        ...outputFormDataFormat(data, currentSchema.value.fields),
        baseId: baseId.value,
      }).catch(e => {
        loading.value = false;
        return Promise.reject(e);
      });
      // message.success('保存成功');
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
      await loadData();
    } else {
      await updateSubInfo(currentSchema.value.name, id, {
        ...outputFormDataFormat(data, currentSchema.value.fields),
        baseId: baseId.value,
      }).catch(e => {
        loading.value = false;
        return Promise.reject(e);
      });
      // message.success('保存成功');
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
      await loadData();
    }
  }
};

async function deleteHandleWrap(...rest) {
  await deleteHandle(...rest);
  uni.$emit('updateTeacherMyPanel');
}

const deleteHandle = async (id: string) => {
  // todocybl
  // if (
  //   !(await confirm({
  //     content: '确定删除？',
  //   }))
  // ) {
  //   return;
  // }
  loading.value = true;
  await deleteSubInfo(currentSchema.value.name, id).catch(e => {
    loading.value = false;
    return Promise.reject(e);
  });
  // message.success('删除成功');
  uni.showToast({
    title: '删除成功',
    icon: 'success',
  });
  await loadData();
};

watch(
  currentSchema,
  () => {
    loadData();
  },
  {
    // immediate: true,
  },
);

// const changeLogsModalRef = ref();
// const openChangesLog = () => {
//   changeLogsModalRef.value?.open(baseId.value);
// };

// const back = () => {
//   router.back();
// };

// const init = () => {
//   if (!route.query.id) {
//     return;
//   }
// };

// init();
// 自己加的
const currentGroupIndex = computed(() => {
  return findIndex(schema, (g: Group) => g.name === currentGroup.value);
});
const currentTabIndex = computed(() => {
  return findIndex(tabs.value, (g: Group) => g.name === currentTab.value);
});

function groupTabChange(index: number) {
  setCurrentGroup(schema[index].name);
}

function tabChange(index: number) {
  setCurrentTab(tabs.value[index].name);
}

onLoad(options => {
  baseId.value = options.id;
  isAdd.value = options.type === 'add';
  try {
    if (options.userId) {
      const data = pick(JSON.parse(options.userInfo), [
        // 'userId',
        'name',
        'certType',
        'certNumber',
        'bindTel',
      ]);
      if (data['certType'] === '1' && data['certNumber']?.length >= 14) {
        const date = dayjs(data.certNumber.slice(6, 14), 'YYYYMMDD');
        if (date.isValid()) {
          data['birthday'] = date;
        }
      }
      bindData.value = {
        userId: options.userId,
        ...data,
      };
    }
  } catch (error) {}
  if (options.id) {
    loadData();
  }
});
</script>

<style scoped lang="scss">
.teacher-archive-detail {
  display: flex;
  flex-direction: column;
  padding-bottom: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  // #ifdef H5
  height: calc(100vh - 88rpx);
  // #endif
  // #ifdef APP-PLUS || MP-WEIXIN
  height: calc(100vh);
  // #endif
  .teacher-archive-detail-body {
    flex: 1;
    overflow: auto;
  }
  .loading {
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }

  /* .u-sub-tabs {
    .u-tab-item {
      height: 64rpx;
      line-height: 64rpx;
      flex: none;
      background-color: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.65);
      padding: 0 32rpx;
      margin-right: 16rpx;
      border-radius: 200rpx;
    }
  } */
  /* :active-item-style="{
              backgroundColor: '#1677ff',
              color: '#fff',
            }" */

  .sub-tabs {
    overflow-y: hidden;
    overflow-x: auto;
    padding: 0 32rpx;
    margin-top: 24rpx;
    &::webkit-scrollbar {
      display: none;
    }
    .inner {
      display: flex;
    }
    .u-tab-item {
      background-color: rgba(0, 0, 0, 0.06);
    }
    .tabitem {
      height: 64rpx;
      line-height: 64rpx;
      flex: none;
      background-color: rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.65);
      padding: 0 32rpx;
      margin-right: 16rpx;
      border-radius: 200rpx;
      &.active {
        background-color: #1677ff;
        color: #fff;
      }
    }
  }
}

// #ifdef MP-WEIXIN
/* 兼容wx小程序 */
:deep(.form-block--common) {
  .u-form {
    .u-form-item {
      padding: 13rpx 0;
    }
    .u-form-item--left {
      flex: none !important;
      width: auto !important;
      max-width: 50%;
      padding-right: 32rpx;
      line-height: 44rpx;
    }
    .u-form-item__body {
      padding: 0 32rpx;
      min-height: 56rpx;
    }
    .u-form-item--right__content__slot {
      display: flex;
      flex-direction: row-reverse;
    }
    .u-form-item__message {
      padding-right: 32rpx !important;
      text-align: right !important;
    }
    .pure-text {
      line-height: 44rpx;
      color: rgba(0, 0, 0, 0.25);
    }
    .u-input__textarea {
      /* min-height: 70rpx !important; */
      padding: 0;
    }
    .textarea-form-item {
      .u-form-item--left__content {
        align-self: flex-start;
      }
    }

    .dictDisabled {
      .uni-input-placeholder {
        color: rgba(0, 0, 0, 0.25) !important;
      }
    }

    .uni-input-placeholder {
      color: rgba(0, 0, 0, 0.45) !important;
    }
  }
}

:deep(.object-form-wrap) {
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

// #endif
</style>
