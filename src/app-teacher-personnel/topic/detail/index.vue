<template>
  <page custom-overflow="visible">
    <view
      v-if="loading"
      style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center"
    >
      <u-loading></u-loading>
    </view>
    <view v-else-if="!isDeleted && !isDraft && !isNoAccess" class="page-wrap">
      <view class="card">
        <view class="title">
          <text>{{ topicInfo.name }}</text>
        </view>
        <Descriptions
          :dictionaries="dictionaries"
          empty-placeholder="-"
          :record="topicInfo"
          :items="[
            { field: 'batchTitle', label: '申报批次' },
            { field: 'locationName', label: '申报单位' },
          ]"
        ></Descriptions>
      </view>
      <view class="card">
        <view class="title">
          <text>课题主持人</text>
        </view>
        <view class="host-head">
          <view class="head-icon">
            <u-image width="112rpx" height="112rpx" :src="avatarDefault"></u-image>
          </view>
          <view class="info">
            <view class="host-title">
              <text>{{ topicInfo.compere?.name }}</text>
              <u-image
                v-if="topicInfo.compere?.gender === '1'"
                class="host-gender"
                width="40rpx"
                height="40rpx"
                :src="maleSvg"
              ></u-image>
              <u-image
                v-if="topicInfo.compere?.gender === '2'"
                class="host-gender"
                width="40rpx"
                height="40rpx"
                :src="femaleSvg"
              ></u-image>
            </view>
            <view v-if="!!topicInfo.compere?.adminPost">
              <Tag color="blue" :text="topicInfo.compere?.adminPost"></Tag>
            </view>
          </view>
        </view>
        <Descriptions
          :dictionaries="dictionaries"
          :record="topicInfo.compere"
          empty-placeholder="-"
          :items="[
            {
              label: '专业技术职务',
              field: 'techPost',
              type: 'dict',
              code: 'teacherArchive.TechPosition',
            },
            {
              label: '最后学位',
              field: 'lastDegree',
              type: 'dict',
              code: 'teacherArchive.DegreeLevel',
            },
            { label: '电话', field: 'phone' },
            { label: '民族', field: 'nation', type: 'dict', code: 'teacherArchive.Nation' },
            { label: '出生日期', field: 'birthday', type: 'date', format: 'YYYY-MM-DD' },
            { label: '研究专长', field: 'researchExpertise' },
            {
              label: '最后学历',
              field: 'lastEducation',
              type: 'dict',
              code: 'teacherArchive.Education',
            },
            { label: 'Email', field: 'email' },
            { label: '邮政编码', field: 'postalCode' },
            { label: '工作单位', field: 'workOrg' },
            { label: '通讯地址', field: 'contactAddress' },
          ]"
        ></Descriptions>
      </view>
      <view class="card">
        <view class="title">
          <text>课题组成员</text>
          <template
            v-if="
              isHost &&
              (topicInfo.stage === 1 || topicInfo.stage === 2) &&
              topicInfo.declareStatus !== 6 &&
              !isRejected &&
              !isAdminRoleView
            "
          >
            <view v-if="!isMembersEdit">
              <text class="link" @click="editMember">修改成员</text>
            </view>
            <view v-else>
              <text class="link" @click="cancelEditMember">取消</text>
              <text class="link" @click="saveEditMember">保存</text>
            </view>
          </template>
        </view>
        <u-collapse
          v-if="!isMembersEdit"
          event-type="close"
          arrow
          :accordion="false"
          :head-style="{
            borderBottom: '1rpx solid #0000000F',
          }"
        >
          <u-collapse-item
            v-for="(item, index) in topicInfo.members"
            :key="item.id"
            :index="index"
            :open="index === 0"
          >
            <template #title>
              <view class="member-title">
                <u-image
                  class="member-icon"
                  width="48rpx"
                  height="48rpx"
                  :src="avatarDefault"
                ></u-image>
                <text class="member-name">{{ item.name }}</text>
              </view>
            </template>
            <view class="collapse-item">
              <Descriptions
                :dictionaries="dictionaries"
                :record="item"
                empty-placeholder="-"
                :items="[
                  { label: '出生日期', field: 'birthday', type: 'date', format: 'YYYY-MM-DD' },
                  {
                    label: '专业技术职务',
                    field: 'techPost',
                    type: 'dict',
                    code: 'teacherArchive.TechPosition',
                  },
                  { label: '研究专长', field: 'researchExpertise' },
                  { label: '工作单位', field: 'workOrg' },
                ]"
              ></Descriptions>
            </view>
          </u-collapse-item>
        </u-collapse>
        <template v-else>
          <MembersEditor
            v-model="membersEditorData"
            :max-count="topicInfo.memberLimit"
            :disabled-item-ids="[topicInfo.compere.userId]"
            mode="add"
            @change="validateMembers"
          ></MembersEditor>
          <view v-if="!membersValidState.valid" class="error-msg">{{ membersValidState.msg }}</view>
        </template>
      </view>
      <view class="card-tabs">
        <u-tabs
          v-model="currentTabIndex"
          :list="[{ name: '阶段信息' }, { name: '研究动态' }]"
          bg-color="transparent"
        ></u-tabs>
      </view>
      <view v-show="currentTabIndex === 0" class="tab-pan-wrap">
        <StageCard
          v-for="(item, idx) in topicInfo?.stageInfoList"
          :key="item.id"
          :topic="topicInfo"
          :stage-info="item"
          :is-first="idx === 0"
          @reload="init()"
          :isAdminRoleView="isAdminRoleView"
        >
        </StageCard>
      </view>
      <view v-show="currentTabIndex === 1" class="tab-pan-wrap">
        <ResearchTrendsCard
          :topic="topicInfo"
          @reload="init()"
          :isAdminRoleView="isAdminRoleView"
        ></ResearchTrendsCard>
      </view>
    </view>
    <view v-else-if="isNoAccess" class="page-wrap">
      <EmptyPage description="没有查看权限"> </EmptyPage>
    </view>
    <view v-else-if="isDeleted" class="page-wrap">
      <EmptyPage description="课题已被删除，查看其他课题">
        <u-button v-if="!hideDeletedButton" type="primary" @click="toList">{{
          deletedText
        }}</u-button>
      </EmptyPage>
    </view>
    <view v-else-if="isDraft" class="page-wrap">
      <EmptyPage description="课题已被撤回，查看其他课题">
        <u-button v-if="!hideDeletedButton" type="primary" @click="toList">{{
          deletedText
        }}</u-button>
      </EmptyPage>
    </view>
    <view class="u-fixed-placeholder safe-area-inset-bottom"></view>
    <template v-if="withdrawBtnVisible">
      <view class="page-bottom page-bottom-ghost safe-area-inset-bottom">
        <u-button class="btn" type="primary" plain>撤回申请</u-button>
      </view>
      <view class="page-bottom safe-area-inset-bottom">
        <u-button class="btn" type="primary" plain @click="handleWithdraw">撤回申请</u-button>
      </view>
    </template>
    <template v-if="isRejected">
      <view class="page-bottom page-bottom-ghost safe-area-inset-bottom">
        <u-button class="btn" type="primary" plain>编辑</u-button>
      </view>
      <view class="page-bottom safe-area-inset-bottom">
        <u-button class="btn" type="primary" plain @click="editTopic">编辑</u-button>
      </view>
    </template>
    <Confirm ref="confirmRef"></Confirm>
  </page>
