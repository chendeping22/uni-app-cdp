<template>
  <page>
    <ManageList v-if="tabKey === 'manage'" :hasTabbar="hasTabbar" />
    <DeclareList v-if="tabKey === 'declare'" :hasTabbar="hasTabbar"></DeclareList>
    <TopicList v-if="tabKey === 'mine'" :hasTabbar="hasTabbar"></TopicList>
    <template v-if="bottomLoading">
      <view
        style="
          width: 100%;
          height: 112rpx;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <u-loading></u-loading>
      </view>
    </template>
    <template v-else>
      <u-tabbar
        v-if="hasTabbar"
        v-model="tabbarIndex"
        inactive-color="rgba(0, 0, 0, 0.65)"
        :list="tabbarList"
        active-color="#1677FF"
        style="z-index: 0; position: relative"
      ></u-tabbar>
    </template>
  </page>
</template>

<script setup lang="ts">
import bookSelect from '@/app-teacher-personnel/static/topic/book-select.svg';
import book from '@/app-teacher-personnel/static/topic/book.svg';
import listSelect from '@/app-teacher-personnel/static/topic/list-select.svg';
import list from '@/app-teacher-personnel/static/topic/list.svg';
import meSelect from '@/app-teacher-personnel/static/topic/me-select.svg';
import me from '@/app-teacher-personnel/static/topic/me.svg';
import { getApplicationsMenus } from '@/app-teacher-personnel/topic/api/auth';
import DeclareList from '@/app-teacher-personnel/topic/declare/List.vue';
import ManageList from '@/app-teacher-personnel/topic/manage/list.vue';
import TopicList from '@/app-teacher-personnel/topic/mine/List.vue';
import { getPageParams, isEdu } from '@/utils/tools';
import { onShow } from '@dcloudio/uni-app';
import { filter, some } from 'lodash-es';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';

const BASE_TAB = [
  {
    iconPath: book,
    selectedIconPath: bookSelect,
    text: '课题管理',
    key: 'manage',
    path: '/app-teacher-personnel/topic/index?tab=manage',
  },
  {
    iconPath: me,
    selectedIconPath: meSelect,
    text: '课题申报',
    key: 'declare',
    path: '/app-teacher-personnel/topic/index?tab=declare',
  },
  {
    iconPath: list,
    selectedIconPath: listSelect,
    text: '我的课题',
    key: 'mine',
    path: '/app-teacher-personnel/topic/index?tab=mine',
  },
];

const edu = isEdu();
const tabbarIndex = ref(0);
const urlTab = ref();

const tabbarList = ref([]);
const bottomLoading = ref(false);

const hasTabbar = computed(() => tabbarList.value?.length > 1);

const tabKey = computed({
  get() {
    return tabbarList.value[tabbarIndex.value]?.key;
  },
  set(val: string) {
    let index = tabbarList.value.findIndex(t => t.key === val);
    if (index < 0) {
      index = 0;
    }
    tabbarIndex.value = index;
  },
});

// 进页面：根据url的参数tab更新当前active的tabbar，接着获取底部tabbar的权限接口，此时是需要更新tabbarIndex的
watch(
  () => tabbarList.value,
  () => {
    if (urlTab.value) {
      tabKey.value = urlTab.value;
    }
  },
);

watch(
  () => [tabbarIndex.value, tabbarList.value],
  ([newVal, newVal1]) => {
    const title = newVal1?.[newVal]?.text;
    if (title) {
      uni.setNavigationBarTitle({
        title,
      });
    }
  },
);

function getManagePermission() {
  const code = edu ? 'TopicEdu' : 'Topic';
  bottomLoading.value = true;
  getApplicationsMenus(code)
    .then(res => {
      console.log('🚀ccc ~ getApplicationsMenus ~ res:', res);
      // tabbarList.value = BASE_TAB;
      tabbarList.value = filter(BASE_TAB, one => some(res, t => t.path === one.path));
    })
    .finally(() => {
      bottomLoading.value = false;
    });
}

// 课题申报=>批次详情=>课题申报，存为草稿或者提交后要回到topic首页的我的课题
// 我的课题=>点击草稿的=>课题申报，存为草稿或者提交后要回到topic首页的我的课题
const isChangeTopicTabbar = ref(false);
const changeTopicTabbarOnShow = () => {
  isChangeTopicTabbar.value = true;
};

function changeTopicTabbar() {
  if (isChangeTopicTabbar.value) {
    tabKey.value = 'mine';
  }
  isChangeTopicTabbar.value = false;
}

onShow(() => {
  changeTopicTabbar();
});

onBeforeMount(() => {
  uni.$on('changeTopicTabbar', changeTopicTabbarOnShow);
});

onBeforeUnmount(() => {
  uni.$off('changeTopicTabbar', changeTopicTabbarOnShow);
});

onBeforeMount(async () => {
  // 根据url的参数tab更新当前active的tabbar
  const params = getPageParams();
  if (params.tab) {
    urlTab.value = params.tab;
    tabKey.value = params.tab;
  }
  // 由于底部的菜单依赖于接口返回的是否是管理员，所以在这里请求
  getManagePermission();
});
</script>

<style scoped lang="scss"></style>
