<template>
  <StudentBatch :cur-tab="2" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import StudentBatch from '../task-check/components/student-index/batch.vue';

export default defineComponent({
  components: { StudentBatch },

  setup() {
    return {};
  },
});
</script>