</template>
<script setup lang="ts">
import MembersEditor from '@/app-teacher-personnel/topic/components/MembersEditor/index.vue';
import avatarDefault from '@/static/avatar.png';
import femaleSvg from '@/static/icon_sex_female.svg';
import maleSvg from '@/static/icon_sex_man.svg';
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { find, forEach, map } from 'lodash-es';
import { computed, onBeforeMount, ref } from 'vue';
import { getTopicDetail, updateMembers, withdraw } from '../api/topicInfo';
import EmptyPage from '../components/EmptyPage/index.vue';
import Tag from '../components/Tag/index.vue';
import Confirm from '../components/confirm/index.vue';
import Descriptions from '../components/descriptions/index.vue';
import { DictCodes } from '../helper/constants';
import { useDictionaries } from '../helper/dicts';
import ResearchTrendsCard from './components/ResearchTrendsCard.vue';
import StageCard from './components/StageCard.vue';

const store = loginStore();
const { userInfo } = store;
const confirmRef = ref<InstanceType<typeof Confirm>>();

// 被删除的情况下，不展示删除按钮
const hideDeletedButton = ref(false);
const type = ref();
const id = ref('');
const topicInfo = ref<any>({});
const dictionaries = useDictionaries(DictCodes);
const currentTabIndex = ref(0);
/** 当前用户是否是主持人 */
const isHost = computed(() => userInfo?.id === topicInfo.value?.compere?.userId);
/** 当前用户是否是课题组成员 */
// const isMember = computed(() => {
//   return !!find(topicInfo.value?.members, (m) => m.userId === userInfo?.id);
// });
const isDeleted = ref(false);
const isDraft = ref(false);
const isNoAccess = ref(false);
const loading = ref(false);
const isRejected = computed(() => {
  return (
    (topicInfo.value?.declareStatus === 5 || topicInfo.value?.declareStatus === 4) &&
    topicInfo.value?.compere?.userId === userInfo?.id
  );
});

