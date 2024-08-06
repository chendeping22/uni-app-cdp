<template>
  <template v-if="dailyHealth.students.length">
    <StudentIndex :cur-tab="curTab" :extra="extra" />
  </template>
  <c-empty v-else bg-type="fill-default" content="暂无待检查的学生" />
</template>
<script lang="ts">
import { DAILY_HEALTH, useStore } from '@/store/old';
import { getPageParams } from '@/utils/tools';
import { defineComponent, onBeforeMount, provide, ref } from 'vue';
import { IgetStudentList, getStudentList } from '../services/health-day';
import { HealthDayCheckType } from '../utils/constant';
import StudentIndex from './components/student-index/index.vue';

interface IPageParams {
  title: string;
  type: 1 | 2 | 3;
  inspectionTaskId: string;
}
export default defineComponent({
  components: { StudentIndex },
  props: {
    extra: {
      type: Object,
      default() {
        return {} as { selectDate: string; classValue: Array<string> };
      },
    },
  },
  setup(props) {
    const value = ref(props.extra);
    const pageParams = ref({} as IPageParams);
    const {
      commit,
      state: { dailyHealth },
    } = useStore();

    const curTab = ref(0);

    /** 判断是否已检测, 若是则打开确认框 */
    const injectCurSelectStudent = (item: IgetStudentList) => {
      if ([1, 2].includes(item.healthStatus)) {
        return;
      }
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
      HealthDayCheckType,
      dailyHealth,
      value,
    };
  },
});
</script>
