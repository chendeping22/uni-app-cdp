<template>
  <widget-card
    :widget="widget"
    :is-loaded-data="isLoad"
    :body-height="bodyHeight"
    @head-click="handleClickNavigator"
    @pullDownRefresh="getData"
  >
    <view class="content">
      <template v-if="!isGuardian">
        <view v-for="item in list" :key="item.clazzId" class="mt-b">
          <view class="flex mb-xxs">
            <text class="font-title mr-s">{{ item.clazzName }}</text>
            <c-tag-item
              v-if="isAfterSchoolTime(item.afterSchoolTime)"
              bg-type="warnning-light-3"
              color-type="warnning"
              >已放学
            </c-tag-item>
          </view>
          <view class="bg-fill-light radius-default plr-b ptb-s flex">
            <template v-if="!isAfterSchoolTime(item.afterSchoolTime)">
              <view class="col-12">
                <view class="font-secondary color-secondary">放学时间</view>
                <view class="font-xt bold">{{ item.afterSchoolTime }}</view>
              </view>
              <view class="col-12">
                <view class="font-secondary color-secondary">需接送学生</view>
                <view class="font-xt bold"> {{ item.studentTotal }}</view>
              </view>
            </template>
            <template v-else>
              <view class="col-12">
                <view class="font-secondary color-secondary">家长已到</view>
                <view class="font-xt bold">{{ item.parentsArriveTotal ?? '/' }}</view>
              </view>
              <view class="col-12">
                <view class="font-secondary color-secondary">家长未到</view>
                <view class="font-xt bold"> {{ item.waitStudentTotal ?? '/' }}</view>
              </view>
            </template>
          </view>
        </view>
        <view v-if="list.length === 0" class="empty-tip">
          <u-empty-custom card text="当前时间暂无接送任务" :icon-size="120" />
        </view>
      </template>
      <template v-else>
        <template v-if="returnItems.value.length">
          <user-card
            v-for="item in returnItems.value"
            :key="item.id"
            :user-info="item"
            size="small"
          >
            <template #cardImg>
              <c-avatar
                :src="item?.studentAvatar"
                :sex="item?.gender === 1 ? 'man' : 'woman'"
                type="child"
                :size="96"
              />
            </template>
            <template v-if="item.afterSchoolTime" #extra-right>
              <template v-if="onlineSignType">
                <view v-if="item.status === 0" class="user-sign-in" @click="handleClickSign(item)">
                  <image class="user-sign-in-image" :src="icon_sign_in" />
                  <text class="user-sign-in-text">签到</text>
                </view>
                <view v-else-if="item.status === 1" class="user-signed">
                  <text>已签到</text>
                </view>
              </template>
              <template v-else>
                <text v-if="item.status === 0" class="color-placeholder font-secondary"
                  >请刷脸签到</text
                >
                <text v-else class="color-placeholder font-secondary">已刷脸签到</text>
              </template>
            </template>
          </user-card>
        </template>
        <u-empty-custom v-else card text="今日无需接送" :icon-size="120" />
      </template>
    </view>
  </widget-card>
</template>

<script lang="ts" setup>
import {
  fetchSignType,
  getGuardianPickUpInfo,
  getTeacherPickUpInfo,
  IGuardianPickupInfo,
  studentSignIn,
} from '@/services/widgets';
import { loginStore } from '@/store/modules/login';
import { EApplicationType, ETargetType, IWidget } from '@/store/modules/workbench';
import { goToWebView } from '@/utils/go-to-webview';
import { EUserType } from '@/utils/kind';
import { formatDate, showInfo } from '@/utils/tools';
import widgetCard from '@/widgets/components/widget-card.vue';
import icon_sign_in from '@/widgets/static/icon_sign_in.svg';
import dayjs from 'dayjs';
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import UserCard from './components/user-card.vue';

type ReturnProcessDataItem = {
  /** 放学时间，HH:mm */
  afterSchoolTime: string;
  /** 班级ID */
  clazzId: string;
  /** 日期 */
  dateStr: string;
  /** 班级名称 */
  clazzName: string;
  /** 学生总数 */
  studentTotal: number;
  /** 待接送学生人数 */
  waitStudentTotal: number;
  /** 家长已到人数 */
  parentsArriveTotal: number;
};