const membersEditorData = ref<any[] | null>(null);
const isMembersEdit = computed(() => !!membersEditorData.value);
const membersValidState = ref({
  valid: true,
  msg: '',
});
const editMember = () => {
  membersEditorData.value = map(topicInfo.value?.members, (m: any) => {
    return {
      ...m,
      birthday: m.birthday ? dayjs(m.birthday) : m.birthday,
    };
  });
};
const cancelEditMember = () => {
  membersEditorData.value = null;
  membersValidState.value = {
    valid: true,
    msg: '',
  };
};
const validateMembers = async () => {
  if (!membersEditorData.value?.length) {
    membersValidState.value = {
      valid: false,
      msg: '请选择课题组成员',
    };
    return Promise.reject(membersValidState.value);
  } else if (membersEditorData.value?.length > topicInfo.value?.memberLimit) {
    membersValidState.value = {
      valid: false,
      msg: `课题组成员上限${topicInfo.value?.memberLimit}人`,
    };
    return Promise.reject(membersValidState.value);
  }
  membersValidState.value = {
    valid: true,
    msg: ``,
  };
  return Promise.resolve(membersEditorData.value);
};

const saveEditMember = async () => {
  await validateMembers();
  const data = map(membersEditorData.value, (m: any) => ({
    name: m.name,
    birthday: m.birthday ? m.birthday.startOf('day').valueOf() : m.birthday,
    workOrg: m.workOrg,
    techPost: m.techPost,
    researchExpertise: m.researchExpertise,
    userId: m.userId,
  }));
  await updateMembers(id.value, data);
  uni.showToast({
    title: '修改成功',
    duration: 3000,
  });
  await init();
};

// 仅在立项前允许操作，立项后按钮隐藏不展示
const withdrawBtnVisible = computed(() => {
  // 主持人 && 待审批状态
  let isCompere = topicInfo.value?.compere?.userId === userInfo?.id;
  let isApproval = topicInfo.value?.declareStatus === 1 || topicInfo.value?.declareStatus === 2;
  return isCompere && isApproval && !isAdminRoleView.value;
});

// 比如我作为管理员，我去申报了课题，1.那如果我从课题管理进入，我只能驳回/通过 2.如果我从我的课题进入，那我只能撤回/修改成员
const isAdminRoleView = computed(() => {
  return type.value === 'manage';
});

const deletedText = computed(() => {
  return isAdminRoleView.value ? '返回课题管理' : '返回我的课题';
});

