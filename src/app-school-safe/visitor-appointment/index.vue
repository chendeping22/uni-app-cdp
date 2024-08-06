<template>
  <view class="container bg-fill-default">
    <c-refresh-scroll
      ref="refreshScrollRef"
      :show-success-tip="false"
      :page-size="20"
      :fetch-data-func="fetchDataFunc"
    >
      <template #top_area>
        <c-tabs
          :current="activeTabIndex"
          :list="tabsList"
          bg-color="white"
          @change="handleChangeTab"
        />
      </template>
      <!-- 待处理列表不展示tag -->
      <template v-if="records?.length">
        <apply-card
          v-for="item in records"
          :id="(item.id as string)"
          :key="item.id"
          :name="item.visitorName"
          :submit-time="item.submitTime"
          :visit-begin-time="item.visitBeginTime"
          :visit-end-time="item.visitEndTime"
          :status="item.visitStatus"
          :show-status="activeTabIndex !== 3"
          :show-group-tag="item.showGroupTag"
          :visitor-number="item.visitorNumber"
        />
        <c-empty-line need-safe-bottom :height="180" />
      </template>
      <c-empty v-else content="暂无数据" bg-type="gray" />
    </c-refresh-scroll>
    <c-bottom v-if="inviteInfo">
      <c-button icon-type="icon_add" @click="showInviteActionSheet = true">登记访客</c-button>
    </c-bottom>
    <c-action-sheet v-model:show="showInviteActionSheet" title="请选择登记方式">
      <template #body>
        <!-- #ifdef MP-WEIXIN -->
        <c-button
          icon-type="icon_wechat"
          icon-color="success"
          open-type="share"
          :is-brand-type="false"
          type="plain"
          :msg="{
            locationName: inviteInfo?.locationName,
            inviteToken: inviteInfo?.inviteToken,
          }"
        >
          邀请微信好友
        </c-button>
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <!-- app端 通过uni.share触发 -->
        <c-button
          icon-type="icon_wechat"
          icon-color="success"
          :is-brand-type="false"
          type="plain"
          @click="handleShare"
        >
          邀请微信好友
        </c-button>
        <!-- #endif -->
        <c-divider />
        <c-button
          icon-type="icon_comment_message"
          icon-color="primary"
          :is-brand-type="false"
          type="plain"
          @click="showInviterModal = true"
        >
          发送短信链接
        </c-button>
        <c-divider />
        <c-button
          icon-type="icon_my"
          icon-color="base"
          :is-brand-type="false"
          type="plain"
          @click="handleApply"
        >
          直接登记访客
        </c-button>
      </template>
    </c-action-sheet>
    <c-modal
      v-model:show="showInviterModal"
      title="请输入访客手机号"
      @onClose="showInviterModal = false"
      @onConfirm="handleInvite"
    >
      <c-input
        v-model:value="inviterTelStr"
        class-name="ptb-b"
        font-size="content"
        type="textarea"
        :min-height="100"
        border-direction="all"
        placeholder="多个手机号请用斜杠“/”隔开"
      />
    </c-modal>
    <c-modal
      v-model:show="showSuccessModal"
      title="邀请成功"
      content="已发送短信，请联系对方注意查收"
      :has-cancel="false"
    />
  </view>
</template>
<script lang="ts" setup>
import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
import {
  TApplyInfo,
  TSourceInfo,
  fetchApplyList,
  fetchInviteInfo,
  getPositionInfoByUserId,
  inviteBySms,
} from '../services/visitor-appointment';
import ApplyCard from './components/apply-card/index.vue';

import dayjs from 'dayjs';

const inviteImageUrl =
  'https://lexikos-public-bucket.oss-cn-hangzhou.aliyuncs.com/wechat/visitor_invite.png';

enum PositionCodeEnum {
  SCHOOLADMIN = 1, // 学校管理员
  SECTIONLEADER = 2, // 学段负责人
  TEACHER = 6, //任课老师
  GRADETEACHER = 7, //年级主任
  HEADTEACHER = 8, //班主任
  ADMIN = 9, //超管
  DEPARTMENTLEADER = 10, //部门负责人
}

const activeTabIndex = ref(0);
const tag = ref(1);
const refreshScrollRef = ref<any>();
const records = ref<
  (TApplyInfo & {
    showGroupTag?: boolean;
  })[]
>([]);
const inviteInfo = ref<TSourceInfo>();
const showInviteActionSheet = ref(false);
const showInviterModal = ref(false);
const inviterTelStr = ref('');
const showSuccessModal = ref(false);
const positionList = reactive({ value: [] });

import { EApplicationType, ETargetType } from '@/store/modules/workbench';
import { getConfig } from '@/utils/global-config';
import { goToWebView } from '@/utils/go-to-webview';
import { shareMiniProgramToWXSceneSession } from '@/utils/share';
import { setPageParams, showInfo } from '@/utils/tools';

