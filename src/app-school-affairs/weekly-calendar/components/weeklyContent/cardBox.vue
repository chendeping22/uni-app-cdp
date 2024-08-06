<template>
  <view v-if="cardLists?.calendars && cardLists?.calendars.length">
    <view
      v-for="(item, index) in cardLists?.calendars"
      :key="index + Math.random()"
      :class="['card-box', getBg(item?.contentType)?.bgName, index != 0 ? 'martop' : '']"
      @click="openDetail(item)"
    >
      <view class="header-style">
        <view class="flex-style">
          <view
            v-if="item?.tagTypes && item?.tagTypes.length"
            :class="['logo', getTag(item?.tagTypes[0])?.colorName]"
          >
            {{ getTag(item?.tagTypes[0])?.name }}
          </view>
          <view class="time-style">
            {{ item?.startTime }}{{ item?.startTime && item?.endTime ? '~' : ''
            }}{{ item?.endTime }}
          </view>
        </view>
        <view
          v-if="item?.contentType != 4 && item?.contentType != 5"
          @click.stop="isShowMoreListEvent(item)"
        >
          <u-icon class="more-style" name="more-dot-fill"></u-icon>
        </view>
      </view>
      <view class="title-style">
        <view>
          {{ item?.content }}
        </view>
      </view>

      <!-- 事项地点 -->
      <view v-if="item?.place" class="place-style">
        <u-icon class="map-style" name="map" size="24"></u-icon>
        <view class="ellipsis-style">
          <view>{{ item?.place }}</view>
        </view>
      </view>
      <!-- 参加对象 -->
      <view
        v-if="(item?.joinObjs || item?.joinUsers) && item?.contentType != 4"
        class="place-style"
      >
        <view><image class="image-style" :src="svgSrc" /></view>
        <view>
          <view v-show="item?.joinObjs" class="ellipsis-style">
            <view>{{ item?.joinObjs }}</view>
          </view>
          <view v-show="item?.joinUsers" class="ellipsis-style">
            <view>
              {{ item?.joinUsers }}
            </view>
          </view>
        </view>
      </view>
      <!-- 负责部门 -->
      <view
        v-if="
          item?.responsibleDepts &&
          (item?.contentType == 1 || item?.contentType == 2 || item?.contentType == 3)
        "
        class="place-style"
      >
        <view><image class="image-style2" :src="depSvgSrc" /></view>
        <view class="ellipsis-style">
          <view>{{ item?.responsibleDepts }}</view>
        </view>
      </view>
      <!-- 负责人 -->
      <view v-if="item?.responsibleUsers" class="place-style">
        <u-icon class="map-style" name="account" size="24"></u-icon>
        <view class="ellipsis-style">
          <view>
            {{ item?.responsibleUsers }}
          </view>
        </view>
      </view>
    </view>
  </view>
  <view v-else>
    <view v-if="currentViewType" class="empty2">
      <view><image class="img-style" :src="imgSrc" /></view>
      <view class="empty-text">暂无数据</view>
    </view>
    <view v-else class="empty">暂无日程安排</view>
  </view>

  <u-action-sheet v-model="isShowMoreList" :list="list" @click="actionSheet"></u-action-sheet>
  <u-modal
    v-model="showCancelModal"
    :show-cancel-button="true"
    title="确定删除？"
    confirm-text="删除"
    @confirm="confirmEvent"
  >
    <view class="slot-content">
      {{
        `您确定删除"${currentData?.calendarDate} ${currentData?.startTime || ''}${
          currentData?.startTime && currentData?.endTime ? '~' : ''
        }${currentData?.endTime || ''}的日程事项:${currentData?.content}"吗？`
      }}
    </view>
  </u-modal>
  <DetailCard v-model:show-detail="showDetail" :detail-data="detailData" />
  <LogCard v-model:show-log="showLog" :log-data="logData" />
