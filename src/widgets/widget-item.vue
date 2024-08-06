<template>
  <template v-if="widget.hasPermission">
    <today-ai-alarm-total
      v-if="widgetConfig.type === WidgetType.WidgetType_TodayAiAlarmTotal"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></today-ai-alarm-total>
    <today-ai-alarm-proportion
      v-else-if="widgetConfig.type === WidgetType.WidgetType_TodayAiAlarmProportion"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></today-ai-alarm-proportion>
    <today-ai-alarm-situation
      v-else-if="widgetConfig.type === WidgetType.WidgetType_TodayAiAlarmSituation"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></today-ai-alarm-situation>
    <student-attendance
      v-else-if="widgetConfig.type === WidgetType.WidgetType_StudentAttendance"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></student-attendance>
    <staff-attendance
      v-else-if="widgetConfig.type === WidgetType.WidgetType_StaffAttendance"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </staff-attendance>
    <staff-lock-in
      v-else-if="widgetConfig.type === WidgetType.WidgetType_StaffLockIn"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </staff-lock-in>
    <todo-center
      v-else-if="widgetConfig.type === WidgetType.WidgetType_TodoCenter"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></todo-center>
    <day-three-inspection
      v-else-if="widgetConfig.type === WidgetType.WidgetType_DayThreeInspection"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></day-three-inspection>
    <today-student-leave-situation
      v-else-if="widgetConfig.type === WidgetType.WidgetType_TodayStudentLeaveSituation"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></today-student-leave-situation>
    <student-leave-approval-situation
      v-else-if="widgetConfig.type === WidgetType.WidgetType_StudentLeaveApprovalSituation"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></student-leave-approval-situation>
    <site-reservation
      v-else-if="widgetConfig.type === WidgetType.WidgetType_SiteReservation"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></site-reservation>
    <visitor-appointment
      v-else-if="widgetConfig.type === WidgetType.WidgetType_VisitorAppointment"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></visitor-appointment>
    <devices-realtime-status
      v-else-if="widgetConfig.type === WidgetType.WidgetType_DevicesRealtimeStatus"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></devices-realtime-status>
    <devices-open-situation
      v-else-if="widgetConfig.type === WidgetType.WidgetType_DevicesOpenSituations"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></devices-open-situation>
    <classroom-energy-consumption-leaderboard
      v-else-if="widgetConfig.type === WidgetType.WidgetType_ClassroomEnergyConsumptionLeaderboard"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></classroom-energy-consumption-leaderboard>
    <return-process
      v-else-if="widgetConfig.type === WidgetType.WidgetType_ReturnProcess"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></return-process>
    <clock-in
      v-else-if="widgetConfig.type === WidgetType.WidgetType_ClockIn"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></clock-in>
    <live-lesson-board
      v-else-if="widgetConfig.type === WidgetType.WidgetType_LiveLessonBoard"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></live-lesson-board>
    <home-school-notice
      v-else-if="widgetConfig.type === WidgetType.WidgetType_HomeSchoolNotice"
      :widget="widget"
      :body-height="widgetConfig.height"
    ></home-school-notice>
    <tomorrow-curriculum
      v-else-if="widgetConfig.type === WidgetType.WidgetType_PersonalCourse"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </tomorrow-curriculum>
    <curriculum-schedule
      v-else-if="widgetConfig.type === WidgetType.WidgetType_CurriculumSchedule"
      :widget="widget"
      :body-height="widgetConfig.height"
    />
    <office-efficacy
      v-else-if="widgetConfig.type === WidgetType.WidgetType_OfficeEfficacy"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </office-efficacy>
    <missive-manager
      v-else-if="widgetConfig.type === WidgetType.WidgetType_MissiveManager"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </missive-manager>
    <meeting-manage
      v-else-if="widgetConfig.type === WidgetType.WidgetType_MeetingManage"
      :widget="widget"
      :body-height="widgetConfig.height"
    >
    </meeting-manage>
  </template>
</template>

<script lang="ts" setup>
import { IWidget } from '@/store/modules/workbench';
import { computed, ref } from 'vue';
import classroomEnergyConsumptionLeaderboard from './intelligent-iot/classroom-energy-consumption-leaderboard.vue';
import devicesOpenSituation from './intelligent-iot/devices-open-situation.vue';
import devicesRealtimeStatus from './intelligent-iot/devices-realtime-status.vue';
import liveLessonBoard from './intelligent-recording/live-lesson-board.vue';
import todoCenter from './platform/todo-center/index.vue';
import dayThreeInspection from './preprimary-education/day-three-inspection.vue';
import returnProcess from './preprimary-education/return-process.vue';
import clockIn from './preprimary-education/teacher/clock-in.vue';
import CurriculumSchedule from './school-affairs/curriculum-schedule.vue';
import homeSchoolNotice from './school-affairs/home-school-notice.vue';
import meetingManage from './school-affairs/meeting-manage/index.vue';
import MissiveManager from './school-affairs/missive-manager.vue';
import OfficeEfficacy from './school-affairs/office-efficacy.vue';
import staffAttendance from './school-affairs/staff-attendance.vue';
import staffLockIn from './school-affairs/staff-lock-in.vue';
import tomorrowCurriculum from './school-affairs/tomorrow-curriculum.vue';
import siteReservation from './school-safe/teacher/site-reservation.vue';
import studentAttendance from './school-safe/teacher/student-attendance.vue';
import studentLeaveApprovalSituation from './school-safe/teacher/student-leave-approval-situation.vue';
import todayAiAlarmProportion from './school-safe/teacher/today-ai-alarm-proportion.vue';
import todayAiAlarmSituation from './school-safe/teacher/today-ai-alarm-situation.vue';
import todayAiAlarmTotal from './school-safe/teacher/today-ai-alarm-total.vue';
import todayStudentLeaveSituation from './school-safe/teacher/today-student-leave-situation.vue';
import visitorAppointment from './school-safe/teacher/visitor-appointment.vue';
import { WidgetType } from './util/constant';
import { getBodyHeight, getWidgetConfig } from './util/get-widget-info';

/** 1. props定义 */
interface IProps {
  widget: IWidget;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<IProps>(), {});

const widgetConfig = computed(() => {
  const conf = getWidgetConfig(props.widget);
  console.log('widgetConfig----:', conf);
  return {
    type: conf.widget,
    height: getBodyHeight(conf),
  };
});

/** 2. emits定义 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emits = defineEmits([]);

/** 3. your code here! */
ref('');
</script>

<style scoped lang="scss"></style>
