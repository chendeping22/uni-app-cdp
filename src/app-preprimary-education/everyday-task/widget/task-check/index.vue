<template>
  <mt-page
    :title="pageParams.title"
    theme="default"
    :show-top-gap="false"
    :show-bottom-gap="false"
    :show-notice-bar="false"
  >
    <template v-if="dailyHealth.students.length">
      <!-- <TopInfo v-model:cur-tab="curTab" /> -->
      <StudentIndex :cur-tab="curTab" />
    </template>
    <c-empty v-else bg-type="fill-default" content="暂无待检查的学生" />
  </mt-page>
</template>
<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { IgetStudentList, getStudentList } from '@/app-preprimary-education/services/health-day';
import { HealthDayCheckType } from '@/app-preprimary-education/utils/constant';
import { DAILY_HEALTH, useStore } from '@/store/old';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, provide, ref } from 'vue';
import StudentIndex from './components/student-index/index.vue';
import TopInfo from './components/top-info/index.vue';

interface IPageParams {
  title: string;
  type: 1 | 2 | 3;
  inspectionTaskId: string;
}
export default defineComponent({
  components: { TopInfo, StudentIndex, mtPage },
  setup() {
    const pageParams = ref({} as IPageParams);
    const {
      commit,
      state: { dailyHealth },
    } = useStore();

    const curTab = ref(0);

    const showModal = ref(false);

    const curClickStudent = ref({} as IgetStudentList);

    const jumpToCheck = () => {
      const { title, inspectionTaskId, type } = pageParams.value;
      const {
        age,
        birthday,
        certificateNumber: certificateNo,
        clazzId,
        clazzName,
        clazzNo,
        currentLevel,
        gender,
        gradeId,
        gradeName,
        sectionType,
        studentCode,
        id: studentId,
        name: studentName,
      } = curClickStudent.value;
      const params = `title=${title}&inspectionTaskId=${inspectionTaskId}&type=${type}&studentInfo=${JSON.stringify(
        {
          age,
          birthday,
          certificateNo,
          clazzId,
          clazzName,
          clazzNo,
          currentLevel,
          gender,
          gradeId,
          gradeName,
          sectionType,
          studentCode,
          studentId,
          studentName,
        },
      )}`;
      uni.navigateTo({
        url: `/app-preprimary-education/everyday-task/widget/check-detail/index?${params}`,
      });
    };

    /** 判断是否已检测, 若是则打开确认框 */
    const injectCurSelectStudent = (item: IgetStudentList) => {
      curClickStudent.value = item;

      jumpToCheck();
    };
    provide('injectCurSelectStudent', {
      injectCurSelectStudent,
    });

    const init = async () => {
      const { type, inspectionTaskId } = pageParams.value;
      const students = await getStudentList(type, inspectionTaskId);
      commit(DAILY_HEALTH.setdailyHealthStudents, students || []);
    };
    onBeforeMount(() => {
      pageParams.value = getPageParams<IPageParams>();
      init();
    });
    return {
      curTab,
      pageParams,
      showModal,
      curClickStudent,
      HealthDayCheckType,
      dailyHealth,
      jumpToCheck,
    };
  },
});
</script>
