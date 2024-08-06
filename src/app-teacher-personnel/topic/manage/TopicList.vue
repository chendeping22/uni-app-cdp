<template>
  <view v-if="list?.length === 0" style="padding: 48rpx 0 0 0">
    <u-empty-custom :icon-size="144" />
  </view>
  <view v-else class="topic-list">
    <u-collapse
      ref="collapseRef"
      event-type="close"
      arrow
      accordion="false"
      :head-style="{
        borderBottom: '1rpx solid #0000000F',
        marginLeft: '32rpx',
      }"
    >
      <u-collapse-item
        v-for="(item, key, index) in listMap"
        :key="key"
        :index="index"
        :open="index === 0"
      >
        <template #title>
          <view class="member-title">
            <!-- <u-image class="memb er-icon" width="48rpx" height="48rpx" :src="avatarDefault"></u-image> -->
            <text class="member-name">{{ key }}({{ item?.length ?? 0 }})</text>
          </view>
        </template>
        <view v-if="item?.length === 0" style="padding: 48rpx 0">
          <u-empty-custom :icon-size="144" />
        </view>
        <view v-else class="collapse-list">
          <view v-for="one in item" :key="one.id" class="collapse-item" @click="handleDetail(one)">
            <view class="title">
              {{ one.name }}
            </view>
            <view class="desc flex-between">
              <view class="left flex">
                <u-image
                  class="memb er-icon"
                  width="40rpx"
                  height="40rpx"
                  :src="avatarDefault"
                ></u-image>
                <text style="margin-left: 8rpx">{{ one.compereName }}</text>
              </view>
              <view v-if="stage == 1" class="right">
                <DeclareStatusTag :declare-status="one.declareStatus" />
              </view>
              <view v-if="stage == 2" class="right">
                <text class="txt">论证材料</text> {{ one.materials }}
              </view>
              <view v-if="stage == 3" class="right">
                <AuthenticateStatusTag :authenticate-status="one.checkStatus" />
                <text class="txt">中期材料</text> {{ one.materials }}
              </view>
              <view v-if="stage == 4" class="right"
                ><AuthenticateStatusTag :authenticate-status="one.authenticateStatus" />
                <text class="txt">结题材料</text>
                {{ one.materials }}
              </view>
            </view>
          </view>
        </view>
      </u-collapse-item>
    </u-collapse>
  </view>
</template>
<script lang="ts" setup>
import { queryPage } from '@/app-teacher-personnel/topic/api/topicInfo';
import AuthenticateStatusTag from '@/app-teacher-personnel/topic/components/AuthenticateStatusTag/index.vue';
import DeclareStatusTag from '@/app-teacher-personnel/topic/components/DeclareStatusTag/index.vue';
import avatarDefault from '@/static/avatar.png';
import { groupBy } from 'lodash-es';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

//传参
const props = defineProps({
  stage: {
    type: Number,
    default: 0,
  },
  id: {
    type: String,
    default: '',
  },
  batchLevel: {
    type: Number,
    default: 5,
  },
});

const list = ref([]);
const listMap = ref<Record<string, any[]>>({});
const collapseRef = ref();

//获取详情
const fetchList = async () => {
  // 也是能解决collapse高度问题，但是每次会闪一下，不建议
  // list.value = [];
  // listMap.value = {};
  try {
    const res = await queryPage({
      batchId: props.id,
      stage: props.stage,
      pageNum: 1,
      pageSize: 1000,
      pageSource: 2,
    });

    list.value = res?.result || [];
    listMap.value = groupBy(res?.result, 'locationName');
    collapseRef?.value?.init();
    // 已立项个数和总个数，只有开题论证有这个概念
    if (props.stage === 1) {
      uni.$emit('manageDetailCount', {
        all: res?.total,
        already: res?.result?.filter((item: any) => item.declareStatus == 3)?.length || 0,
      });
    } else {
      const res1 = await queryPage({
        batchId: props.id,
        stage: 1,
        pageNum: 1,
        pageSize: 1000,
        pageSource: 2,
      });
      uni.$emit('manageDetailCount', {
        all: res1?.total,
        already: res1?.result?.filter((item: any) => item.declareStatus == 3)?.length || 0,
      });
    }
  } catch (error) {}
};

function handleDetail(item) {
  // hideDeletedButton：课题被删除的前提下，1.消息中心进来没有这个值，展示按钮（去列表的） 2.这里进入有这个值，不展示按钮（去列表的）
  // type：消息推送的url有这个。这里作用：比如我作为管理员，我去申报了课题，1.那如果我从课题管理进入，我只能驳回/通过 2.如果我从我的课题进入，那我只能撤回/修改成员
  uni.navigateTo({
    url: `/app-teacher-personnel/topic/detail/index?id=${item.id}&hideDeletedButton=1&type=manage`,
  });
}

// 初始化
onMounted(() => {
  // if (props.pn != undefined && props.pn != '') {
  //   let page = { current: props.pn, pageSize: 5 };
  //   handleTableChangeFinal(page);
  // } else {
  //   fetchList();
  // }
  fetchList();
  uni.$on('topicDetailModified', fetchList);
});

onBeforeUnmount(() => {
  uni.$off('topicDetailModified', fetchList);
});

watch(
  () => props.stage,
  () => {
    fetchList();
  },
);
</script>

<style scoped lang="scss">
.topic-list {
  background-color: #fff;
  border-radius: $radius-base;
  .member-name {
    @include body-regular;
  }
  .collapse-list {
    padding: 0 0 0 px2rpx(16);
  }
  .collapse-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: #fff;
    border-bottom: 1rpx solid #0000000f;
    padding: px2rpx(12) px2rpx(16) px2rpx(12) 0;
    .title {
      @include subheadline-regular;
      color: rgba($color-text-base, 0.88);
      word-break: break-all;
    }
    .desc {
      margin-top: px2rpx(4);
      .left {
        @include footnote-regular;
        color: rgba($color-text-base, 0.65);
      }
      .right {
        flex: none;
        @include footnote-regular;
        color: rgba($color-text-base, 0.45);
        .txt {
          margin-left: px2rpx(10);
        }
      }
    }
  }
}
</style>
