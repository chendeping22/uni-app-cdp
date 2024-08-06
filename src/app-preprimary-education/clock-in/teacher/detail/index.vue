<template>
  <CustomPage title="打卡详情" bg-type="clock-in" :page-loading-status="pageLoadingStatus">
    <template #loading_error>
      <imp-empty-data :title="errorDesc" class-name="mt-xl" />
      <view class="flex-center mt-xl">
        <ImpButton width="400rpx" @click="handleGoBack">返回上一页</ImpButton>
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
        <TaskNavs
          v-if="currentUserCreate"
          :detail="detail.value"
          @clickDelTask="handlerDelTask"
          @clickEndTask="handlerTaskEnding"
        />
        <TaskCalendar :detail="detail.value" @onSelectCalendar="handleSelectCalendar" />
        <ClassList
          v-if="clockinDate"
          :modal-state="modalState"
          :class-list="classList"
          :current-class="currentClass"
          :task-date="clockinDate"
          :tasks-id="taskId"
          @onChangeModalState="changeModalState"
        />
        <TaskRecord
          :list="records.array"
          :loading-status="loadingRecordStatus"
          :enabled-view="detail.value.enabledView === 1"
          v-model:showCommentModal="showCommentModal"
          v-model:currentRecord="currentRecord"
          v-model:isComment="isComment"
        />
        <imp-empty-line size="xl" is-bottom />
      </card>
    </c-refresh-scroll>
    <popup-list
      title="请选择"
      :show-popup="modalState"
      :list-data="classList"
      :default-value="currentClass?.value"
      @onSelect="chooseClass"
      @onClose="() => changeModalState(false)"
    />
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
  </CustomPage>
</template>
<script lang="ts">
import { ICalendar } from '@/app-preprimary-education/clock-in/guardian/task-calendar/components/calendars/index.vue';
import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import ImpEmptyLine from '@/app-preprimary-education/components/imp-empty-line/imp-empty-line.vue';
import {
  IDataLoadType,
  IPager,
} from '@/app-preprimary-education/components/imp-refresh-scroll/imp-refresh-scroll.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import popupList from '@/app-preprimary-education/components/popup-list/popup-list.vue';
import {
  IClockinRecord,
  IGetClockInDetailRtn,
  ITaskDetail,
  getClassTaskDetail,
  getClockInDetailByTeacher,
  getClockinRecord,
  sendComments,
  taskDel,
  taskEnding,
} from '@/app-preprimary-education/services/clock-in';
import { shareClockInTask } from '@/app-preprimary-education/utils/clock-in-share';
import { IOnShareAppMessage } from '@/app-preprimary-education/utils/common-types';
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue';
import TaskCalendar from '../../guardian/detail/components/task-calendar/index.vue';
import TaskDetail from '../../guardian/detail/components/task-detail/index.vue';
import TaskNavs from '../../guardian/detail/components/task-navs/index.vue';
import TaskRecord from '../../guardian/detail/components/task-record/index.vue';
import ClassList from './components/task-class/index.vue';