const toList = () => {
  uni.redirectTo({
    url: `/app-teacher-personnel/topic/index?tab=${type.value}`,
  });
};

const init = async (modified = true, isFirst = false) => {
  if (modified) {
    uni.$emit('topicDetailModified');
  }
  if (isFirst) {
    loading.value = true;
  }
  const res: any = await getTopicDetail(id.value, !isFirst)
    .catch(e => {
      if (e?.code === 2010005) {
        isDeleted.value = true;
      }
      if (e?.code === 2010006) {
        isNoAccess.value = true;
      }
      return Promise.reject(e);
    })
    .finally(() => {
      loading.value = false;
    });
  // 已撤回不显示详情
  if (res.declareStatus === 0) {
    isDraft.value = true;
    return;
  }
  const stageInfoList = res.stageInfoList;
  forEach(stageInfoList, info => {
    const { materialFiles, templateFiles } = info;
    info.files = map(templateFiles, tf => {
      const mf = find(materialFiles, m => m.templateFileId === tf.fileId);
      if (mf) {
        return {
          templateFile: tf,
          materialFile: mf,
          fileList: [
            {
              fileId: mf.fileId,
              name: mf.fileName,
              url: mf.fileUrl,
            },
          ],
        };
      }
      return {
        templateFile: tf,
        materialFile: mf,
        fileList: [],
      };
    });
  });

  topicInfo.value = res;
  cancelEditMember();
};

const handleWithdraw = async () => {
  if (
    !(await confirmRef.value?.confirm({
      title: '',
      content: '是否撤回申请',
    }))
  ) {
    return;
  }
  await withdraw(topicInfo.value?.id);
  uni.$emit('topicDetailModified');
  uni.showToast({
    title: '撤回成功',
    duration: 2000,
  });
  uni.$emit('topicDetailModified');
  setTimeout(() => {
    uni.navigateBack();
  }, 2000);

  // uni.redirectTo({
  //   url: `/app-teacher-personnel/topic/declare/Declare?id=${topicInfo.value?.id}`,
  // });
};

const editTopic = () => {
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/declare/Declare?id=${topicInfo.value?.id}`,
    events: {
      topicDetailModified: () => {
        init(false);
      },
    },
  });
};

onBeforeMount(async () => {
  const params = getPageParams();
  id.value = params?.id;
  init(false, true);
});

onLoad(options => {
  hideDeletedButton.value = !!options.hideDeletedButton;
  type.value = options.type;
});
</script>
<style lang="scss" scoped>
.page-wrap {
  padding: 24rpx 32rpx;
}
.card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 24rpx 32rpx;
  &:not(:first-child) {
    margin-top: 24rpx;
  }
  .title {
    font-size: 32rpx;
    font-weight: bold;
    line-height: 44rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    word-break: break-all;
    .link {
      font-weight: 500;
      font-size: 30rpx;
      line-height: 40rpx;
      color: #1677ff;
      margin-left: 24rpx;
    }
  }
  .error-msg {
    color: #ff4d4f;
    font-size: 24rpx;
    margin-top: 8rpx;
  }
}
.member-title {
  display: flex;
  align-items: center;
  flex: auto;
  .member-icon {
    flex: none;
  }
  .member-name {
    margin-left: 32rpx;
    width: 1px;
    flex: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.collapse-item {
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #0000000f;
}
.host-head {
  display: flex;
  .head-icon {
    flex: none;
  }
  .info {
    flex: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 32rpx;
  }
  .host-title {
    display: flex;
    align-items: center;
    .host-gender {
      margin-left: 16rpx;
    }
  }
}
.card-tabs {
  margin-top: 24rpx;
  :deep(.u-scroll-box) {
    display: flex;
  }
}
.tab-pan-wrap {
  margin-top: 24rpx;
}
.page-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: px2rpx(64px);
  padding: 0 px2rpx(16px);
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
  z-index: 2;
  .btn {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
  }
  &-ghost {
    position: relative;
    pointer-events: none;
    visibility: hidden;
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
