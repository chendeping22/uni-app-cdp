<template>
  <mt-page title="操作方式" theme="default" class-name="plr-l">
    <OperateList
      :disabled="disabled"
      :list="list"
      :cur-selects="curSelects"
      @on-confirm="handleConfirm"
      @on-select1="handleSelect1"
      @on-select2="handleSelect2"
    />
  </mt-page>
  <c-modal
    v-model:show="showModal"
    :content="content"
    class-name="modal"
    @onConfirm="delSampleItem"
  />
</template>
<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { computed, onBeforeMount, ref, toRefs } from 'vue';
import mtPage from '../components/mt-page/mt-page.vue';
import { batchDownLoad } from '../utils/download';
import { delay, getPageParams, showInfo } from '../utils/tools';
import OperateList, { IOperateList } from './components/operate-list';
import { IPageTimeSetType } from './utils/constants';
import { getCurrentUserType, isGuardian } from './utils/is';
import { useTimeImpression } from './utils/use-time-impression';

const { userInfo } = loginStore();
const personId = userInfo?.personId;
const content = ref('确认删除吗？');
const deledList = ref([]);
const viewPageOptions = isGuardian()
  ? [
      {
        label: '下载',
        value: 2,
        children: [],
      },
      {
        label: '删除',
        value: 4,
        children: [],
      },
    ]
  : [
      {
        label: '推送',
        value: 1,
        children: [],
      },
      {
        label: '下载',
        value: 2,
        children: [],
      },
      {
        label: '删除',
        value: 4,
        children: [],
      },
    ];

const store = useTimeImpression();
const list = ref<IOperateList[]>([]);
const curSelects = ref<number[]>(!isGuardian() ? [1, 0] : [2, 0]);
const pageParams = ref({} as IPageTimeSetType);
const { curClazz } = toRefs(store);
const showModal = ref(false);

const disabled = computed(() => {
  return false;
});

const handleSelect1 = (item: IOperateList) => {
  curSelects.value = [item.value, 0];
};
const handleSelect2 = (item: IOperateList) => {
  curSelects.value = [4, item.value];
};

const downLoads = () => {
  const urls = store.viewPicturePage.curSelects.map(t => t.resourceURL);
  const types = store.viewPicturePage.curSelects.map(t => t.resourceType);
  batchDownLoad(urls, types);
};
const teacherEvnet = (params: any) => {
  if (params.relation == 0) {
    //老师
    if (params.createBy == personId) {
      return true;
    } else {
      return false;
    }
  } else if (params.relation == 1) {
    //家长
    return true;
  }
};
const guardianEvnet = (params: any) => {
  if (params.createBy == personId) {
    return true;
  } else {
    return false;
  }
};
const isDelete = (params: any) => {
  switch (getCurrentUserType()) {
    case EUserType.guardian:
      return guardianEvnet(params);
    case EUserType.teacher:
      return teacherEvnet(params);
  }
};

const handleConfirm = async () => {
  const items = store.viewPicturePage.curSelects;
  let doBack = false;
  switch (curSelects.value[0]) {
    case 1: {
      if (isGuardian()) return;
      // 推送
      const resourceRelId = items.map(t => t.resourceRelId);
      await store.pushResource(resourceRelId);
      showInfo('推送成功');
      doBack = true;
      break;
    }
    case 2: {
      // 下载
      downLoads();
      break;
    }
    case 4: {
      // 可删除的
      let deled: any = [];
      // 不可删除的
      let noDel: any = [];
      items.forEach((item: any) => {
        if (isDelete(item)) {
          deled.push(item);
        } else {
          noDel.push(item);
        }
      });
      deledList.value = deled;
      if (noDel.length === items.length) {
        showInfo('无权限删除所选内容');
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
        return;
      }
      content.value = !noDel.length
        ? `删除${deled.length}张`
        : `删除${deled.length}张，另外${noDel.length}张无权限删除`;
      showModal.value = true;
      break;
    }
  }
  if (doBack) {
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  }
};
const delSampleItem = async () => {
  const { type, studentId, taskId, studentName } = pageParams.value;

  await store.actionDeleteCurrent(deledList.value.map((t: any) => t.resourceRelId));

  showInfo(`${deledList.value.length}个项目已从"${studentName}"删除`);
  await delay(2000);
  store.viewPicturePage.getCommonQuery(type, studentId, taskId);
  if (type === 'observe') {
    store.observeRecordPage.fetchObserveTaskStudents(taskId);
  } else {
    !isGuardian() && store.homePage.getHomeList(curClazz.value.clazzId);
  }
  uni.navigateBack();
};

const init = () => {
  pageParams.value = getPageParams();
  if (pageParams.value.type === 'observe') {
    list.value = viewPageOptions.slice(2);
  } else {
    list.value = viewPageOptions;
  }
};

onBeforeMount(() => {
  init();
});
</script>