interface IParams {
  id: string;
}
type IShare = Pick<IGetClockInDetailRtn, 'id' | 'personName' | 'title'>;
type IListItem = { label?: string; value: string; clockinNum?: number; studentNum?: number };
export default defineComponent({
  components: {
    TaskDetail,
    TaskNavs,
    TaskCalendar,
    TaskRecord,
    ClassList,
    CustomPage,
    ImpEmptyLine,
    ImpEmptyData,
    ImpButton,
    Card,
    popupList,
  },
  onShareAppMessage(item: IOnShareAppMessage<'button'>) {
    const task: IShare = item.target.dataset.msg;
    return shareClockInTask(task);
  },
  onShow() {
    uni.$emit('clock-in-teacher-detail-show');
  },
  setup() {
    const refreshScrollRef = ref(null as any);
    const modalState = ref(false);
    const currentClass: IListItem = reactive({} as IListItem);
    const classList: IListItem[] = reactive([]);
    const pageLoadingStatus = ref(0);
    const errorDesc = ref('');
    const detail = reactive({ value: {} as IGetClockInDetailRtn });
    const taskId = ref('');
    const clockinDate = ref(NaN); // 请求参数
    const loadingRecordStatus = ref(0); // 加载状态 0-未开始 1-已查询
    const records = reactive({ array: [] as IClockinRecord[] });
    const userInfo = loginStore().userInfo;
    const showCommentModal = ref(false); // 评论弹窗
    const commentRemark = ref(''); // 评论
    const currentRecord = ref<IClockinRecord>({} as IClockinRecord); // 当前评论的记录
    const isComment = ref<{ [key: string]: boolean }>({});

    /** 创建任务的老师是当前登录老师 */
    const currentUserCreate = computed(() => {
      if (!detail?.value?.userId) return false;
      const userId = detail.value?.userId;
      const personId = userInfo?.personId;
      return userId === personId;
    });

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
        await sendComments(params, true);
      } catch (e) {}
      isComment.value = { ...isComment.value, [currentRecord.value.id]: true };
      commentRemark.value = '';
      uni.$emit('teacher-comment-or-like');
    };

    // 班级明细记录 -- 打卡人数/配置人数
    const fetchCLockInNum = async ({ id, date, clazzId }: ITaskDetail) => {
      // 没有默认打卡日期不请求
      if (date && clazzId !== undefined) {
        const res = await getClassTaskDetail({
          id,
          date,
          clazzId,
        });
        currentClass.clockinNum = res?.clockins?.length || 0;
      } else {
        currentClass.clockinNum = 0;
      }
    };

    // 处理当前选中班级数据
    const renderClassData = (item: Record<string, any>) => {
      currentClass.clockinNum = item.clockinNum;
      currentClass.studentNum = item.studentNum;
      currentClass.label = item.label;
      currentClass.value = item.value;
    };

    // 处理班级列表
    const getClassList = (detail: IGetClockInDetailRtn) => {
      const classData = detail.clazzs;
      const formatClass = (classData || []).map(v => ({
        label: v.clazzName,
        value: v.clazzId,
        ...v,
      }));
      Object.assign(classList, formatClass);
      if (!formatClass.length) return;
      const params: any = getPageParams();
      // 跳转过来带了默认班级
      if (params.id && params.clazzId !== 'null') {
        const item: any = formatClass.find(v => v.value === params.clazzId) || {};
        renderClassData(item);
        return;
      }
      // 无默认参数，默认选中第一个
      currentClass.label = formatClass[0].label;
      currentClass.clockinNum = formatClass[0].clockinNum;
      currentClass.value = formatClass[0].value;
      currentClass.studentNum = formatClass[0].studentNum;
    };

    const fetchDetail = async () => {
      try {
        const res = await getClockInDetailByTeacher(taskId.value);
        pageLoadingStatus.value = 1;
        detail.value = res;
        getClassList(detail.value);
        // 若任务未开始也需要调用一下record接口, 避免初始化问题
        if (res.calendarVoList[0].clockinDate > today.value.getTime()) {
          records.array = [];
          refreshScrollRef.value.initData();
        }
      } catch (e: ICatch) {
        pageLoadingStatus.value = 2;
        errorDesc.value = e.desc || '请求服务器失败';
      }
    };

    const handleSelectCalendar = (c: ICalendar) => {
      clockinDate.value = c.clockinDate;
      fetchCLockInNum({ id: taskId?.value, date: c.clockinDate, clazzId: currentClass.value });
      records.array = [];
      refreshScrollRef.value.initData();
    };

    const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
      const { pageSize, pageNum } = pager;
      const res = await getClockinRecord({
        taskId: taskId.value,
        clockinDate: clockinDate.value,
        clazzId: currentClass.value,
        pageSize,
        pageNum,
      });
      loadingRecordStatus.value = 1;
      type === 'new' && (records.array = []);
      records.array.push(...res.result);
      return res;
    };

    const changeModalState = (state: boolean) => {
      modalState.value = state;
    };

    // 班级切换
    const chooseClass = async (item: Record<string, any>) => {
      modalState.value = false;
      await renderClassData(item);
      fetchCLockInNum({ id: taskId.value, date: clockinDate.value, clazzId: item?.value });
      const pager: IPager = { pageSize: 9999, pageNum: 1, total: 0 };
      fetchDataFunc(pager, 'new');
    };

    const handlerTaskEnding = async (id: string) => {
      try {
        await taskEnding(id);
        fetchDetail();
        pageLoadingStatus.value = 1;
      } catch (e: ICatch) {
        pageLoadingStatus.value = 2;
        errorDesc.value = e.desc || '请求服务器失败';
      }
    };
    const handlerDelTask = async (id: string) => {
      try {
        await taskDel(id);
        uni.navigateBack({});
        pageLoadingStatus.value = 1;
      } catch (e: ICatch) {
        pageLoadingStatus.value = 2;
        errorDesc.value = e.desc || '请求服务器失败';
      }
    };
    const handleGoBack = () => {
      uni.navigateBack({});
    };

    // 下拉刷新: 获取打卡详情 & 打卡明细（人数）
    const handleRefFetchData = () => {
      const pager: IPager = { pageSize: 9999, pageNum: 1, total: 0 };
      // 优化：临时处理任务关联的班级被删除
      if (currentClass.value !== undefined) {
        return Promise.all([
          fetchDataFunc(pager, 'new'),
          fetchCLockInNum({
            id: taskId?.value,
            date: clockinDate.value,
            clazzId: currentClass.value,
          }),
        ]);
      }
    };

    const handleOnShow = () => {
      fetchDetail();
      handleRefFetchData();
    };

    onBeforeMount(() => {
      // #ifdef MP-WEIXIN
      uni.hideShareMenu({ hideShareItems: [] });
      // #endif
      const params = getPageParams<IParams>();
      taskId.value = params.id;
      fetchDetail();
      uni.$on('clock-in-teacher-detail-show', handleOnShow);
      uni.$on('teacher-comment-or-like', handleRefFetchData);
    });

    onBeforeUnmount(() => {
      uni.$off('clock-in-teacher-detail-show', handleOnShow);
      uni.$off('teacher-comment-or-like', handleRefFetchData);
    });

    return {
      refreshScrollRef,
      pageLoadingStatus,
      loadingRecordStatus,
      detail,
      records,
      errorDesc,
      handleSelectCalendar,
      classList,
      currentClass,
      modalState,
      taskId,
      clockinDate,
      changeModalState,
      chooseClass,
      handlerDelTask,
      handlerTaskEnding,
      handleGoBack,
      handleRefFetchData,
      currentUserCreate,
      commentRemark,
      showCommentModal,
      currentRecord,
      sendComment,
      isComment,
    };
  },
});
</script>
<style lang="scss">
.setting-popup-dialog {
  .uni-popup-dialog {
    max-width: 80vw;
    padding: $ui-gap-default;
  }
}
</style>
