<template>
  <page>
    <view
      class="content-wrap"
      style="height: calc(100vh - 128rpx - var(--window-top) - env(safe-area-inset-bottom))"
    >
      <view>
        <u-form
          ref="formRef"
          :model="formDataBaseInfo"
          label-position="top"
          :error-type="['message', 'border-bottom']"
        >
          <view class="card">
            <view class="title strong"
              ><text>{{ levelName ? `【${levelName}】` : '' }}{{ batchName }}</text></view
            >
          </view>

          <view class="card">
            <view class="title"> <text>课题名称</text><text class="required-mark"></text> </view>
            <view class="content">
              <u-form-item :border-bottom="false" prop="name">
                <view class="form-item-inner">
                  <u-input
                    v-model="formDataBaseInfo.name"
                    type="textarea"
                    :height="68"
                    auto-height
                    :maxlength="50"
                  />
                </view>
              </u-form-item>
            </view>
          </view>
        </u-form>

        <view class="card">
          <view class="title"> <text>课题主持人</text></view>
          <view class="content2">
            <SchemaForm
              :schema="schema"
              :dictionaries="dictionaries"
              :preview="false"
              @mounted="formHostMounted"
            ></SchemaForm>
          </view>
        </view>

        <view class="card">
          <view class="title"> <text>课题组成员</text><text class="required-mark"></text> </view>
          <MembersEditor
            v-model="members"
            :max-count="memberLimit"
            :disabled-item-ids="[hostUserId]"
            @change="validateMembers"
          ></MembersEditor>
          <view v-if="!membersValidState.valid" class="error-msg">
            <text>{{ membersValidState.msg }}</text>
          </view>
        </view>

        <view class="card transparent-card">
          <view class="title"> <text>申报材料</text><text class="required-mark"></text> </view>
        </view>

        <div v-for="(item, index) in files" :key="index" class="card">
          <view class="group">
            <view class="title"> 模板材料{{ index + 1 }}：</view>
            <UploadFile :default-file-list="item.templateFiles" disabled></UploadFile>
          </view>
          <view class="group">
            <view class="title"> 申报材料{{ index + 1 }}：</view>
            <UploadFile
              :disabled="uploading"
              :max-size="50"
              :default-file-list="item.materialFiles"
              @after-upload="handleAfterUpload($event, item)"
              @before-upload="uploading = true"
              @upload-finished="uploading = false"
            ></UploadFile>
            <view v-if="item.invalid" class="error-msg">
              <text>请上传文件</text>
            </view>
          </view>
        </div>
      </view>
    </view>
    <view class="page-bottom">
      <u-button v-if="!!id" class="btn btn-icon" type="error" plain @click="handleDelete"
        ><u-icon name="trash"></u-icon
      ></u-button>
      <u-button class="btn" plain @click="handleSubmit(true)">存为草稿</u-button>
      <u-button class="btn" plain @click="handleCancel">取消</u-button>
      <u-button class="btn" type="primary" @click="handleSubmit()">提交</u-button>
    </view>
    <Confirm ref="confirmRef"></Confirm>
  </page>
</template>

<script setup lang="ts">
import SchemaForm from '@/app-teacher-personnel/components/SchemaForm/Form.vue';
import { detail as getTopicBatchDetail } from '@/app-teacher-personnel/topic/api/topicBatch';
import {
  deleteTopic,
  getTopicDetail,
  save,
  update,
} from '@/app-teacher-personnel/topic/api/topicInfo';
import MembersEditor from '@/app-teacher-personnel/topic/components/MembersEditor/index.vue';
import { schema } from '@/app-teacher-personnel/topic/helper/schema';
import { getLevelName } from '@/app-teacher-personnel/topic/helper/utils';
import { useDictionaries } from '@/app-teacher-personnel/utils/dicts';
import { loginStore } from '@/store/modules/login';
import { onLoad, onReady } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { filter, find, forEach, map, pick } from 'lodash-es';
import { computed, getCurrentInstance, onBeforeUnmount, reactive, ref, unref } from 'vue';
import { getInitMember } from '../api/topicMember';
import Confirm from '../components/confirm/index.vue';
import UploadFile from '../components/upload/UploadFile.vue';

const instance: any = getCurrentInstance()?.proxy;
const eventChannel = instance?.getOpenerEventChannel();

const store = loginStore();
const { userInfo } = store;
const confirmRef = ref<InstanceType<typeof Confirm>>();

const delta = ref(1);
const batchId = ref('');
const id = ref('');
const batchDetail = ref<any>({});
const topicDetail = ref<any>({});
const hostUserId = ref('');
const memberLimit = ref(0);
const membersValidState = ref({
  valid: true,
  msg: '',
});
const members = ref<any[]>([]);
const formRef = ref();
const formRefHost = ref<InstanceType<typeof SchemaForm>>();
const timerRef = ref<any>();
const formHostMounted = (e: any) => {
  formRefHost.value = e;
};

