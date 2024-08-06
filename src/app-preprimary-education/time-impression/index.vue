<template>
  <home v-if="isTeacher"></home>
  <viewPicture v-else></viewPicture>
</template>
<script lang="ts" setup>
import useIsTeacher from '@/utils/use-is-teacher';
import home from './home.vue';
import viewPicture from './view-picture.vue';

const isTeacher = useIsTeacher();
</script>