</template>
<script lang="ts" setup>
import { loginStore } from '@/store/modules/login';
import { getPageParams } from '@/utils/tools';
import { computed, onBeforeMount, ref, watch } from 'vue';
import svgSrc from '../../../static/Shape.svg';
import depSvgSrc from '../../../static/dep.svg';
import imgSrc from '../../../static/empty2.png';
import { deleteEvent, operationLog } from '../../services';
import DetailCard from '../detailCard/index.vue';
import LogCard from '../logCard/index.vue';
const emit = defineEmits(['updateCalendar', 'editItem']);
const props = defineProps({
  cardLists: {
    type: Array,
    default: () => [],
  },
  viewType: {
    type: Boolean,
  },
});
const cardLists = ref<any>();
const logData = ref<any>();
const userInfo = loginStore().userInfo;
const pageParams = ref();
watch(
  () => props.cardLists,
  val => {
    cardLists.value = val;
  },
  { immediate: true, deep: true },
);
const currentViewType = ref(props.viewType);
watch(
  () => props.viewType,
  val => {
    currentViewType.value = val;
  },
  { immediate: true, deep: true },
);
const showDetail = ref(false);
const showLog = ref(false);
const showCancelModal = ref(false);
const isShowMoreList = ref(false);
const list = ref([
  {
    text: '编辑',
  },
  {
    text: '删除',
  },
  {
    text: '日志',
  },
]);
const detailData = ref<any>();
const openDetail = (item: any) => {
  detailData.value = item;
  showDetail.value = true;
};
const confirmEvent = () => {
  deleteEvent(currentData.value.id).then(() => {
    emit('updateCalendar');
    uni.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 2000,
    });
  });
};
const currentData = ref<any>();
const isShowMoreListEvent = (item: any) => {
  currentData.value = item;
  // item?.canEdit == 1 || item?.canRemove == 1
  list.value = [
    item.canEdit == 1
      ? {
          text: '编辑',
        }
      : '',
    item.canEdit == 1
      ? {
          text: '删除',
        }
      : '',
    {
      text: '日志',
    },
  ];
  list.value = list.value.filter((item: any) => item !== '');
  isShowMoreList.value = true;
};
const actionSheet = (index: number) => {
  const item = list.value[index];
  if (item.text == '编辑') {
    emit('editItem', currentData.value);
  }
  if (item.text == '删除') {
    showCancelModal.value = true;
  }
  if (item.text == '日志') {
    showLog.value = true;
    const list = {
      appCode: 'weeklyCalendar',
      bizId: currentData.value.id,
    };
    operationLog(list).then(res => {
      logData.value = res;
    });
  }
};

const getBg = computed(() => (val: number) => {
  switch (val) {
    case 1:
      return {
        bgName: 'blue-line',
        linearBg: 'detail-blue',
        name: '单位日程',
      };
    case 2:
      return {
        bgName: 'green-line',
        linearBg: 'detail-green',
        name: '部门日程',
      };
    case 3:
      return {
        bgName: 'orange-line',
        linearBg: 'detail-orange',
        name: '个人日程',
      };
    case 4:
      return {
        bgName: 'red-line',
        linearBg: 'detail-red',
        name: '课程表',
      };
    case 5:
      return {
        bgName: 'purple-line',
        linearBg: 'detail-purple',
        name: '会议',
      };
  }
});
const getTag = computed(() => (val: number) => {
  const { userId, gender } = pageParams.value;
  const isSelf = (userId && userId === userInfo?.userId) || !userId ? true : false;

  switch (val) {
    case 1:
      return {
        colorName: 'orange-style',
        name: `${isSelf ? '个人' : gender === '1' ? '他的' : '她的'}日程`,
      };
    case 2:
      return {
        colorName: 'blue-style',
        name: `${isSelf ? '本' : gender === '1' ? '他' : '她'}部门负责${isSelf ? '' : '的'}`,
      };
    case 3:
      return {
        colorName: 'pink-style',
        name: `${isSelf ? '本人' : gender === '1' ? '他' : '她'}负责${isSelf ? '' : '的'}`,
      };
    case 4:
      return {
        colorName: 'green-style',
        name: `${isSelf ? '本人' : gender === '1' ? '他' : '她'}参与${isSelf ? '' : '的'}`,
      };
    case 5:
      return {
        colorName: 'red-style',
        name: '课程表',
      };
    case 6:
      return {
        colorName: 'purple-style',
        name: '会议',
      };
  }
});

