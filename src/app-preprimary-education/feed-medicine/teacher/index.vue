<template>
  <mt-page
    title="服药登记"
    :show-top-gap="false"
    :show-notice-bar="false"
    style="display: flex; flex-direction: column; height: 100vh; overflow: hidden"
  >
    <view class="page-container">
      <TabList />
    </view>
  </mt-page>
</template>

<script lang="ts">
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { defineComponent } from 'vue';
import TabList from '../components/tab-list/index.vue';

export default defineComponent({
  components: {
    TabList,
    mtPage,
  },
  setup() {},
});
</script>
<style lang="scss" scoped>
::v-deep {
  .c-page-body {
    height: 100vh;
  }
}
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