onBeforeUnmount(() => {
  clearTimeout(timerRef.value);
});
const formHostSetValue = async (data: any) => {
  return new Promise<void>((resolve, reject) => {
    if (formRefHost.value?.setValue) {
      formRefHost.value?.setValue(data);
      return resolve();
    }
    let n = 0;
    const retry = () => {
      clearTimeout(timerRef.value);
      n++;
      if (n > 20) {
        return reject();
      }
      timerRef.value = setTimeout(() => {
        if (formRefHost.value?.setValue) {
          formRefHost.value?.setValue(data);
          resolve();
        } else {
          retry();
        }
      }, 1000);
    };
    retry();
  });
};
const formDataBaseInfo = reactive({
  name: '',
});
const levelName = computed(() => {
  const level = batchDetail.value?.level ?? topicDetail.value?.level;
  return getLevelName(level);
});
const batchName = computed(() => {
  return batchDetail.value?.title || topicDetail.value?.batchTitle;
});
type File = {
  fileId: string;
  name: string;
  url: string;
};
type FileItem = {
  templateFiles: File[];
  materialFiles: File[];
  invalid: boolean;
};
const files = ref<FileItem[]>([]);
const handleAfterUpload = (event: any[], item: FileItem) => {
  item.materialFiles = event;
  item.invalid = !event?.length;
};
const uploading = ref(false);

const rules = {
  name: [{ required: true, message: '请输入课题名称', trigger: ['change', 'blur'] }],
};

const dictionaries = useDictionaries([schema]);

const toMyTopics = () => {
  uni.navigateBack();
  // if (!!id.value) {
  //   //编辑
  //   uni.redirectTo({
  //     url: '/app-teacher-personnel/topic/index?tab=mine',
  //   });
  // } else {
  //   //创建
  //   uni.redirectTo({
  //     url: '/app-teacher-personnel/topic/declare/Detail?id=' + batchId.value,
  //   });
  // }
};

//创建和编辑返回
// const saveBack = () => {
//   uni.navigateBack({delta:delta.value});
//   // uni.redirectTo({
//   //   url: '/app-teacher-personnel/topic/index?tab=mine',
//   // });
// };

const validateBaseInfo = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) {
    return Promise.reject({ valid });
  }
  return Promise.resolve(formDataBaseInfo);
};

const validateFiles = async () => {
  let valid = true;
  files.value?.forEach(f => {
    f.invalid = !f.materialFiles?.length;
    if (f.invalid) {
      valid = false;
    }
  });
  if (!valid) {
    return Promise.reject({ valid });
  }
  return Promise.resolve(files);
};

const validateMembers = async () => {
  if (!members.value?.length) {
    membersValidState.value = {
      valid: false,
      msg: '请选择课题组成员',
    };
    return Promise.reject(membersValidState.value);
  } else if (members.value?.length > memberLimit.value) {
    membersValidState.value = {
      valid: false,
      msg: `课题组成员上限${memberLimit.value}人`,
    };
    return Promise.reject(membersValidState.value);
  }
  membersValidState.value = {
    valid: true,
    msg: ``,
  };
  return Promise.resolve(members.value);
};

const handleDelete = async () => {
  if (
    !(await confirmRef.value?.confirm({
      title: '',
      content: '确认删除该数据吗？',
    }))
  ) {
    return;
  }
  await deleteTopic(id.value);
  uni.showToast({
    title: '删除成功',
    duration: 3000,
    icon: 'success',
  });
  uni.$emit('topicDetailModified');
  eventChannel?.emit('topicDetailModified', {});
  // saveBack();
  setTimeout(() => {
    uni.navigateBack();
  }, 2000);
};

const handleCancel = async () => {
  if (
    !(await confirmRef.value?.confirm({
      title: '',
      content: '是否取消课题申报',
    }))
  ) {
    return;
  }
  toMyTopics();
};

const handleSubmit = async (isDraft = false) => {
  // 存草稿不用校验，提交需要校验
  if (!isDraft) {
    await Promise.all([
      validateBaseInfo(),
      formRefHost.value?.submit(true),
      validateFiles(),
      validateMembers(),
    ]);
  }
  const formDataHost = formRefHost.value?.getFormData();
  const data: any = {
    ...pick(unref(topicDetail), ['batchId', 'batchName', 'id', 'memberLimit', 'name']),
    ...unref(formDataBaseInfo),
  };
  if (id.value) {
    data.id = id.value;
  }
  if (batchId.value) {
    data.batchId = batchId.value;
  }
  // 新增时 分待审核、草稿
  data.declareStatus = isDraft ? 0 : 1;
  data.compere = {
    ...unref(formDataHost),
    birthday: (formDataHost.birthday as dayjs.Dayjs)?.startOf?.('day').valueOf(),
  };
  data.members = map(unref(members), (m: any) => ({
    ...m,
    birthday: (m?.birthday as dayjs.Dayjs)?.startOf?.('day').valueOf(),
  }));
  data.declareMaterials = filter(
    map(unref(files), f => {
      return {
        materialFileId: f.materialFiles?.[0]?.fileId,
        templateFileId: f.templateFiles?.[0]?.fileId,
      };
    }),
    f => !!f.materialFileId,
  );
  if (id.value) {
    await update(id.value, data);
  } else {
    await save(data);
  }
  uni.showToast({
    title: isDraft ? '草稿保存成功' : '提交成功',
    duration: 3000,
    icon: 'success',
  });
  // 课题申报页进入
  if (delta.value > 1) {
    uni.$emit('changeTopicTabbar');
  }
  uni.$emit('topicDetailModified');
  eventChannel?.emit('topicDetailModified');
  // saveBack();
  setTimeout(() => {
    uni.navigateBack({ delta: delta.value });
  }, 2000);
};

