<template>
  <card @click="() => handleClick(item.id)">
    <imp-header :title="item.title" title-size="font-xt" is-card-header extra-right title-ellipsis>
      <template #extra>
        <view :class="`task-status-${item.status}`">
          {{ item.status === 1 ? '进行中' : '已结束' }}
        </view>
      </template>
      <template #summary>
        <view class="flex font-secondary color-disabled mt-xxs">
          <view class="text-ellipse"> {{ item.personName }}</view>
          <text class="mlr-s no-shrink">发布于</text>
          <text class="no-shrink">{{ formatDate(item.createTime, 'YYYY-MM-DD hh:mm') }}</text>
        </view>
      </template>
    </imp-header>

    <view class="task-content color-base font-title text-overflow-2">
      {{ item.content }}
    </view>
    <view v-if="item?.status === 1" class="task-progress font-title">
      <text class="color-disabled">已进行</text>
      <view>
        <text class="color-success bold mr-xs">{{ `${item.currentDay}/${item.totalDay}` }}</text>
        <text class="color-disabled">天</text>
      </view>
    </view>
    <view v-if="item?.status === 1" class="progress-wrap mt-s">
      <view
        class="progress-value"
        :style="{ width: (100 * item.currentDay) / item.totalDay + '%' }"
      ></view>
    </view>
    <imp-space class-name="mt-l font-title" :vertical-center="false">
      <text class="color-disabled no-shrink mr-b">打卡频次:</text>
      <view class="color-base mr-b">{{ rateName(item.rate) }}</view>
    </imp-space>
    <view v-if="isGuardian" class="row-buttons mt-l">
      <ImpButton
        v-if="item.status === 1"
        type="plain"
        open-type="share"
        :msg="{ id: item.id, title: item.title, personName: item.personName }"
      >
        <view class="flex-column w-120">
          <c-icon name="icon_share" size="36" />
          <text class="mt-xs">转发</text>
        </view>
      </ImpButton>
    </view>
    <view v-if="isTeacher" class="row-buttons mt-l">
      <ImpButton
        v-if="item.status === 1"
        type="plain"
        open-type="share"
        :msg="{ id: item.id, title: item.title, personName: item.personName }"
      >
        <view class="flex-column w-120">
          <c-icon name="icon_share" size="36" />
          <text class="mt-xs">转发</text>
        </view>
      </ImpButton>
    </view>
  </card>
</template>
<script lang="ts">
import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpHeader from '@/app-preprimary-education/components/imp-header/imp-header.vue';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { IClockInTask } from '@/app-preprimary-education/services/clock-in';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate } from '@/utils/tools';
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  components: { Card, ImpHeader, ImpButton, ImpSpace },
  props: {
    inx: { type: Number, default: 0 },
    item: {
      type: Object as PropType<IClockInTask>,
      default: () => {},
    },
  },
  emits: [],
  setup(props) {
    const isGuardian = loginStore().currentUserType == EUserType.guardian;
    const isTeacher = loginStore().currentUserType == EUserType.teacher;
    const userInfo = loginStore().userInfo;

    const rateName = (rate: string) => {
      if (!rate) return '';
      if (rate.split(',').length >= 7) return '每天';
      const weekName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return rate
        .split(',')
        .map(r => weekName[Number.parseInt(r)] || r)
        .join(', ');
    };
    const handleClick = (id: string) => {
      if (isGuardian) {
        uni.navigateTo({
          url: `/app-preprimary-education/clock-in/guardian/detail/index?taskId=${id}`,
        });
      } else {
        uni.navigateTo({
          url: `/app-preprimary-education/clock-in/teacher/detail/index?id=${id}&clazzId=null`,
        });
      }
    };

    const handleInviteGuadians = () => {
      // const { item } = props;
      // const title = `${item.personName}老师创建的打卡任务#${item.title}`;
      // const params = `locationId=${userInfo?.locationId}&taskId=${item.id}&inviteType=2`;
      // #ifdef MP-WEIXIN
      // const relatedGuardianAppId = import.meta.env.VITE_WX_APP_ID;
      // if (!relatedGuardianAppId) {
      //   showInfo('未配置关联的小程序');
      //   return;
      // }
      // const envVersion =
      //   (import.meta.env.VITE_SERVER_ENV === 'PROD' && 'release') ||
      //   (import.meta.env.VITE_SERVER_ENV === 'DEV' && 'develop') ||
      //   'trial';
      // uni.navigateToMiniProgram({
      //   appId: relatedGuardianAppId,
      //   path: `/app-platform/contacts/invite/index?title=${title}&params=${params}`,
      //   extraData: { title, params },
      //   envVersion,
      // });
      // #endif
      // #ifdef APP-PLUS
      // app先不改造
      // #endif
    };

    return {
      rateName,
      handleClick,
      handleInviteGuadians,
      formatDate,
      isGuardian,
      isTeacher,
    };
  },
});
</script>
<style scoped lang="scss">
.task-status {
  &-1 {
    font-size: $ui-font-size-secondary;
    padding: $ui-gap-xxs $ui-gap-small;
    border-radius: $ui-radius-large;
    color: $ui-color-white;
    background: $ui-color-blue;
  }
  &-2 {
    font-size: $ui-font-size-secondary;
    padding: $ui-gap-xxs $ui-gap-small;
    border-radius: $ui-radius-large;
    color: $ui-color-placeholder;
    background: $ui-color-line-default;
  }
}
.task-content {
  line-height: 48rpx;
  margin-top: $ui-gap-xs;
  margin-bottom: $ui-gap-large;
}

.task-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $ui-color-secondary;
}

.progress-wrap {
  height: 16rpx;
  width: 100%;
  border-radius: $ui-radius-default;
  background: $ui-color-fill-default;
  .progress-value {
    background: $ui-color-primary;
    height: 16rpx;
    border-radius: $ui-radius-default;
  }
}

.row-buttons {
  display: flex;
  justify-content: space-around;
}
</style>