// #ifdef MP-WEIXIN
import { onShareAppMessage } from '@dcloudio/uni-app';
onShareAppMessage((res: any) => {
  const { locationName, inviteToken } = res.target.dataset.msg;
  // 分享打开地址
  const target = `${
    getConfig().imp2_h5_host
  }/subPackages/visitor-appointment/apply/index?source=0&inviteToken=${inviteToken}`;
  // 新基座webview地址
  const path = `/app-platform/webview/index?path=${encodeURIComponent(
    JSON.stringify(target),
  )}&title=访客登记`;

  return {
    title: `邀请您拜访${locationName}`,
    path: path,
    imageUrl: inviteImageUrl,
  };
});
// #endif

const handleChangeTab = (index: number) => {
  activeTabIndex.value = index;
  switch (index) {
    case 0:
      tag.value = 1; // 待审批
      break;
    case 1:
      tag.value = 2; // 已审批
      break;
    case 2:
      tag.value = 3; // 我的访客
      break;
    case 3:
      tag.value = 0; // 全部
      break;
  }
};

// #ifdef APP-PLUS
const handleShare = () => {
  // 分享打开地址
  const target = `${
    getConfig().imp2_h5_host
  }/subPackages/visitor-appointment/apply/index?source=0&inviteToken=${
    inviteInfo.value?.inviteToken
  }`;
  // 新基座webview地址
  const path = `/app-platform/webview/index?path=${encodeURIComponent(
    JSON.stringify(target),
  )}&title=访客登记`;
  shareMiniProgramToWXSceneSession({
    title: `邀请您拜访${inviteInfo.value?.locationName}`,
    imageUrl: inviteImageUrl,
    path,
  });
};
// #endif

// 手机号分享
const handleInvite = async () => {
  if (!inviterTelStr.value?.trim().length) {
    showInfo('请输入邀请号码!');
    return;
  }

  const telList = inviterTelStr.value.split('/').map(item => item.trim());
  await inviteBySms(telList);
  showSuccessModal.value = true;
};

const fetchDataFunc = async (pager: any, loadType: any) => {
  const { pageSize, pageNum } = pager;
  const res = await fetchApplyList({ tag: tag.value, pageSize, pageNum });
  loadType === 'new' && (records.value = []);
  const length = records.value.length;
  let lastData: any = length > 0 ? records.value?.[length - 1] : undefined;
  const datas = res.result.map((item: TApplyInfo) => {
    // 第一条数据默认展示分组日期tag
    if (!lastData) {
      item.showGroupTag = true;
    } else if (!dayjs(lastData.visitBeginTime).isSame(dayjs(item.visitBeginTime), 'date')) {
      // 比较相邻的两个数据是否同属于一天，不同的情况下显示日期分组tag
      item.showGroupTag = true;
    }
    lastData = item;
    return item;
  });
  records.value.push(...datas);
  return res;
};

// 直接登记访客
const handleApply = async () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/visitor-appointment/apply/index?${setPageParams({
      source: 3,
      inviteToken: inviteInfo.value?.inviteToken,
    })}`,
    EApplicationType.Old,
  );
};

/** 获取用户职位信息 */
const fetchPosition = async () => {
  const res = await getPositionInfoByUserId();
  const roles = res.map(t => t.code);
  positionList.value = roles;
};

// 是否为管理用户
const isAdminUser = computed(() => {
  const defaultAdminCodeList = [
    PositionCodeEnum.ADMIN,
    PositionCodeEnum.DEPARTMENTLEADER,
    PositionCodeEnum.SCHOOLADMIN,
  ];

  const result = positionList.value.find(code => {
    if (defaultAdminCodeList.includes(code)) {
      return code;
    }
  });
  if (result) return true;
  return false;
});

const tabsList = computed(() => {
  const tabs = [{ name: '待审批' }, { name: '已审批' }, { name: '我的访客' }];
  if (isAdminUser.value) {
    const allTabs = tabs.concat([{ name: '全部' }]);
    return allTabs;
  }
  return tabs;
});

watch(activeTabIndex, () => {
  refreshScrollRef.value.initPager();
  refreshScrollRef.value.fetchData('new');
});

watch(showInviterModal, () => {
  if (!showInviterModal.value) inviterTelStr.value = '';
});

onBeforeMount(async () => {
  // #ifdef MP-WEIXIN
  // 分享内容需动态获取, 右上角的分享无法控制，暂时隐藏
  uni.hideShareMenu({ hideShareItems: [] });
  // #endif
  // 邀请分享信息获取()
  inviteInfo.value = await fetchInviteInfo();
  fetchPosition();
});
</script>

<style scoped lang="scss">
.container {
  height: calc(100vh - var(--status-bar-height));
  overflow: hidden;
}
</style>
