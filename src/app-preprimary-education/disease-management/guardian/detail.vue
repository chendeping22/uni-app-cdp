<template>
  <mt-page title="疾病详情" :show-top-gap="false">
    <view class="padding">
      <c-card>
        <!-- 记录详情 -->
        <view class="flex-between">
          <view class="flex">
            <view class="mr-b">
              <image
                v-if="studentInfo?.studentPhoto"
                class="student-photo"
                :src="studentInfo?.studentPhoto"
              />
              <image
                v-else
                class="student-photo"
                :src="studentInfo?.gender === 2 ? profile_photo_girl : profile_photo_boy"
              />
            </view>
            <view>
              <view class="color-base font-xt">{{ studentInfo?.studentName }}</view>
              <view>
                <view class="color-placeholder"
                  >{{ studentInfo?.createName }} 提交
                  {{ date2str(studentInfo?.createTime, 'Date&Minutes') }}</view
                >
              </view>
            </view>
          </view>
          <view
            v-if="RecordGuardianTags[studentInfo?.status ?? 0]"
            class="font-content plr-s text-nowrap radius-default"
            :style="{
              color: RecordGuardianTags[studentInfo?.status ?? 0].color,
              backgroundColor: RecordGuardianTags[studentInfo?.status ?? 0].bgColor,
            }"
          >
            {{ RecordGuardianTags[studentInfo?.status ?? 0].title }}
          </view>
        </view>
      </c-card>
      <view class="mt-l">
        <c-card>
          <!-- 患病详情 -->
          <view class="font-content color-placeholder">
            <view class="flex">
              <text class="mr-s">所属班级</text>
              <text class="color-base label-name">{{ studentInfo?.clazzName }} </text>
            </view>
            <view class="flex">
              <text class="mr-s">患病日期</text>
              <text class="color-base label-name"
                >{{ date2str(studentInfo?.sickenDate, 'Date') }}
              </text>
            </view>
            <view class="flex">
              <text class="mr-s">发现方式</text>
              <text class="color-base label-name"
                >{{ DiscoveryMode[`${studentInfo?.discoveryMode}`] }}
              </text>
            </view>
            <view class="flex">
              <text class="mr-s">患病时长</text>
              <text class="color-base label-name" :class="{ 'color-red': studentInfo?.isOverTime }"
                >{{ studentInfo?.sicknessDuration ?? 0 }}天</text
              >
            </view>
            <view class="disease-list">
              <text class="label-name">疾病症状</text>
              <text class="color-base">{{ symptom2str(studentInfo?.symptomList) }} </text>
            </view>
            <view v-if="studentInfo?.remark" class="disease-list">
              <text class="label-name">备注</text>
              <text class="color-base">{{ studentInfo?.remark }} </text>
            </view>
          </view>
        </c-card></view
      >

      <view class="mt-l">
        <c-card>
          <u-tabs
            v-model="activeTabIndex"
            :list="TabItems"
            :active-color="primaryColor"
            :is-scroll="false"
            @change="handleChangeTab"
          />
          <DiseaseTracking
            v-show="activeTabIndex === 0"
            :record-id="recordId"
            :status="studentInfo?.status ?? 0"
            :user-id="userInfo.userId"
            :sickness-duration="studentInfo?.sicknessDuration"
            :sicken-date="studentInfo?.sickenDate"
          />
          <OperationTracking v-show="activeTabIndex === 1" :record-id="recordId" /> </c-card
      ></view>
    </view>

    <c-empty-line height="150rpx" />
    <c-bottom v-if="studentInfo?.status === 0">
      <u-button type="primary" @click="handleJumpForm">疾病跟踪</u-button>
    </c-bottom>
  </mt-page>
</template>

<script lang="ts" setup>
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { loginStore } from '@/store/modules/login';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { uniq } from '@/utils/lodash-es';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { ref } from 'vue';
import mtPage from '../../components/mt-page/mt-page.vue';
import { DetailOfStudent, SymptomItem } from '../../disease-management/types/record';
import { fetchStudentDiseaseDetail } from '../../services/disease-management';
import { DiscoveryMode, RecordGuardianTags } from '../common/constant';
import DiseaseTracking from '../components/disease-tracking/index.vue';
import OperationTracking from '../components/operation-tracking/index.vue';

const { userInfo } = loginStore();
const date2str = (date: number, mode: string) => {
  switch (mode) {
    case 'Date&Minutes': {
      return dayjs(date).format('YYYY-MM-DD HH:mm');
    }
    case 'Date': {
      return dayjs(date).format('YYYY-MM-DD ');
    }
  }
};

const symptom2str = (symptomList: SymptomItem[]) => {
  if (symptomList?.length) {
    return uniq(symptomList.map(item => item.symptomName)).join(',');
  } else return '/';
};

const studentInfo = ref<DetailOfStudent>();

/* 切换tabs */
const TabItems = [
  { name: '疾病跟踪', value: 0 },
  { name: '操作记录', value: 1 },
];

const activeTabIndex = ref(0);
// 获取主题色
const primaryColor = getPrimaryColor();
const handleChangeTab = (inx: number) => {
  activeTabIndex.value = inx;
};

const recordId = ref('');

const refresh = () => {
  fetchStudentDiseaseDetail(recordId.value).then(res => {
    studentInfo.value = res;
  });
};

onLoad((option: any) => {
  uni.$on('disease-management:modify', refresh);

  recordId.value = option.id;
  fetchStudentDiseaseDetail(option.id).then(res => {
    studentInfo.value = res;
  });
});

onUnload(() => {
  uni.$off('disease-management:modify', refresh);
});

const handleJumpForm = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/disease-management/guardian/track-operation?recordId=${recordId.value}&sickenDate=${studentInfo.value?.sickenDate}`,
  });
};
</script>

<style lang="scss" scoped>
.sports-clockin__list {
  max-width: 680rpx;
}
.sports-clockin__list--with-tag {
  max-width: 464rpx;
}
.sports-clockin__list__tag {
  padding-top: 2rpx;
  padding-bottom: 2rpx;
}
.student-photo {
  width: 88rpx;
  height: 88rpx;
}
.text-line-2 {
  /* 设置文本只显示三行 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  /* 设置文本超出部分省略 */
  text-overflow: ellipsis;
}
.label-name {
  min-width: 130rpx;
}
.color-red {
  color: red;
}
.padding {
  padding: 33rpx;
}
.disease-list {
  display: flex;
  align-items: flex-start;
}
</style>
