<template>
  <mt-page :title="title" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <view class="top-area">
      <view class="top-title mt-xl bold font-xxxt">{{ studentData.studentName }}的电子勋章</view>
      <view class="top-title font-title">
        {{ studentData.semester }}学年{{ studentData.term === 1 ? '上学期' : '下学期' }}
      </view>
      <view class="top-title font-title">{{ studentData.clazzName }}</view>
    </view>
    <c-card
      class-name="mlr-l mb-b "
      class="student-info-card"
      padding-type="b"
      radius-type="default"
    >
      <view class="flex-inline w100">
        <c-image
          :src="childHeaderImg(studentData.imageUrl || '', studentData.gender)"
          :width="100"
          :height="100"
          mode="aspectFit"
          icon-loading=""
          shape="circle"
        />
        <view class="ml-b flex w100">
          <c-image
            v-for="i in studentData?.crown"
            :key="`crown_${i}`"
            :src="iconCrown"
            :width="50"
            :height="50"
            mode="aspectFit"
            icon-loading=""
            bgColor="#fff"
          />
          <view v-for="i in studentData?.diamond" :key="`diam_${i}`" />
          <c-image
            v-for="i in studentData?.diamond"
            :key="`diamond_${i}`"
            :src="iconDiamond"
            :width="50"
            :height="50"
            mode="aspectFit"
            icon-loading=""
            bgColor="#fff"
          />
          <c-image
            v-for="i in studentData?.badge"
            :key="`badge_${i}`"
            :src="iconBadge"
            :width="50"
            :height="50"
            mode="aspectFit"
            icon-loading=""
            bgColor="#fff"
          />
          <c-image
            v-for="i in studentData?.star"
            :key="`star_${i}`"
            :src="iconStar"
            :width="50"
            :height="50"
            mode="aspectFit"
            icon-loading=""
            bgColor="#fff"
          />
        </view>
      </view>
    </c-card>

    <c-card class-name="mlr-l mb-b " class="" padding-type="l" radius-type="default">
      <view class="medal-card">
        <view v-for="category in categoryList" :key="category.id" class="cards">
          <view class="medal-card-title mb-s">{{ category.name }}</view>
          <view class="medal-card-grid">
            <view v-for="medal in category.medalInfoList" :key="medal.id">
              <view class="medal-icon-area ptb-s">
                <view :class="medal.isRecently ? 'medal-icon-animate' : 'medal-icon'">
                  <uni-badge
                    :text="medal.medalCount && medal.medalCount > 1 ? medal.medalCount : 0"
                    absolute="rightTop"
                    size="small"
                    :offset="[18, 12]"
                  >
                    <c-image
                      :width="150"
                      :height="150"
                      :src="medal.medalCount ? MEDAL_ACTIVE[medal.icon] : MEDAL_DEFAULT[medal.icon]"
                      :preview="false"
                      icon-loading=""
                      bgColor="#fafafa"
                    />
                  </uni-badge>
                </view>
                <view>{{ medal.name }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </c-card>
    <c-empty-line need-safe-bottom class-name="mtb-b" height="180rpx" />
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
  </mt-page>
  <c-modal
    v-model:show="showModal"
    :content="`鼓励一下，奖励给${studentData.studentName}一颗小星星~`"
    class-name="modal"
    @onConfirm="handleConfirmStar"
  />
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { childHeaderImg } from '@/app-preprimary-education/utils/tools';
import { getPageParams, showInfo } from '@/utils/tools';
import { onLoad, onShow } from '@dcloudio/uni-app';
import dayjs from 'dayjs';
import { computed, onBeforeMount, ref } from 'vue';
import bottomMedal from '../static/image/bottom-medal.png';
import bottomStar from '../static/image/bottom-star.png';
import iconBadge from '../static/image/icon_badge.png';
import iconCrown from '../static/image/icon_crown.png';
import iconDiamond from '../static/image/icon_diamond.png';
import iconStar from '../static/image/icon_star.png';
import { CategoryListItem, MEDAL_ACTIVE, MEDAL_DEFAULT } from './utils/constants';
import { getAllCategory, getStudentMedal, saveStarOrMedal } from './utils/service';

const title = computed(() => '电子勋章');
const showModal = ref(false);

/** 学生信息 */
const studentData = ref<any>({});

/** 当前学生id */
const currentId = ref<any>();

/** 勋章列表 */
const categoryList = ref<CategoryListItem[]>([]);

/** 点亮星星 */
const clickStar = () => {
  showModal.value = true;
};

/** 点亮勋章 - 跳转 */
const clickMedal = () => {
  uni.navigateTo({
    url: `/app-preprimary-education/electronic-medal/add-medal?studentId=${currentId.value}`,
  });
};

/** 获取勋章信息 */
const loadAllCategory = async () => {
  const res: any = await getAllCategory();
  categoryList.value = res;
};

/** 格式化展示勋章信息 */
const getMedalInfos = (medalInfos: any[]) => {
  const list = categoryList.value.map(category => {
    const newList = category.medalInfoList.map(item => {
      let medalCount = 0;
      let isRecently = false;
      medalInfos.forEach(one => {
        if (one.id === item.id) {
          medalCount = one.medalCount;
          if (dayjs(one.createTime).isAfter(dayjs().subtract(3, 'day').startOf('day')))
            isRecently = true;
        }
      });
      return { ...item, medalCount, isRecently };
    });
    return { ...category, medalInfoList: newList };
  });
  categoryList.value = list;
};

/** 获取学生勋章信息 */
const onLoadData = async () => {
  if (!currentId.value) return;
  const res: any = await getStudentMedal(currentId.value);
  studentData.value = res;
  getMedalInfos(res.medalInfos);
};

/** 赠送星星 */
const handleConfirmStar = async () => {
  try {
    await saveStarOrMedal({ studentIds: [studentData.value.studentId], medalType: 1 });
    showInfo('星星已经送给小朋友啦~');
  } catch (e: any) {
    showInfo(e?.desc);
  } finally {
    showModal.value = false;
    onLoadData();
  }
};

const init = async () => {
  await loadAllCategory();
  onLoadData();
};

onBeforeMount(() => {
  init();
});

onLoad(() => {
  const { studentId } = getPageParams();
  currentId.value = studentId;
});

onShow(() => {
  init();
});
</script>
<style lang="scss" scoped>
.top-area {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 340rpx;
  background: url(../static/image/bg_badge.png) no-repeat;
  background-size: 100% 100%;
  .top-title {
    color: #613400;
    margin-left: 40rpx;
  }
}
.student-info-card {
  :deep(.c-card) {
    margin-top: -100rpx;
  }
}
.medal-card {
  .medal-card-title {
    font-size: 15px;
    font-weight: bold;
  }
  .cards:nth-child(n + 2) {
    margin-top: 30rpx;
  }
  .medal-card-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 24rpx;
    grid-row-gap: 30rpx;
    .medal-icon-area {
      text-align: center;
      background-color: #fafafa;
      border-radius: 20rpx;
    }
    .medal-icon {
      display: flex;
      text-align: center;
      justify-content: center;
    }
    .medal-icon-animate {
      display: flex;
      text-align: center;
      justify-content: center;
      animation: medal-icon-animate 1s linear 1;
      animation-delay: 0.5s;
    }
    @keyframes medal-icon-animate {
      0% {
        transform: rotateY(0deg);
      }
      100% {
        transform: rotateY(360deg);
      }
    }
  }
}
</style>
