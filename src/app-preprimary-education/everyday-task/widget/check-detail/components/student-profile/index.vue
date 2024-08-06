<template>
  <mt-card>
    <view class="flex">
      <text class="font-title bold mr-s">{{ studentInfo.studentName }}</text>
      <c-icon
        v-if="studentInfo.gender === 2"
        name="icon_gender_female"
        size="32"
        color-type="error"
      />
      <c-icon v-else name="icon_male" size="32" color-type="primary" />
    </view>
    <view class="flex color-placeholder mt-s">
      <text>年龄</text>
      <text class="color-base ml-b">
        {{ studentInfo.age ? `${studentInfo.age}岁` : '/' }}
      </text>
      <text class="ml-xl">所属班级</text>
      <text class="color-base ml-b">{{ studentInfo.clazzName ?? '/' }}</text>
    </view>
  </mt-card>
</template>
<script lang="ts">
import mtCard from '@/app-preprimary-education/components/mt-card/mt-card.vue';
import { IStudentDTO } from '@/app-preprimary-education/services/health-day';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  components: { mtCard },
  props: {
    studentInfo: { type: Object as PropType<IStudentDTO>, default: () => {} },
  },
  emits: [],
  setup() {
    return {};
  },
});
</script>
