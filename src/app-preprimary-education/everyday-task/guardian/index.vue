<template>
  <mt-page :title="pageTitle" :show-top-gap="false">
    <StudentCard
      :student-id="curStudentId"
      :student-list="studentList.array"
      :alertdatas="alertdata"
      class="student-wrap"
      @showSelectPopup="showStudents = true"
    />
    <view class="mt-b plr-l">
      <view
        v-for="item in orders.array"
        :key="item?.id"
        class="list flex mb-b plr-l radius-default bg-white"
        @click.stop="handleJump(item)"
      >
        <view class="flex-grow">
          <view class="font-title">
            {{ item.inspectionModeName }}
          </view>
          <view class="font-secondary color-placeholder">
            {{ formatDate(item.inspectionTime, 'YYYY-MM-DD hh:mm:ss') }}
          </view>
        </view>
        <view class="rightStyle no-shrink">
          <view v-if="item.healthStatus == 1" class="normal">正常</view>
          <view v-else class="abnormal">异常</view>
        </view>
      </view>
      <c-empty v-if="orders.array.length === 0" bg-type="fill-default" />
    </view>
    <c-empty-line need-safe-bottom class-name="ptb-b" />
  </mt-page>
  <popup-list
    :show-popup="showStudents"
    :list-data="studentListOpts.array"
    :default-value="curStudentId"
    @onClose="showStudents = false"
    @onSelect="handleSelectPopup"
  />
</template>

<script lang="ts">
import PopupList from '@/app-preprimary-education/components/popup-list/popup-list.vue';
import {
  IGetDetailByRecordIdRtn,
  getStudentByTeacherId,
  getStudentRecords,
} from '@/app-preprimary-education/services/health-day';
import { getSpecialAppName, specialApp } from '@/app-preprimary-education/utils/tools';
import { loginStore } from '@/store/modules/login';
import { formatDate, getPageParams, showInfo } from '@/utils/tools';
import { computed, defineComponent, onBeforeMount, reactive, ref } from 'vue';
import mtPage from '../../components/mt-page/mt-page.vue';
import StudentCard, { studentItem } from './components/student-card.vue';

export default defineComponent({
  components: { StudentCard, mtPage, PopupList },

  setup() {
    const orders = reactive({
      array: [] as IGetDetailByRecordIdRtn[],
    });
    const curStudentId = ref('');
    const alertdata = ref('');
    const studentList = reactive({ array: [] as studentItem[] });
    const studentListOpts = reactive({ array: [] as IPopupList[] });
    const showStudents = ref(false);

    const pageTitle = computed(() => getSpecialAppName(specialApp.DailyHealth) || '一日三检');

    const fetchDataFunc = async (studentId: any) => {
      const res = await getStudentRecords(studentId);
      if (res && res.detaillist) {
        orders.array = res.detaillist;
      } else {
        orders.array = [];
      }
      if (res && res.checkResultPrompt) {
        alertdata.value = res.checkResultPrompt;
      } else {
        alertdata.value = '';
      }
    };
    const handleSelectPopup = (selected: IPopupList) => {
      showStudents.value = false;
      curStudentId.value = selected.value;
      fetchDataFunc(selected.value);
    };
    const fetchStudent = async (params: any) => {
      let ids = params.id;
      if (!ids) {
        ids = loginStore().currentOrganization?.childId;
      }
      try {
        const res = await getStudentByTeacherId();
        if (res.length === 0) return;
        // 若未初始化默认第一个
        if (!curStudentId.value) {
          curStudentId.value = ids;
          fetchDataFunc(ids);
        }
        const temp: studentItem[] = res.map((item: { id: any; name: any; gender: any }) => {
          return {
            id: item.id,
            name: item.name,
            gender: item.gender,
          };
        });
        studentList.array = temp;
        studentListOpts.array = res.map((item: { id: any; name: any }) => {
          return {
            value: item.id,
            label: item.name,
          };
        });
      } catch (e: any) {
        showInfo(e?.desc || '请求服务器失败');
      }
    };

    const handleJump = (item: any) => {
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/inspection-record/detail?id=${item.id}`,
      });
    };
    onBeforeMount(() => {
      const params = getPageParams();
      fetchStudent(params);
    });

    return {
      pageTitle,
      fetchDataFunc,
      fetchStudent,
      curStudentId,
      handleSelectPopup,
      handleJump,
      formatDate,
      showStudents,
      studentList,
      studentListOpts,
      orders,
      alertdata,
    };
  },
});
</script>

<style lang="scss" scoped>
.list {
  height: 120rpx;

  .rightStyle {
    .abnormal {
      background: $ui-color-error;
      border-radius: $ui-radius-default;
      color: $ui-color-white;
      padding: 0 $ui-gap-small;
    }
    .normal {
      background: $ui-color-success;
      border-radius: $ui-radius-default;
      color: $ui-color-white;
      padding: 0 $ui-gap-small;
    }
  }
}
</style>