const initFiles = () => {
  if (batchId.value) {
    files.value.length = 0;
    forEach(batchDetail.value?.materials?.[0]?.attachmentList, a => {
      const f = {
        templateFiles: [
          {
            fileId: a.fileId,
            name: a.fileName,
            url: a.fileUrl,
          } as File,
        ],
        materialFiles: [] as File[],
        invalid: false,
      };
      files.value.push(f);
    });
  } else if (id.value) {
    files.value.length = 0;
    forEach(topicDetail.value?.stageInfoList[0]?.templateFiles, (t: any) => {
      const materialFile = find(
        topicDetail.value?.stageInfoList[0]?.materialFiles,
        (m: any) => m.templateFileId === t.fileId,
      );
      const f = {
        templateFiles: [
          {
            fileId: t.fileId,
            name: t.fileName,
            url: t.fileUrl,
          } as File,
        ],
        materialFiles: (materialFile
          ? [
              {
                fileId: materialFile.fileId,
                name: materialFile.fileName,
                url: materialFile.fileUrl,
              },
            ]
          : []) as File[],
        invalid: false,
      };
      files.value.push(f);
    });
  }
};

const initHost = async () => {
  if (batchId.value) {
    hostUserId.value = userInfo?.id || '';
    const res: any = await getInitMember(hostUserId.value);
    const data = {
      userId: res.userId,
      name: res.name,
      gender: res.gender,
      nation: res.nation,
      birthday: res.birthday ? dayjs(res.birthday) : undefined,
      adminPost: res.adminPost,
      techPost: res.techPost,
      researchExpertise: res.researchExpertise,
      lastEducation: res.lastEducation,
      lastDegree: res.lastDegree,
      phone: res.phone,
      email: res.email,
      postalCode: res.postalCode,
      workOrg: res.workOrg,
      contactAddress: res.contactAddress,
    };
    await formHostSetValue(data);
  } else if (id.value) {
    hostUserId.value = topicDetail.value?.compere?.userId;
    const birthday = topicDetail.value?.compere?.birthday;
    await formHostSetValue({
      ...topicDetail.value?.compere,
      birthday: birthday ? dayjs(birthday) : undefined,
    });
  }
};

const initMembers = () => {
  if (batchId?.value) {
    memberLimit.value = batchDetail.value?.memberLimit || 1;
    members.value = [];
  } else if (id.value) {
    memberLimit.value = topicDetail.value?.memberLimit || 1;
    members.value = map(topicDetail.value.members, (m: any) => {
      return {
        ...m,
        birthday: m.birthday ? dayjs(m.birthday) : m.birthday,
      };
    });
  }
};

const init = async () => {
  if (id.value) {
    // 编辑
    const res = await getTopicDetail(id.value);
    topicDetail.value = res;
    formDataBaseInfo.name = topicDetail.value.name;
  } else if (batchId.value) {
    // 新增
    const res = await getTopicBatchDetail(batchId.value);
    batchDetail.value = res;
  }
  initFiles();
  initMembers();
  await initHost();
};

onLoad(options => {
  batchId.value = options?.batchId;
  id.value = options?.id;
  delta.value = +options?.delta || 1;
  init();
});

onReady(() => {
  formRef.value?.setRules(rules);
});
</script>

<style scoped lang="scss">
.content-wrap {
  padding: px2rpx(12px) px2rpx(16px);
  overflow: auto;
}
.page-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
  z-index: 2;
  .btn {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
    &.btn-icon {
      flex: none;
    }
  }
}
.card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 24rpx 32rpx;
  &:not(:first-child) {
    margin-top: 24rpx;
  }
  &.transparent-card {
    background-color: transparent;
    padding: 24rpx 0;
    margin-bottom: 0;
  }
  .group:not(:last-child) {
    margin-bottom: 24rpx;
  }
  .error-msg {
    color: #ff4d4f;
    font-size: 24rpx;
    margin-top: 8rpx;
  }
  .title {
    font-size: 32rpx;
    line-height: 44rpx;
    color: #000000e0;
    display: flex;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 16rpx;
    }
    &.strong {
      font-weight: bold;
    }
  }
  .content2 {
    margin-left: -32rpx;
    margin-right: -32rpx;
    :deep(.form-wrap-body) {
      padding-bottom: 0;
    }
  }
}
.content {
  :deep(.u-form-item) {
    padding: 0;
    display: block;
  }
  .form-item-inner {
    flex: auto;
  }
}
.required-mark {
  color: #ff4d4f;
  font-size: 30rpx;
  line-height: 40rpx;
  margin-inline-start: 8rpx;
  &::after {
    display: inline;
    content: '*';
    font-family: SimSun, sans-serif;
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
