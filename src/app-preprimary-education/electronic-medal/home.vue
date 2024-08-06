<template>
  <c-refresh-scroll
    :fetch-data-func="throttledFetchDataFunc"
    :is-open-scroll2-bottom="false"
    :auto-mount="false"
  >
    <template #top_area>
      <ProfileHome @onLoadClazz="throttledFetchDataFunc" />
    </template>
    <view>
      <view class="plr-l ptb-b">
        <StudentList :students="students" />
      </view>
      <c-empty v-if="students.length === 0" bg-type="fill-default" content="暂无数据" />
    </view>
  </c-refresh-scroll>
  <c-bottom>
    <view class="flex-around">
      <u-button style="width: 320rpx" type="primary" @click="clickStar">
        <c-image
          :src="bottomStar"
          :width="34"
          :height="34"
          class="lh-0 pr-xxs"
          :show-loading="false"
        />
        点亮星星
      </u-button>
      <u-button style="width: 320rpx" type="primary" @click="clickMedal">
        <c-image
          :src="bottomMedal"
          :width="34"
          :height="34"
          class="lh-0 pr-xxs"
          :show-loading="false"
        />
        点亮勋章
      </u-button>
    </view>
  </c-bottom>
  <c-select
    v-model:show="isOpen"
    v-model:list="list"
    :auto-close-after-select="false"
    :show-check-icon="true"
    multiple
    :mask-close-able="false"
    title="选择学生"
    title-type="text"
    @onConfirm="handleConfirmStar"
  />
</template>

<script lang="ts" setup>
import ProfileHome from '@/app-preprimary-education/electronic-medal/components/profile-home/index.vue';
import StudentList from '@/app-preprimary-education/electronic-medal/components/student-list/index.vue';
import { useTimeImpression } from '@/app-preprimary-education/electronic-medal/utils/use-electronic-medal';
import { throttle } from '@/utils/lodash-es';
import { showInfo } from '@/utils/tools';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, ref, toRefs } from 'vue';
import bottomMedal from '../static/image/bottom-medal.png';
import bottomStar from '../static/image/bottom-star.png';
import { saveStarOrMedal } from './utils/service';

const store = useTimeImpression();
const { students } = toRefs(store.homePage);
const { curClazz } = toRefs(store);
const isOpen = ref(false);

/** 学生弹窗列表数据 */
const list = computed(() => {
  const data = students.value.map((item: any, index: number) => {
    return {
      text: item.studentName,
      checked: false,
      disabled: true,
      id: item.studentId,
    };
  });
  return data;
});

/** 点亮星星 - 选择学生弹窗 */
const clickStar = () => {
  isOpen.value = true;
};

/** 点亮勋章 - 跳转 */
const clickMedal = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/electronic-medal/add-medal`,
  });
};

/** 赠送星星 */
const handleConfirmStar = async (inx: any) => {
  const studentIds = list.value
    .filter((item: any, index: any) => {
      return inx.includes(index);
    })
    .map((item: any) => item.id);
  try {
    await saveStarOrMedal({ studentIds, medalType: 1 });
    showInfo('星星已经送给小朋友啦~');
  } catch (e: any) {
    showInfo(e?.desc);
  } finally {
    isOpen.value = false;
    reLoadEvent();
  }
};

const fetchDataFunc = async () => {
  const res = await store.homePage.getHomeList(curClazz.value.clazzId);
  return res;
};

onLoad(() => {
  uni.$on('reLoad', reLoadEvent);
  uni.$on('reLoadDelete', reLoadEvent);
});

onShow(() => {
  if (curClazz.value.clazzId) reLoadEvent();
});

const reLoadEvent = () => {
  throttledFetchDataFunc();
};

const throttledFetchDataFunc = throttle(fetchDataFunc, 1000);
</script>
