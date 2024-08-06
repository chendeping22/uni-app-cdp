<template>
  <!--按钮-->
  <view class="row-buttons mt-l">
    <ImpButton
      v-if="isGuardian && detail.status === 1"
      type="plain"
      open-type="share"
      :msg="{ id: detail.id, title: detail.title, personName: detail.personName }"
    >
      <view class="flex-column w-120">
        <c-icon name="icon_share" size="36" />
        <text class="mt-xs">转发</text>
      </view>
    </ImpButton>
    <ImpButton
      v-if="isTeacher && detail.status === 1"
      type="plain"
      open-type="share"
      :msg="{ id: detail.id, title: detail.title, personName: detail.personName }"
    >
      <view class="flex-column w-120">
        <c-icon name="icon_share" size="36" />
        <text class="mt-xs">转发</text>
      </view>
    </ImpButton>
    <ImpButton
      v-if="isTeacher && detail.status === 1"
      type="plain"
      @click="() => handleClickBtn('end', detail?.id, detail?.status)"
    >
      <view class="flex-column w-120">
        <c-icon name="icon_punch" size="36" />
        <text class="mt-xs">结束打卡</text>
      </view>
    </ImpButton>
    <ImpButton
      v-if="isTeacher && detail.status === 1"
      type="plain"
      @click="() => handleEdit(detail.id)"
    >
      <view class="flex-column w-120">
        <c-icon name="icon_edit" size="36" />
        <text class="mt-xs">修改</text>
      </view>
    </ImpButton>
    <ImpButton
      v-if="isTeacher"
      type="plain"
      @click="() => handleClickBtn('del', detail?.id, detail?.status)"
    >
      <view class="flex-column w-120">
        <c-icon name="icon_delete" size="36" />
        <text class="mt-xs">删除</text>
      </view>
    </ImpButton>
  </view>
  <uni-popup ref="popupRef" type="dialog">
    <popup-dialog
      :class="'setting-popup-dialog'"
      type="info"
      :title="operateMsg"
      @confirm="handleConfirm"
      @close="handleCancel"
    ></popup-dialog>
  </uni-popup>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import PopupDialog from '@/app-preprimary-education/components/popup-dialog/popup-dialog.vue';
import UniPopup from '@/app-preprimary-education/components/uni-popup/uni-popup.vue';
import { IGetClockInDetailRtn } from '@/app-preprimary-education/services/clock-in';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import {
  ComponentInternalInstance,
  PropType,
  defineComponent,
  getCurrentInstance,
  onMounted,
  ref,
} from 'vue';

const delMsg: Record<number, string> = {
  1: '打卡任务正在进行中，删除后将自动结束打卡，确定要删除吗？',
  2: '确认删除此打卡任务吗？',
};

export default defineComponent({
  components: { ImpButton, UniPopup, PopupDialog },
  props: {
    detail: { type: Object as PropType<IGetClockInDetailRtn>, default: () => {} },
  },
  emits: ['clickDelTask', 'clickEndTask'],
  setup(props, { emit }) {
    const isGuardian = loginStore().currentUserType == EUserType.guardian;
    const isTeacher = loginStore().currentUserType == EUserType.teacher;
    const userInfo = loginStore().userInfo;

    const popupRef = ref();
    const { proxy } = getCurrentInstance() as ComponentInternalInstance;
    const operateMsg = ref('');
    const taskId = ref('');
    const operateType = ref('');
    // const handleClickRank = (id: string) => {
    //   console.log('🚀 ~ file: index.vue ~ line 42 ~ handleClickRank ~ id', id);
    // };
    const handleEdit = async (id: string) => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/index?id=${id}`,
      });
    };

    const handleClickBtn = (type: string, id: string, status: number) => {
      taskId.value = id;
      operateType.value = type;
      switch (type) {
        case 'del':
          operateMsg.value = delMsg[status];
          break;
        case 'end':
          operateMsg.value = '确定要提前结束打卡任务吗？';
          break;
      }
      popupRef.value.open();
    };

    const handleCancel = () => {
      popupRef.value.close();
    };

    const handleInviteGuadians = () => {
      // const { detail } = props;
      // const title = `${detail.personName}老师创建的打卡任务#${detail.title}`;
      // const params = `locationId=${userInfo.locationId}&taskId=${detail.id}&inviteType=2`;
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
    const handleConfirm = () => {
      switch (operateType.value) {
        case 'del':
          emit('clickDelTask', taskId.value);
          break;
        case 'end':
          emit('clickEndTask', taskId.value);
          break;
      }
      popupRef.value.close();
    };

    onMounted(() => {
      popupRef.value = proxy?.$refs['popupRef'];
    });

    return {
      isGuardian,
      isTeacher,
      popupRef,
      operateMsg,
      handleEdit,
      handleClickBtn,
      handleCancel,
      handleInviteGuadians,
      handleConfirm,
    };
  },
});
</script>
<style scoped lang="scss">
.w120 {
  width: 120rpx;
}
.row-buttons {
  display: flex;
  justify-content: space-around;
  padding-bottom: $ui-gap-default;
  border-bottom: 1rpx solid $ui-color-line-default;
}
</style>
