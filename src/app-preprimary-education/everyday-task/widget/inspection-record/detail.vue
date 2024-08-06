<template>
  <mt-page title="检查详情">
    <view v-if="detail.id" class="bg-white plr-l ptb-b">
      <!--头像-->
      <view class="flex lh-0">
        <!-- <image class="icon-88 mr-b no-shrink" :src="defaultAvatar[detail.gender]" /> -->
        <c-avatar
          class="icon-88 mr-b no-shrink"
          :src="headImgUrl || ''"
          :sex="String(baseInfoResp?.gender) === '1' ? 'man' : 'woman'"
          type="child"
          :size="108"
        />

        <view class="flex-grow">
          <view class="font-xt bold ptb-s">
            {{ detail.studentName }}
          </view>
          <view class="font-secondary color-placeholder">
            {{ detail.clazzName }}
          </view>
        </view>
        <view
          :class="[
            'radius-default color-white ptb-xs plr-b',
            `bg-${detail.healthStatus === 1 ? 'success' : 'error'}`,
          ]"
        >
          {{ detail.healthStatus === 1 ? '正常' : '异常' }}
        </view>
      </view>

      <!-- 任务详情 -->
      <view class="flex-plain mt-b">
        <view class="col-6 no-shrink">
          <text class="color-placeholder">任务名称</text>
        </view>
        <view class="text-break">
          {{ detail.inspectionModeName ?? '/' }}
        </view>
      </view>
      <view class="flex-plain mt-xxs">
        <view class="col-6 no-shrink">
          <text class="color-placeholder">检查时间</text>
        </view>
        <view class="text-break">
          {{ formatDate(detail.inspectionTime, ' YYYY-MM-DD hh:mm') }}
        </view>
      </view>
      <view v-if="!isPDADevice" class="flex-plain mt-xxs">
        <view class="col-6 no-shrink">
          <text class="color-placeholder">检查人员</text>
        </view>
        <view class="text-break">
          {{ detail.handler ?? '/' }}
        </view>
      </view>

      <!-- 检查事项 -->
      <c-header title="检查事项" class-name="mt-xl" title-size-type="title" />
      <view
        v-for="(item, index) in detail.recordItemVOList"
        :key="`check_item_${item.inspectionTaskItemId}`"
        class="border-bottom border-line-default"
      >
        <view class="flex-between h-88">
          <view class="font-title"> {{ item.inspectionTaskItemName }}</view>
          <view class="font-title">
            <text v-if="`${item.inspectionTaskItemValue}` === '1'" class="color-success">
              正常{{ item.inspectionTaskItemName == '体温' ? `, ${item.temperature}℃` : '' }}
            </text>
            <view v-else class="color-error">
              <view
                v-if="isPDADevice && item.inspectionTaskItemType === 1 && item.fileUrl"
                class="flex"
                @click="showPicture(item.fileUrl)"
              >
                异常
                <c-icon name="icon_arrow_right" size="32" color-type="placeholder" />
              </view>
              <view v-else>
                {{ item.inspectionTaskItemType === 0 ? `${item.temperature}℃` : '异常' }}
              </view>
            </view>
          </view>
        </view>
        <view
          v-if="
            `${item.inspectionTaskItemValue}` === '2' &&
            item.inspectionTaskItemType === 1 &&
            item.detailList.length
          "
          class="flex-wrap mb-s mt-adjust-line-height"
        >
          <view
            v-for="exception in item.detailList"
            :key="`check_item_${item.inspectionTaskItemId}_exception_${exception.inspectionItemValueId}`"
            class="mr-b lh-4"
          >
            <text class="font-secondary color-placeholder">{{ exception.abnormalValue }}</text>
          </view>
        </view>
      </view>

      <!-- 留园建议 -->
      <view v-if="!isPDADevice">
        <c-header title="留园建议" class-name="mt-xl" title-size-type="title" />
        <view class="text-pre color-placeholder mt-xs">
          {{ ['', '留园', '离园'][detail.leaveSuggestion] }}
          {{ isEmpty(detail.comment) ? '' : `, ${detail.comment}` }}
        </view>
      </view>
    </view>
    <c-empty v-else bg-type="fill-default" />
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import {
  IGetDetailByRecordIdRtn,
  getDetailByRecordId,
  getInspectionDeviceType,
} from '@/app-preprimary-education/services/health-day';
import { studentDetail } from '@/app-preprimary-education/services/home-school-communication';
import boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { isEmpty } from '@/utils/lodash-es';
import { formatDate, getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, reactive, ref } from 'vue';
import { getStudentDetailAvatarUrl } from '../../util';
export default defineComponent({
  components: { mtPage },
  setup() {
    const defaultAvatar = {
      1: boy,
      2: girl,
    };
    const baseInfoResp = ref({});
    const headImgUrl = ref('');
    const isPDADevice = ref(false);
    const dataLists = reactive({
      array: [] as any[],
    });
    const detail = ref({} as IGetDetailByRecordIdRtn);
    const isGuardian = loginStore().currentUserType != EUserType.teacher;
    const getBaseInfo = async (id: any) => {
      const res = await studentDetail(id);
      baseInfoResp.value = res.baseInfoResp;
      headImgUrl.value = getStudentDetailAvatarUrl(res?.baseInfoResp?.imageResps);
    };
    const getDeviceType = async () => {
      const res = await getInspectionDeviceType(isGuardian);
      if (res) isPDADevice.value = res.deviceType === 2;
    };

    /** 预览图片 */
    const showPicture = (url?: string) => {
      uni.previewImage({
        urls: [url || ''],
        current: 0,
      });
    };
    onBeforeMount(async () => {
      const { id } = getPageParams();
      getDeviceType();
      const res = await getDetailByRecordId(id);
      getBaseInfo(res.studentId);
      detail.value = res || {};
    });

    return {
      detail,
      boy,
      dataLists,
      girl,
      defaultAvatar,
      isEmpty,
      formatDate,
      headImgUrl,
      baseInfoResp,
      isPDADevice,
      showPicture,
    };
  },
});
</script>
<style lang="scss" scoped>
.inspection-box {
  padding: 30rpx 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid $ui-color-font-disabled;
  .widthStyle {
    width: 85%;
    overflow: hidden;
    text-overflow: ellipsis;
    // white-space: nowrap;
  }
  .normal {
    color: $ui-color-success;
  }
  .abnormal {
    color: $ui-color-error;
  }
}
</style>
