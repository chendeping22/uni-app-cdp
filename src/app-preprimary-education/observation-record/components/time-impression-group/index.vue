<template>
  <view class="plr-s">
    <view v-for="(item, inx) in lists" :key="`time_${inx}`">
      <view class="mt-b p-all-s">
        <text class="font-content color-placeholder bold">
          {{ formatDate(item.createTime, 'YYYY-MM-DD hh:mm') }}
        </text>
      </view>
      <view class="indicator-project font-secondary">
        <view v-for="(indicator, inx) in item.indicators" :key="`time_${inx}`">
          <view
            class="plr-s project-name flex"
            :style="{
              background: indicatorProjectColor(indicator.domainId),
              color: indicatorProjectTipsColor(indicator.domainId),
            }"
          >
            <view
              class="tips"
              :style="{ background: indicatorProjectTipsColor(indicator.domainId) }"
            />
            {{ indicator.projectName.split('：')[1] }}
          </view>
        </view>
      </view>
      <c-row :row-gutter="16" :gutter="16">
        <c-col v-for="pic in item.resources" :key="pic.resourceId" :span="6">
          <view
            class="relative flex-center icon-168"
            @click="handleClickDetail(pic, item.id, item.updateTime)"
          >
            <!-- <view
                v-if="!pic.thumbnailUrl && pic.resourceType === 2"
                class="icon-168 flex-center radius-default bg-deep"
              ></view> -->
            <img
              v-if="pic.resourceType === 2"
              class="icon-168 flex-center radius-default bg-deep"
              :src="pic.videoSnapshotURL"
            />
            <c-image v-else :src="pic.thumbnailUrl || pic.fileUrl" width="168rpx" height="168rpx" />
            <view
              v-if="pic.resourceType === 2"
              class="absolute icon-168 flex-center radius-default"
            >
              <view
                class="icon-48 radius-round flex-center"
                :style="{
                  background: 'rgba(0, 0, 0, 0.64)',
                }"
              >
                <c-image :src="icon_play_white" width="36rpx" height="36rpx" />
              </view>
            </view>
          </view>
        </c-col>
      </c-row>
      <view v-if="item.evaluateCount && item.evaluateCount > 0" class="pr-s lh-4 comment-area">
        <c-image :src="iconComment" width="26rpx" height="26rpx" />
        <view
          v-if="item.unReadCount && item.unReadCount > 0 && !isGuardian"
          class="unread-area bg-error"
        />
        <text class="font-secondary color-placeholder ml-xs"> {{ item.evaluateCount }} </text>
      </view>
    </view>
    <c-empty v-if="lists.length === 0" content="暂无数据" bg-type="fill-default" />
    <c-empty-line :need-safe-bottom="true" height="120rpx" />
  </view>
</template>

<script lang="ts" setup>
import { icon_play_white } from '@/app-preprimary-education/observation-record/utils/icon-play-white';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate, getPageParams } from '@/utils/tools';
import { computed, onBeforeMount } from 'vue';
import iconComment from '../../../static/image/comment_icon.png';
import { useTimeImpression } from '../../utils/use-time-impression';

interface IProps {
  list: any[];
}
const store = useTimeImpression();
// const lists = ref<any>([]);
const props = withDefaults(defineProps<IProps>(), {
  list: () => [],
});
const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;
const handleClickDetail = async (pic: any, id: string, updateTime: any) => {
  const studentId = store.studentData.studentsData.studentId;
  const params = getPageParams();
  console.log('studentId jump : ' + studentId);
  // 详情
  uni.navigateTo({
    url: `/app-preprimary-education/observation-record/view-picture-detail?id=${id}&updateTime=${updateTime}&studentId=${
      isGuardian || Number(params.isPortfolio || 0) ? params.id : studentId
    }`,
  });
};

const indicatorProjectColor = (id: string) => {
  switch (id) {
    case '4':
      return '#EBF8EA';
    case '5':
      return '#FFF6E7';
    case '6':
      return '#EDEEFE';
    case '7':
      return '#EBF8EA';
    case '8':
      return '#DEF2FF';
    case '9':
      return '#EDEEFE';
    case '10':
      return '#FFF6E7';
    default:
      return '#EBF8EA';
  }
};

const indicatorProjectTipsColor = (id: string) => {
  switch (id) {
    case '4':
      return '#47BC0F';
    case '5':
      return '#FFB738';
    case '6':
      return '#A5ABF7';
    case '7':
      return '#47BC0F';
    case '8':
      return '#5FB0E4';
    case '9':
      return '#A5ABF7';
    case '10':
      return '#FFB738';
    default:
      return '#47BC0F';
  }
};
const lists = computed(() => {
  return props.list;
});
onBeforeMount(() => {
  // console.log('🚀 ~ file: index.vue:64 ~ onBeforeMount ~ props.list:', props.list);
  // lists.value = props.list;
  // console.log('🚀 ~ file: index.vue:56 ~ onBeforeMount ~  list.value:', lists.value);
});
</script>
<style lang="scss" scoped>
.indicator-project {
  display: flex;
  flex-wrap: wrap;
  .project-name {
    border-radius: 12rpx;
    margin-right: 12rpx;
    margin-bottom: 12rpx;
  }
  .tips {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    margin-right: 10rpx;
  }
}
.comment-area {
  padding-top: 5px;
  display: flex;
  .unread-area {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    position: absolute;
    left: 36rpx;
    margin-bottom: 24rpx;
  }
}
</style>
