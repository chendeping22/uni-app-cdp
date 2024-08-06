<template>
  <page v-if="loading">
    <view
      style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center"
    >
      <u-loading></u-loading>
    </view>
  </page>
  <page v-else-if="isDeleted">
    <view>
      <!-- <u-alert-tips :show-icon="true" type="warning" title="批次已删除"></u-alert-tips> -->
      <!-- 消息通知不会进入这里，无需按钮 -->
      <EmptyPage description="批次已被删除，查看其他批次"> </EmptyPage>
    </view>
  </page>
  <page v-else>
    <view
      class="manage-detail-content"
      style="height: calc(100vh - 128rpx - var(--window-top) - env(safe-area-inset-bottom))"
    >
      <scroll-view :scroll-y="true" style="height: 100%" scroll-with-animation>
        <BatchHeader :data="formState" />
        <view class="total-tip">
          共{{ countData.all }}个课题，其中{{ countData.already }}个已立项
        </view>
        <Steps
          v-model:active="activeIndex"
          :self="self"
          :data="formState"
          :current="currentIndex"
        ></Steps>
        <!-- 课题列表 -->
        <TopicList :id="id" :stage="activeIndex + 1" :batch-level="level" />
      </scroll-view>
    </view>
    <view class="manage-detail-bottom">
      <u-button plain type="primary" class="btn flex-none" @click="showSheet = true" v-if="self"
        ><u-icon name="more-dot-fill"></u-icon>
      </u-button>
      <u-button plain type="primary" class="btn disabled" v-if="currentIndex > 3" disabled
        >已结题
      </u-button>
      <u-button
        v-if="currentIndex <= 3 && self"
        plain
        type="primary"
        class="btn"
        @click="handleNext"
        >{{ currentIndex === 3 ? '结题' : '进入下一阶段' }}</u-button
      >
      <u-button
        v-if="currentIndex <= 3 && self"
        type="primary"
        plain
        class="btn"
        @click="handleOpenTime"
        >修改截止时间</u-button
      >
      <u-button v-if="!edu && currentIndex <= 3" type="primary" class="btn" @click="handleNotify"
        >通知</u-button
      >
    </view>
    <Confirm ref="confirmRef"></Confirm>
    <u-action-sheet
      v-model="showSheet"
      safe-area-inset-bottom
      :list="sheetList"
      @click="actionSheetCallback"
    ></u-action-sheet>
    <!-- 截止时间 -->
    <TimeEditor
      ref="timeRef"
      :data="formState"
      :current="currentIndex"
      @submit="submitHandle"
    ></TimeEditor>
  </page>
</template>

<script setup lang="ts">
import {
  deleteBatch,
  detail,
  nextStage,
  nextStageCheck,
} from '@/app-teacher-personnel/topic/api/topicBatch';
import BatchHeader from '@/app-teacher-personnel/topic/components/BatchHeader.vue';
import EmptyPage from '@/app-teacher-personnel/topic/components/EmptyPage/index.vue';
import Confirm from '@/app-teacher-personnel/topic/components/confirm/index.vue';
import { loginStore } from '@/store/modules/login';
import { isEdu } from '@/utils/tools';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { cloneDeep } from 'lodash-es';
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue';
import Steps from './Steps.vue';
import TimeEditor from './TimeEditor.vue';
import TopicList from './TopicList.vue';

const store = loginStore();
const { userInfo } = store;

const confirmRef = ref<InstanceType<typeof Confirm>>();
const timeRef = ref<InstanceType<typeof TimeEditor>>();

const edu = isEdu();
const locationId = userInfo?.locationId;
const isDeleted = ref(false);
const loading = ref(false);
// 获取url参数，id
// const id: any = route.query.id;
const id = ref('');
// let pn: any = route.query.pn;
const formState = ref();
const batchDetail = ref<any>({});
//是否本单位创建的批次
const self = ref(true);
const level = ref(5);

/** 当前进行到的阶段序号 */
const currentIndex = ref(0);
/** 当前激活的阶段序号（Tab） */
const activeIndex = ref(0);

const countData = ref({});
const showSheet = ref(false);

const sheetList = computed(() => {
  let _list = currentIndex.value != 4 ? [{ text: '编辑', val: 'edit' }] : [];
  _list.push({ text: '删除', val: 'delete' });
  return _list;
});

