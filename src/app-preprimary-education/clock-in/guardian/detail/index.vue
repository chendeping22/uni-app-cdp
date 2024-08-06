<template>
  <CustomPage title="打卡详情" bg-type="clock-in" :page-loading-status="pageLoadingStatus">
    <template #loading_error>
      <imp-empty-data :title="errorDesc" class-name="mt-xl" />
      <view class="flex-center mt-xl">
        <ImpButton width="400rpx" @click="handleBackToHome">返回首页</ImpButton>
      </view>
    </template>
    <c-refresh-scroll
      ref="refreshScrollRef"
      :auto-mount="false"
      :fetch-data-func="handleRefFetchData"
      :is-open-scroll2-bottom="false"
      extraHeight="80"
    >
      <card :has-margin="false" class-name="mt-b">
        <TaskDetail :detail="detail.value" />
        <TaskNavs :detail="detail.value" />
        <TaskCalendar :detail="detail.value" @onSelectCalendar="handleSelectCalendar" />
        <TaskRecord
          :list="records.array"
          :loading-status="loadingRecordStatus"
          :enabled-view="detail.value.enabledView === 1"
          v-model:showCommentModal="showCommentModal"
          v-model:currentRecord="currentRecord"
          v-model:isComment="isComment"
        />
        <imp-empty-line v-if="curStatus > 0" size="xl" is-bottom />
      </card>
    </c-refresh-scroll>
    <imp-bottom v-if="curStatus === 1 || detail.value.status === 2">
      <view class="add-btn">
        <u-button
          v-if="curStatus === 1 && detail.value.status === 1"
          type="primary"
          @click="handlePunch"
        >
          打卡
        </u-button>
        <u-button v-if="detail.value.status === 2" type="primary" disabled>已结束</u-button>
      </view>
    </imp-bottom>
  </CustomPage>
  <c-modal
    v-model:show="showCommentModal"
    title="评论"
    @onClose="showCommentModal = false"
    @onConfirm="sendComment"
  >
    <c-input
      v-model:value="commentRemark"
      placeholder="请输入评论"
      border-direction="all"
      type="textarea"
      height="200rpx"
      maxlength="200"
    ></c-input>
  </c-modal>
</template>
<script lang="ts">
import { ICalendar } from '@/app-preprimary-education/clock-in/guardian/task-calendar/components/calendars/index.vue';
import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import ImpEmptyLine from '@/app-preprimary-education/components/imp-empty-line/imp-empty-line.vue';
import {
  IDataLoadType,
  IPager,
} from '@/app-preprimary-education/components/imp-refresh-scroll/imp-refresh-scroll.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import {
  IClockinRecord,
  IGetClockInDetailRtn,
  getClockInDetail,
  getClockinRecord,
  sendComments,
} from '@/app-preprimary-education/services/clock-in';
import { IOnShareAppMessage } from '@/app-preprimary-education/utils/common-types';
// import { login } from '@/utils/auto-login';
// import { checkAndChangeLocation } from '@/utils/change-location';
import { shareClockInTask } from '@/app-preprimary-education/utils/clock-in-share';
import { clockinDetailEffectOnShow_key } from '@/utils/storage-keys';
import { getPageParams } from '@/utils/tools';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import TaskCalendar from './components/task-calendar/index.vue';
import TaskDetail from './components/task-detail/index.vue';
import TaskNavs from './components/task-navs/index.vue';
import TaskRecord from './components/task-record/index.vue';