onBeforeMount(() => {
  pageParams.value = getPageParams();
});
</script>
<style lang="scss" scoped>
.card-box {
  position: relative;
  width: 100%;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-sizing: border-box;
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 8rpx;
    height: 100%;
    content: '\200B';
    border-top-left-radius: 12rpx;
    border-bottom-left-radius: 12rpx;
  }
}
.header-style {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.blue-line {
  color: #1677ff;
  &::before {
    background-color: #1677ff;
  }
}
.green-line {
  color: #52c41a;
  &::before {
    background-color: #52c41acc;
  }
}
.orange-line {
  color: #fa8c16;
  &::before {
    background-color: #fa8c16cc;
  }
}
.red-line {
  color: #f5222d;
  &::before {
    background-color: #f5222dcc;
  }
}
.purple-line {
  color: #722ed1;
  &::before {
    background-color: #722ed1cc;
  }
}
.flex-style {
  display: flex;
  align-items: center;
}
.logo {
  width: fit-content;
  border-radius: 16rpx;
  padding: 4rpx 16rpx 4rpx 16rpx;
  height: 48rpx;
  font-size: 26rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16rpx;
}
.more-style {
  font-size: 36rpx;
  transform: rotate(90deg);
  color: #8c8c8c;
  position: relative;
}
// .more-box {
//   position: absolute;
//   top: 80rpx;
//   right: 0rpx;
//   padding: 0 20rpx;
//   border-radius: 8rpx;
//   border: 1px solid #f7f7f7;
//   color: #000;
//   background-color: #fff;
//   box-shadow: 2rpx 2rpx 20rpx rgba(0, 0, 0, 0.1);
// }
// .more-box-item {
//   width: 150rpx;
//   padding: 20rpx 0;
// }
// .more-bottom-border {
//   border-bottom: 1px solid #f7f7f7;
// }
.time-style {
  font-weight: 500;
  font-size: 32rpx;
}
.orange-style {
  border: 1px solid #ffd591;
  color: #fa8c16;
  background-color: #fff7e6;
}
.blue-style {
  border: 1px solid #91caff;
  color: #1677ff;
  background-color: #e6f4ff;
}
.pink-style {
  border: 1px solid #ffadd2;
  color: #eb2f96;
  background-color: #fff0f6;
}
.green-style {
  border: 1px solid #b7eb8f;
  color: #52c41a;
  background-color: #f6ffed;
}
.red-style {
  border: 1px solid #ffa39e;
  color: #f5222d;
  background-color: #fff1f0;
}
.purple-style {
  border: 1px solid #d3adf7;
  color: #722ed1;
  background-color: #f9f0ff;
}
.title-style {
  width: 100%;
  margin-top: 20rpx;
  font-size: 32rpx;
  font-weight: 400;
  color: #000;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.place-style {
  display: flex;
  align-items: flex-start;
  margin-top: 24rpx;
  font-size: 30rpx;
  font-weight: 400;
  color: #8c8c8c;
}
.ellipsis-style {
  font-size: 26rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.map-style {
  margin: 7rpx 10rpx 0 0;
}
.share-style {
  margin: 10rpx 10rpx 0 0;
  transform: rotate(90deg);
}
.image-style {
  width: 24rpx;
  height: 24rpx;
  margin: 6rpx 10rpx 0 0;
}
.image-style2 {
  width: 21rpx;
  height: 21rpx;
  margin: 0 10rpx 2rpx 0;
}
.slot-content {
  padding: 16rpx 48rpx 48rpx;
  font-size: 30rpx;
  color: #6d6d6d;
  text-align: center;
}
.martop {
  margin-top: 24rpx;
}
.empty {
  display: flex;
  justify-content: center;
  padding: 24rpx 0;
  background-color: #fff;
  margin-top: 20rpx;
  border-radius: 8rpx;
  color: #8c8c8c;
}
.empty2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30%;
  .img-style {
    width: 144rpx;
    height: 174rpx;
  }
  .empty-text {
    font-size: 32rpx;
    color: #959595;
  }
}
</style>