interface IUserCard {
  id?: string | number;
  name: string;
  url?: string;
  desc1?: string;
  desc2?: string;
  [k: string]: any;
}

/** 1. props定义 */
interface IProps {
  widget: IWidget;
  bodyHeight: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const isLoad = ref(false);
const list = ref<ReturnProcessDataItem[]>([]);
const pickupInfo = ref<IGuardianPickupInfo[]>([]);
const isGuardian = loginStore().currentUserType != EUserType.teacher;
// const isGuardian = true;
const firstId = ref('');

const returnItems = reactive({
  value: [] as IUserCard[],
});
const countDown = ref();

// 是否支持线上签到
const onlineSignType = ref(true);

/** 调用API，获取真实数据 */
const fetchData = async () => {
  const res = await getTeacherPickUpInfo();
  return res || [];
};

const isAfterSchoolTime = (targetTime: string) => {
  const nowTime = formatDate(new Date(), 'hh:mm');
  // 比较时分即可, 秒都是0
  const _target = targetTime.split(':');
  const _now = nowTime.split(':');
  return Number(_target[0]) * 60 + Number(_target[1]) < Number(_now[0]) * 60 + Number(_now[1]);
};

const handleClickNavigator = () => {
  goToWebView(
    ETargetType.TargetTypeRelativeH5AtImp,
    `/subPackages/return-service/index`,
    EApplicationType.Old,
  );
};

const fetchSignIn = async (id: string) => {
  const res = await studentSignIn(id);
  const msg = returnItems.value.find(i => i.id === id) || ({} as IUserCard);
  msg.status = 1;
  if (res?.signGuardianName) {
    showInfo(`${res.signGuardianName}在${res.signTime}已签到`);
  } else {
    showInfo('签到成功');
  }
};

const handleClickSign = (item: IUserCard) => {
  if (!onlineSignType.value) return;
  fetchSignIn(item.id as string);
};

const formatCountDown = (time: string) => {
  const diff = dayjs()
    .startOf('minute')
    .diff(dayjs(`${dayjs().format('YYYY-MM-DD')} ${time}`, 'HH:mm'), 'minute');
  const afterSchoolContent =
    Math.abs(diff) > 30 ? `放学时间 ${time}` : `距离放学还有${Math.abs(diff)}分钟`;
  const content = diff >= 0 ? '已放学' : afterSchoolContent;
  return content;
};

// 获取家长端离园接送卡片信息
const getPickupInfo = async () => {
  const res = await getGuardianPickUpInfo();
  return res || [];
};

const getData = async () => {
  if (!isGuardian) {
    list.value = await fetchData();
  } else {
    pickupInfo.value = await getPickupInfo();
    returnItems.value = (pickupInfo.value as IGuardianPickupInfo[]).map((item, inx) => ({
      id: item.studentId,
      name: item.studentName,
      gender: item.gender,
      studentAvatar: item.studentAvatar,
      desc1: item.afterSchoolTime ? formatCountDown(item.afterSchoolTime) : '未安排课程',
      status: item.isSign,
      afterSchoolTime: item.afterSchoolTime,
    }));
  }
  isLoad.value = true;
};

onBeforeMount(async () => {
  // 获取是否支持线上签到方式
  const { online } = await fetchSignType();
  onlineSignType.value = Boolean(online);
});

onMounted(() => {
  getData();
});
</script>

<style lang="scss" scoped>
.empty-tip {
  height: 100%;
}
.content {
  overflow: auto;
  height: 100%;
  padding-bottom: 20rpx;
}

.user-sign-in {
  height: 64rpx;
  background: $ui-color-primary;
  border-radius: $ui-radius-xl;
  padding: 0 $ui-gap-default;
  font-size: $ui-font-size-content;
  font-weight: $ui-font-weight-bold;
  display: flex;
  align-items: center;
  &-image {
    width: 36rpx;
    height: 36rpx;
  }
  &-text {
    margin-left: $ui-gap-xxs;
    color: $ui-color-white;
    flex-shrink: 0;
  }
}
.user-signed {
  height: 64rpx;
  background: $ui-color-line-default;
  border-radius: $ui-radius-xl;
  padding: 0 $ui-gap-large;
  font-size: $ui-font-size-content;
  font-weight: $ui-font-weight-bold;
  display: flex;
  align-items: center;
  color: $ui-color-placeholder;
}
</style>