interface IParams {
  locationId: string;
  taskId: string;
  timestamp: string;
}
type IShare = Pick<IGetClockInDetailRtn, 'id' | 'personName' | 'title'>;
export default defineComponent({
  components: {
    TaskDetail,
    TaskNavs,
    TaskCalendar,
    TaskRecord,
    CustomPage,
    ImpEmptyLine,
    ImpEmptyData,
    ImpBottom,
    ImpButton,
    Card,
  },
  onShareAppMessage(item: IOnShareAppMessage<'button'>) {
    const task: IShare = item.target.dataset.msg;
    return shareClockInTask(task);
  },
  onShow() {
    uni.getStorage({
      key: clockinDetailEffectOnShow_key,
      success: () => {
        uni.$emit('handleGuardianClockInDetail');
        uni.removeStorage({ key: clockinDetailEffectOnShow_key });
      },
    });
  },
  setup() {
    const refreshScrollRef = ref(null as any);
    const errorDesc = ref('');
    const pageLoadingStatus = ref(0);
    const detail = reactive({ value: {} as IGetClockInDetailRtn });
    const curStatus = ref(0); // 0-当天无需打卡, 1-打卡, 2-重新打卡, 3-补卡, 4-未开始
    const taskId = ref('');
    const clockinDate = ref(NaN); // 请求参数
    const loadingRecordStatus = ref(0); // 加载状态 0-未开始 1-已查询
    const records = reactive({ array: [] as IClockinRecord[] });
    const showCommentModal = ref(false); // 评论弹窗
    const commentRemark = ref(''); // 评论
    const currentRecord = ref<IClockinRecord>({} as IClockinRecord); // 当前评论的记录
    const isComment = ref<{ [key: string]: boolean }>({});

    const today = computed(() => {
      if (!detail.value.currentDate) return new Date();
      const d = new Date(detail.value.currentDate);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });

    const sendComment = async () => {
      const params = {
        recordId: currentRecord.value.id,
        studentId: currentRecord.value.studentId,
        commentType: 1,
        remark: commentRemark.value,
      };
      try {
        await sendComments(params, false);
      } catch (e) {}
      isComment.value = { ...isComment.value, [currentRecord.value.id]: true };
      commentRemark.value = '';
      uni.$emit('guardian-comment-or-like');
    };

    const fetchDetail = async () => {
      try {
        const res = await getClockInDetail(taskId.value);
        pageLoadingStatus.value = 1;
        detail.value = res;
      } catch (e: ICatch) {
        pageLoadingStatus.value = 2;
        errorDesc.value = e.desc || '请求服务器失败';
      }
    };

    const handleSelectCalendar = (c: ICalendar) => {
      clockinDate.value = c.clockinDate;
      curStatus.value = today.value.getTime() === c.clockinDate && c.clockinStatus === 0 ? 1 : 0;
      records.array = [];
      refreshScrollRef.value.initPager();
      refreshScrollRef.value.fetchData('append');
    };

    const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
      if (type === 'new') {
        try {
          const res = await getClockInDetail(taskId.value);
          pageLoadingStatus.value = 1;
          detail.value = res;
        } catch (e: ICatch) {
          pageLoadingStatus.value = 2;
          errorDesc.value = e.desc || '请求服务器失败';
        }
        return { total: 0 };
      }
      const { pageSize, pageNum } = pager;
      const res = await getClockinRecord({
        taskId: taskId.value,
        clockinDate: clockinDate.value,
        pageSize,
        pageNum,
      });
      loadingRecordStatus.value = 1;
      // 过滤重复, 有时异常操作会触发多次请求
      // const filters = res.result.filter(f => !records.array.some(s => s.id === f.id));
      records.array = res.result;
      return res;
    };

    const handlePunch = () => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/guardian/punch/index?taskId=${detail.value.id}&clockinWay=${detail.value.clockinWay}&clockinDate=${clockinDate.value}`,
      });
    };

    /** 第三方链接打开, 需要判断locationId */
    // const initByThirdHref = async (locationId: string) => {
    //   try {
    //     await checkAndChangeLocation(locationId, fetchDetail);
    //   } catch (e: ICatch) {
    //     log('initByThirdHref', e);
    //     pageLoadingStatus.value = 2;
    //     errorDesc.value = [undefined, 2000014, 2000018].includes(e.code)
    //       ? e.desc
    //       : '请求服务器失败';
    //     showInfo(errorDesc.value);
    //   }
    // };

    const handleGuardianClockInDetail = () => {
      const params = getPageParams<IParams>();
      taskId.value = params.taskId;
      if (params.locationId) {
        if (params.timestamp) {
          const now = Date.now();
          if (now - Number.parseInt(params.timestamp) > 24 * 60 * 60 * 1000) {
            pageLoadingStatus.value = 2;
            errorDesc.value = '转发链接已失效';
            return;
          }
        }
        // login(() => initByThirdHref(params.locationId));
        fetchDetail();
      } else {
        fetchDetail();
      }
    };

    const handleRefFetchData = () => {
      const pager: IPager = { pageSize: 9999, pageNum: 1, total: 0 };
      return Promise.all([fetchDataFunc(pager, 'append')]);
    };

    onBeforeMount(() => {
      // #ifdef MP-WEIXIN
      const pages = getCurrentPages();
      if (pages.length === 2 && pages[0].route === 'pages/welcome/welcome-wx') {
        const { locationId, taskId, timestamp } = getPageParams<IParams>();
        if (locationId && taskId && timestamp) {
          uni.reLaunch({
            url: `/app-preprimary-education/clock-in/guardian/detail/index?locationId=${locationId}&taskId=${taskId}&timestamp=${timestamp}`,
          });
        }
      }
      // #endif

      // #ifdef MP-WEIXIN
      uni.hideShareMenu({ hideShareItems: [] });
      // #endif
      uni.$on('handleGuardianClockInDetail', handleGuardianClockInDetail);
      uni.$on('guardian-comment-or-like', handleRefFetchData);

      handleGuardianClockInDetail();
    });
    onBeforeUnmount(() => {
      uni.$off('handleGuardianClockInDetail', handleGuardianClockInDetail);
      uni.$off('guardian-comment-or-like', handleRefFetchData);
    });

    const handleBackToHome = () => {
      uni.reLaunch({
        url: '/pages/workbench/index',
      });
    };

    return {
      refreshScrollRef,
      errorDesc,
      pageLoadingStatus,
      loadingRecordStatus,
      detail,
      records,
      curStatus,
      handleSelectCalendar,
      handleBackToHome,
      handleRefFetchData,
      fetchDataFunc,
      handlePunch,
      commentRemark,
      showCommentModal,
      currentRecord,
      sendComment,
      isComment,
    };
  },
});
</script>
<style lang="scss" scoped>
.add-btn {
  padding: 0rpx 32rpx;
}
</style>