// 通知给相关人员
const handleNotify = () => {
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/manage/notice?id=${id.value}`,
  });
};

// 修改时间表单提交
const submitHandle = async (values: any) => {
  //刷新截止时间
  for (var i = 0; i < formState.value.materials.length; i++) {
    formState.value.materials[i].deadline = values['' + i];
  }
};

function handleOpenTime() {
  timeRef.value?.open();
}

/** 删除 */
const handleDelete = async () => {
  if (
    !(await confirmRef?.value?.confirm({
      title: '',
      content: '删除批次后，批次下所有申报的课题和材料也将被删除且不可恢复，请谨慎操作',
      confirmText: '确认删除',
      cancelText: '取消',
    }))
  ) {
    return;
  }

  const ids = [];
  ids.push(id.value);
  deleteBatch(ids)
    .then(() => {
      uni.showToast({
        title: '删除成功',
        icon: 'success',
      });
      uni.$emit('refreshTopicManageList');
      //返回课题列表
      uni.navigateBack();
    })
    .catch((res: any) => {
      uni.showToast({
        title: res?.desc || '删除失败',
        icon: 'none',
        mask: false,
        duration: 3000,
      });
    });
};

function actionSheetCallback(index) {
  const action = sheetList.value[index]?.val;
  console.log('🚀ccc ~ index:', action);
  if (action === 'edit') {
    uni.navigateTo({
      url: `/app-teacher-personnel/topic/manage/edit?id=${id.value}`,
    });
  } else {
    handleDelete();
  }
}

//获取详情
const getDetail = async (_id: any, isFirst = false) => {
  if (_id != '') {
    //查询
    if (isFirst) {
      loading.value = true;
    }

    const res = await detail(_id)
      .catch(e => {
        if (e?.code === 2010005) {
          isDeleted.value = true;
        }
        return Promise.reject(e);
      })
      .finally(() => {
        loading.value = false;
      });
    batchDetail.value = cloneDeep(res);
    //回显数据
    formState.value = res;
    let stage = res.stage;
    if (stage == 5) {
      stage = 4;
    }
    currentIndex.value = res.stage - 1;
    activeIndex.value = stage - 1;
    level.value = res.level;
    if (res.locationId != locationId) {
      self.value = false;
    }
  }
};

const handleNext2 = async (res: any) => {
  if (!res.passed) {
    confirmRef?.value?.confirm({
      title: '',
      content: res.tips,
      confirmText: '知道了',
      showCancelButton: false,
    });
    //点击知道了，直接返回
    return;
    // Modal.warn({
    //   title: '提示',
    //   content: res.tips,
    //   centered: true,
    //   icon: h(InfoCircleFilled, {
    //     style: { color: token.value.colorPrimary },
    //   }),
    // });
    // //点击知道了，直接返回
    // return;
  }

  if (
    !(await confirmRef?.value?.confirm({
      title: '',
      content: res.tips,
      confirmText: '确认',
    }))
  ) {
    return;
  }
  if (res.passed) {
    nextStage(id.value, batchDetail.value.stage + 1)
      .then(() => {
        uni.showToast({
          title: '操作成功',
          icon: 'success',
        });
        //更新阶段
        currentIndex.value = currentIndex.value + 1;
        activeIndex.value = currentIndex.value;
        getDetail(id.value);
      })
      .catch((res: any) => {
        uni.showToast({
          title: res?.desc || '进入下一阶段失败',
          icon: 'none',
          mask: false,
          duration: 3000,
        });
      });
  }
};

/** 进入下一阶段校验 */
const handleNext = () => {
  // 校验阶段
  nextStageCheck(id.value, batchDetail.value.stage + 1)
    .then((res: any) => {
      handleNext2(res);
    })
    .catch((res: any) => {
      uni.showToast({
        title: res?.desc || '阶段校验失败',
        icon: 'none',
        mask: false,
        duration: 3000,
      });
    });
};

function updateCount(data) {
  countData.value = data;
}

onBeforeMount(() => {
  uni.$on('manageDetailCount', updateCount);
});

onBeforeUnmount(() => {
  uni.$off('manageDetailCount', updateCount);
});

onLoad(options => {
  if (options.id) {
    id.value = options.id;
    // getDetail(options.id);
  }
});

onShow(() => {
  // id.value = options.id;
  getDetail(id.value, true);
});
</script>

<style scoped lang="scss">
:deep(.tab-area) {
  scroll-view ::v-deep ::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
  }
}
// 通过样式穿透，隐藏H5下，scroll-view下的滚动条
scroll-view ::v-deep ::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

.manage-detail-content {
  padding: px2rpx(12px) px2rpx(16px);

  .total-tip {
    margin: px2rpx(12) 0;
    color: rgba($color-text-base, 0.65);
    @include footnote-regular;
  }
}
.manage-detail-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 24rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 4px 0 #00000014;
  background-color: #fff;
  .btn {
    flex: auto;
    &:not(:last-child) {
      margin-right: 24rpx;
    }
    &.flex-none {
      flex: none;
      &.u-btn {
        padding: 24rpx;
      }
      :deep(.u-btn) {
        padding: 24rpx;
      }
    }
    &.disabled {
      opacity: 0.5;
    }
  }
  :deep(.u-btn) {
    padding: 0;
  }
}
</style>
