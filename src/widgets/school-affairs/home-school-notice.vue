<template>
  <widget-card
    :widget="widget"
    :right-text="hasData ? '你有通知待确认' : ''"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleJumpToHomeSchoolNotice"
    @pullDownRefresh="getHomeSchoolNoticeInfo"
  >
    <view v-if="hasData" class="mt-l home-notice-container">
      <view v-for="i in homeSchoolNoticeInfo.array" :key="i.id" class="flex-between mb-l">
        <view class="flex-column-plain title">
          <view class="flex">
            <text class="font-title bold text-ellipse">{{ i.title }}</text>
            <view class="tag flex-center w-64 h-36 radius-default bg-primary-light-3-hover ml-s">
              <text class="tag-text font-regular font-desc color-blue">{{
                i.notifyType ? i.notifyTypeName : '其他'
              }}</text>
            </view>
          </view>
          <text class="color-placeholder font-secondary mt-xxs">
            {{ i.publishTime ? dayjs(i.publishTime).format('YYYY-MM-DD HH:mm') : '' }}
          </text>
        </view>
        <u-button type="primary" size="mini" @click="handleJumpToDetail(i)">去阅读</u-button>
      </view>
    </view>
    <u-empty-custom
      v-else
      card
      bg-type="fill-light"
      type="mini"
      class-name="mt-b ptb-b"
      text="暂无待确认的通知"
    />
  </widget-card>
</template>

<script lang="ts" setup>
import {
  IConfirmInfoItem,
  IConfirmInfoParams,
  UserType,
  getConfirmInfo,
} from '@/services/homeSchoolWidgetsServices';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, type IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { showInfo } from '@/utils/tools';
import useIsGuardian from '@/utils/use-is-guardian';
import widgetCard from '@/widgets/components/widget-card.vue';
import dayjs from 'dayjs';
import { onMounted, reactive, ref, toRefs } from 'vue';
/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});
const store = loginStore();
const { currentOrganization, userInfo } = toRefs(store);
const curStudentId = ref<string | undefined | number>('');
const isLoad = ref(false);
const hasData = ref(false);

const homeSchoolNoticeInfo = reactive({
  array: [] as IConfirmInfoItem[],
});
/**
 * 获取家校通知信息
 */
const getHomeSchoolNoticeInfo = async () => {
  if (!curStudentId.value) return;
  const params: IConfirmInfoParams = {
    pageNum: 1,
    pageSize: 999,
    status: 0,
    studentId: curStudentId.value + '',
    userType: UserType.CUser,
  };
  const data = await getConfirmInfo(params);
  homeSchoolNoticeInfo.array = data.result;
  console.log('homeSchool', homeSchoolNoticeInfo.array);
  hasData.value = !!data.result.length;
  isLoad.value = true;
};
/**
 * 跳转到家校通知
 */
const handleJumpToHomeSchoolNotice = () => {
  if (!curStudentId.value) {
    showInfo('没有学生');
    return;
  }
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/home-school-notice/index?id=${curStudentId.value}`,
    EApplicationType.Old,
  );
};
/**
 * 跳转到通知详情
 */
const handleJumpToDetail = (item: IConfirmInfoItem) => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/home-school-notice/detail/index?noticeStudentId=${item.id}`,
    EApplicationType.Old,
  );
};

onMounted(() => {
  //判断家校端是家长还是学生
  curStudentId.value = useIsGuardian()
    ? currentOrganization.value?.childId
    : userInfo.value?.personId;
  getHomeSchoolNoticeInfo();
});
</script>

<style lang="scss" scoped>
.home-notice-container {
  padding-bottom: 20rpx;
}
.title {
  width: calc(100% - 146rpx);
  .tag {
    min-width: 64rpx;
    .tag-text {
      margin-top: 2rpx;
    }
  }
}
</style>
