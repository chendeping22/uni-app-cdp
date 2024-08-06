<template>
  <view v-for="l in list" :key="l.id" class="comment-card">
    <view class="icon-64 mt-s no-shrink">
      <image :src="imgUrl(l)" class="icon-64 radius-round" />
    </view>
    <view class="ml-b w100">
      <imp-header :title="l.studentName" title-size="font-content">
        <template v-if="l.clockinDay > 0" #extra>
          <imp-space gap-size="small">
            <view v-if="l.clazzName" class="extra-text mr-s">{{ l.clazzName }}</view>
            <view class="extra-text mr-s">已坚持{{ l.clockinDay }}天</view>
          </imp-space>
        </template>
      </imp-header>
      <view class="color-base font-title text-pre"> {{ l.content }} </view>
      <imp-media :medias="l.mediaList" size="small" @videoData="videoDataEvent" />
      <view class="flex-between">
        <view class="color-secondary mt-b font-secondary">
          {{ formatDate(l.clockTime, 'YYYY-MM-DD hh:mm') }}
        </view>
        <view class="flex-inline mr-l color-base font-secondary">
          <view class="flex-inline" @click="clickComment(l)">
            <c-icon
              name="icon_message"
              size="34"
              :color-type="isComment[l.id] ? 'primary' : 'base'"
            />
            <view v-if="l.commentCount" class="icon-count">{{ l.commentCount }}</view>
          </view>
          <view class="flex-inline ml-b" @click="clickLike(l)">
            <c-icon
              v-show="heartShow[l.id]"
              name="icon_heart_fill"
              size="34"
              color-type="error"
              class="heart-icon"
            />
            <c-icon name="icon_like" size="34" :color-type="isLike[l.id] ? 'primary' : 'base'" />
            <view v-if="l.praiseCount" class="icon-count">{{ l.praiseCount }}</view>
          </view>
        </view>
      </view>
      <c-card
        class-name="mtb-b mr-l bg-fill-light"
        :hasShadow="false"
        radius-type="default"
        class="font-secondary"
        v-if="l.clockinRecordCommentList && l.clockinRecordCommentList.length"
      >
        <view
          v-for="(comment, index) in l.clockinRecordCommentList"
          :key="`${comment.id}_${comment.personId}`"
        >
          <view
            v-show="index < 3 || isShowAllComment[l.id]"
            class="color-base mb-xs font-secondary text-pre"
          >
            {{ comment.personName }}{{ comment.relationName }}： {{ comment.remark }}
          </view>
        </view>
        <view
          v-if="l.clockinRecordCommentList.length > 3"
          class="mt-s open-comment"
          @click="openOrCloseComment(l.id)"
        >
          <view v-if="isShowAllComment[l.id]">收起评论</view>
          <view v-else>展开{{ l.clockinRecordCommentList.length - 3 }}条评论</view>
        </view>
      </c-card>
    </view>
  </view>
  <c-empty
    v-if="!enabledView && loadingStatus === 1"
    bg-type="fill-light"
    content="老师设置打卡不可互看"
    :src="icon_default_lock"
    type="mini"
    className="radius-default"
  />
  <c-empty
    v-if="list.length === 0 && loadingStatus === 1"
    bg-type="fill-light"
    content="当日暂无打卡动态"
    type="mini"
    className="radius-default"
  />
