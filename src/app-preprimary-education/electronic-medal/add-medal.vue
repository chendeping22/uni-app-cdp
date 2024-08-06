<template>
  <mt-page :title="title" theme="default" :show-top-gap="false">
    <view class="page-padding">
      <view v-if="!currentId" class="setting" @click="openSelect">
        <view class="setting-item">
          <view class="setting-item-prefix">
            <text class="mr-s" style="color: red">*</text>
            <text>奖励对象</text>
          </view>
          <view class="setting-item-btn flex">
            <text class="point-name"> {{ studentNames }}</text>
            <text v-if="studentsLength > 2"> 等{{ studentsLength }}人</text>
            <c-icon name="icon_arrow_right" size="48"></c-icon>
          </view>
        </view>
      </view>
      <c-card class-name="mtb-b " class="" padding-type="l" radius-type="default">
        <view class="medal-card">
          <view v-for="category in categoryList" :key="category.id" class="cards">
            <view class="medal-card-title mb-s">{{ category.name }}</view>
            <view class="medal-card-grid">
              <view v-for="medal in category.medalInfoList" :key="medal.id">
                <view
                  :class="[
                    selectMedals.includes(medal.id) ? 'medal-icon-area-select' : 'medal-icon-area',
                    'ptb-s',
                  ]"
                  @click="() => handleSelectMedal(medal.id)"
                >
                  <view class="medal-icon">
                    <c-image
                      :width="150"
                      :height="150"
                      :src="MEDAL_ACTIVE[medal.icon]"
                      :preview="false"
                      icon-loading=""
                      bgColor="#fafafa"
                    />
                  </view>
                  <view>{{ medal.name }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </c-card>
    </view>
    <c-bottom>
      <u-button type="primary" @click="handleSubmit"> 确认 </u-button>
    </c-bottom>
  </mt-page>
  <c-select
    v-model:show="isOpen"
    v-model:list="list"
    :auto-close-after-select="false"
    :show-check-icon="true"
    multiple
    :mask-close-able="false"
    title="选择学生"
    title-type="text"
    @onConfirm="handleConfirm"
  />
</template>
<script lang="ts" setup>
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { getPageParams, showInfo } from '@/utils/tools';
import { onLoad } from '@dcloudio/uni-app';
import { computed, onBeforeMount, ref, toRefs } from 'vue';
import { CategoryListItem, MEDAL_ACTIVE } from './utils/constants';
import { getAllCategory, saveStarOrMedal } from './utils/service';
import { useTimeImpression } from './utils/use-electronic-medal';

const title = computed(() => '点亮勋章');
const isOpen = ref(false);
const totalPerson = ref(0);
const currentId = ref('');
const list = ref<any>([]);
const studentList = ref<any>([]);
const studentNames = ref('请选择');

const studentsLength = ref(0);

const store = useTimeImpression();
const { curClazz } = toRefs(store);

/** 勋章列表 */
const categoryList = ref<CategoryListItem[]>([]);

/** 选中的勋章id */
const selectMedals = ref<any>([]);

/** 获取勋章信息 */
const loadAllCategory = async () => {
  const res: any = await getAllCategory();
  categoryList.value = res;
};

/** 选择勋章 */
const handleSelectMedal = (id: any) => {
  if (selectMedals.value.includes(id)) {
    const index = selectMedals.value.indexOf(id);
    selectMedals.value.splice(index, 1);
  } else selectMedals.value.push(id);
};

const fetchDataFunc = async () => {
  const data = await store.homePage.getHomeList(curClazz.value.clazzId);
  return data;
};

/** 获取学生弹窗列表 */
const init = () => {
  if (currentId.value) {
    studentList.value = [currentId.value];
    return;
  }
  fetchDataFunc().then(res => {
    list.value = res.map((item: any, index: number) => {
      return {
        text: item.studentName,
        checked: false,
        disabled: false,
        id: item.studentId,
      };
    });
  });
};

/** 奖励对象名称 */
const getStudentNames = (data: any) => {
  if (data.length > 0) {
    studentNames.value = data
      .map((item: any) => item.text)
      .filter((one: any, index: number) => index < 2)
      .join('，');
    studentsLength.value = data.length;
  } else {
    studentNames.value = '请选择';
    studentsLength.value = 0;
  }
};

onLoad(() => {
  const { studentId } = getPageParams();
  currentId.value = studentId;
});

/** 打开选择学生列表 */
const openSelect = () => {
  isOpen.value = true;
};

/** 确认选择学生 */
const handleConfirm = (inx: any) => {
  const data = list.value.filter((item: any, index: any) => {
    return inx.includes(index);
  });
  studentList.value = data.map((item: any) => {
    return item.id;
  });
  getStudentNames(data);
  totalPerson.value = studentList.value.length;
  isOpen.value = false;
};

/** 保存 - 赠送勋章 */
const handleSubmit = async () => {
  if (!studentList.value.length) {
    uni.showToast({
      title: '请选择奖励对象',
      icon: 'none',
      duration: 2000,
    });
    return;
  }
  if (!selectMedals.value.length) {
    uni.showToast({
      title: '请选择勋章',
      icon: 'none',
      duration: 2000,
    });
    return;
  }
  try {
    await saveStarOrMedal({
      studentIds: studentList.value,
      medalType: 2,
      medalIds: selectMedals.value,
    });
    showInfo('电子勋章已送出~');
    uni.navigateBack();
  } catch (e: any) {
    showInfo(e?.desc);
  } finally {
  }
};

onBeforeMount(() => {
  loadAllCategory();
  init();
});
</script>
<style lang="scss" scoped>
.page-padding {
  padding: 0 32rpx 200rpx 32rpx;
  .setting {
    margin-top: 24rpx;
    background: #ffffff;
    border-radius: 12rpx;
    padding: 0 33rpx;
    &-item {
      height: 88rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &-title {
        font-size: 30rpx;
        color: #1d2129;
        text-align: left;
        line-height: 48rpx;
        font-weight: 400;
      }
      &-btn {
        font-size: 30rpx;
        color: #86909b;
        text-align: right;
        line-height: 48rpx;
        font-weight: 400;
      }
    }
  }
  .point-name {
    width: 330rpx;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow: hidden;
    white-space: nowrap;
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
    .medal-icon-area-select {
      text-align: center;
      background-color: #bae0ff;
      border-radius: 20rpx;
    }
    .medal-icon {
      display: flex;
      text-align: center;
      justify-content: center;
    }
  }
}
</style>
