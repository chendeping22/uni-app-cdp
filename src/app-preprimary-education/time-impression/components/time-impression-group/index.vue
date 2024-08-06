<template>
  <view :class="[className, 'pr-s pl-s mt-l']">
    <view>
      <view v-for="(list, index) in timeList" :key="`time_${index}`" class="pr-s mt-s">
        <view class="circle-point" />
        <view class="time-line">
          <view>
            <text class="font-content color-placeholder bold">
              {{ formatDate(list.uploadDate) }}({{ list.count }}张)
            </text>
            <text
              v-for="(label, inx) in list.labels"
              :key="`creator_${inx}`"
              :class="[
                'plr-s ml-s creator-name',
                label === '家长'
                  ? 'bg-primary-light-3 color-primary'
                  : 'bg-warnning-light-3 color-warnning',
              ]"
            >
              {{ label }}
            </text>
          </view>
          <view v-for="(item, inx) in list.resourceGroups" :key="`resource_${inx}`">
            <view v-if="!isNil(item.remark) || item.remark === ''" class="pr-s pt-s">
              <text class="font-content"> {{ item.remark }} </text>
            </view>
            <c-row :row-gutter="16" :gutter="16">
              <c-col v-for="pic in item.resourceList" :key="pic.resourceId" :span="6">
                <view class="relative flex-center icon-160" @click="handleClickDetail(pic)">
                  <view v-if="isBatchCheck" class="absolute icon-160 radius-default">
                    <view
                      v-if="pic.pushed === 1 && !isGuardian"
                      class="absolute icon-160 flex-center flex-bottom radius-default"
                      :style="{
                        background: 'rgba(0, 0, 0, 0.25)',
                      }"
                    >
                      <text class="color-white">已推送</text>
                    </view>
                    <view class="absolute" style="left: 12rpx; top: 12rpx">
                      <c-checkbox
                        v-if="isBatchCheck"
                        :value="curSelects.some(t => t.resourceId === pic.resourceId)"
                        @change="handleCheck(pic)"
                      />
                    </view>
                  </view>
                  <img
                    v-if="pic.resourceType === 2"
                    class="icon-160 flex-center radius-default bg-deep"
                    :src="pic.videoSnapshotURL"
                  />
                  <c-image
                    v-else
                    :src="pic.thumbnailURL || pic.resourceURL"
                    width="160rpx"
                    height="160rpx"
                  />
                  <view
                    v-if="pic.resourceType === 2"
                    class="absolute icon-160 flex-center radius-default"
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
            <view
              v-if="item.evaluateCount && item.evaluateCount > 0"
              class="pr-s lh-4 comment-area"
            >
              <c-image :src="iconComment" width="26rpx" height="26rpx" />
              <view
                v-if="item.unReadCount && item.unReadCount > 0 && !isGuardian"
                class="unread-area bg-error"
              />
              <text class="font-secondary color-placeholder ml-xs"> {{ item.evaluateCount }} </text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <c-empty v-if="timeList.length === 0" content="暂无数据" bg-type="fill-default" />
    <c-empty-line :need-safe-bottom="true" height="120rpx" />
  </view>
</template>

<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate } from '@/utils/tools';
import { isNil } from 'lodash-es';
import { toRefs } from 'vue';
import { icon_play_white } from '../../../assets/icon-play-white';
import iconComment from '../../../static/image/comment_icon.png';
import { IPageType } from '../../utils/constants';
import { IGetSourceDetail, IresourceList } from '../../utils/service';
import { useTimeImpression } from '../../utils/use-time-impression';

interface IProps {
  className?: string | string[];
  isBatchCheck: boolean;
  type: IPageType;
  taskId?: string;
  studentId?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  className: '',
  isBatchCheck: false,
  type: 'timeset',
  taskId: '',
  studentId: '',
});

const store = useTimeImpression();
const { timeList, curSelects } = toRefs(store.viewPicturePage);
const loginSt = loginStore();
const isGuardian = EUserType.teacher !== loginSt.currentUserType;

const handleCheck = (pic: IresourceList) => {
  if (curSelects.value.some(t => t.resourceId === pic.resourceId)) {
    const tmp = curSelects.value.filter(t => t.resourceId !== pic.resourceId);
    store.viewPicturePage.updateCurSelects(tmp);
  } else {
    store.viewPicturePage.updateCurSelects([...curSelects.value, pic]);
  }
};

const handleClickDetail = (pic: IresourceList) => {
  if (props.isBatchCheck) {
    handleCheck(pic);
  } else {
    // 详情
    store.sourceDetailPage.detail = {} as IGetSourceDetail;
    uni.navigateTo({
      url: `/app-preprimary-education/time-impression/view-picture-detail?id=${pic.resourceId}&type=${props.type}&taskId=${props.taskId}&relId=${pic.resourceRelId}&studentId=${props.studentId}&uploadDate=${pic.uploadDate}`,
    });
  }
};
</script>
<style lang="scss" scoped>
.time-line {
  border-left: 1px dashed $ui-color-primary !important;
  margin-left: 17rpx;
  padding-left: 24rpx;
}
.circle-point {
  border-radius: 15rpx;
  position: absolute;
  height: 36rpx;
  width: 36rpx;
  background: url(../../../static/image/time_icon.png) $ui-color-white no-repeat;
  background-size: 100% 100%;
}
.comment-area {
  padding-top: 5px;
  display: flex;
  .unread-area {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    position: absolute;
    left: 72rpx;
    margin-bottom: 24rpx;
  }
}
.creator-name {
  border-radius: 12rpx;
}
</style>