</template>
<script lang="ts">
import Card from '@/app-preprimary-education/components/card/card.vue';
import ImpEmptyData from '@/app-preprimary-education/components/imp-empty-data/imp-empty-data.vue';
import ImpHeader from '@/app-preprimary-education/components/imp-header/imp-header.vue';
import ImpMedia from '@/app-preprimary-education/components/imp-media/imp-media.vue';
import ImpSpace from '@/app-preprimary-education/components/imp-space/imp-space.vue';
import { IClockinRecord, sendComments } from '@/app-preprimary-education/services/clock-in';
import profile_photo_boy from '@/app-preprimary-education/static/image/profile_photo_boy.png';
import profile_photo_girl from '@/app-preprimary-education/static/image/profile_photo_girl.png';
import icon_default_lock from '@/app-preprimary-education/static/svg/icon_default_lock.svg';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { loginStore } from '@/store/modules/login';
import { EUserType } from '@/utils/kind';
import { formatDate } from '@/utils/tools';
import { PropType, defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    list: { type: Array as PropType<IClockinRecord[]>, default: () => [] },
    enabledView: {
      type: Boolean,
      default: true,
    },
    loadingStatus: {
      type: Number, // 0-未查询, 1-已查询
      default: 0,
    },
    showCommentModal: {
      type: Boolean,
      default: false,
    },
    currentRecord: {
      type: Object,
      default: {},
    },
    isComment: {
      type: Object,
      default: {} as { [key: string]: boolean },
    },
  },
  components: { ImpEmptyData, Card, ImpHeader, ImpMedia, ImpSpace },
  emits: ['update:showCommentModal', 'update:currentRecord'],
  setup(props, { emit }) {
    const isTeacher = loginStore().currentUserType == EUserType.teacher;
    const isLike = ref<{ [key: string]: boolean }>({});
    const isShowAllComment = ref<{ [key: string]: boolean }>({});
    const heartShow = ref<{ [key: string]: boolean }>({});

    const imgUrl = (rcd: IClockinRecord) => {
      if (rcd.imgUrl) return transformImageUrl(rcd.imgUrl);
      else return rcd.gender === 2 ? profile_photo_girl : profile_photo_boy;
    };

    const openOrCloseComment = async (id: string) => {
      isShowAllComment.value = { ...isShowAllComment.value, [id]: !isShowAllComment.value[id] };
    };

    const clickComment = async (rcd: IClockinRecord) => {
      emit('update:showCommentModal', true);
      emit('update:currentRecord', rcd);
    };

    const clickLike = async (rcd: IClockinRecord) => {
      const params = {
        recordId: rcd.id,
        studentId: rcd.studentId,
        commentType: 0,
      };
      try {
        await sendComments(params, isTeacher);
      } catch (e) {}
      isLike.value = { ...isLike.value, [rcd.id]: true };
      heartShow.value = { ...heartShow.value, [rcd.id]: true };
      uni.$emit(isTeacher ? 'teacher-comment-or-like' : 'guardian-comment-or-like');
      setTimeout(() => {
        heartShow.value = { ...heartShow.value, [rcd.id]: false };
      }, 1000);
    };

    const videoDataEvent = (data: any) => {
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/video-detail?fileUrl=${data}`,
      });
    };

    return {
      icon_default_lock,
      imgUrl,
      formatDate,
      clickComment,
      clickLike,
      openOrCloseComment,
      videoDataEvent,
      isLike,
      isShowAllComment,
      heartShow,
    };
  },
});
</script>
<style scoped lang="scss">
.comment-card {
  margin-top: $ui-gap-large;
  margin-bottom: $ui-gap-xs;
  display: flex;
  .extra-text {
    padding: $ui-gap-xxs $ui-gap-xs;
    font-size: $ui-font-size-desc;
    color: $ui-color-primary;
    background: rgba($ui-color-primary, 0.1);
    border-radius: $ui-radius-small;
  }
}

.lock-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: $ui-gap-default 0;
  .lock-image {
    margin-right: $ui-gap-large;
    width: 72rpx;
    height: 62rpx;
  }
}
.icon-count {
  margin-left: 5rpx;
}
.open-comment {
  align-items: center;
  color: #176bfb;
}
.heart-icon {
  position: absolute;
  margin-bottom: 60rpx;
  animation: heart-icon-animate 1s linear 1;
  animation-fill-mode: forwards;
}

@keyframes heart-icon-animate {
  0% {
    margin-bottom: 60rpx;
    opacity: 1;
  }
  50% {
    margin-bottom: 90rpx;
    opacity: 0.5;
  }
  100% {
    margin-bottom: 120rpx;
    opacity: 0;
  }
}
</style>
