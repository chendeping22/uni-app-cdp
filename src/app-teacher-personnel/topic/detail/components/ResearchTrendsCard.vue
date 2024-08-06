<template>
  <view>
    <view class="filters-wrap">
      <view v-if="showIsOnlyMe" class="radio-wrap">
        <u-checkbox v-model="isOnlyMine" shape="circle"
          ><text :style="{ marginLeft: '-0.5rem' }">只看我的</text></u-checkbox
        ></view
      >
      <view class="stage-wrap" @click="showActionSheet = true">
        <SelectActionSheet v-model="activeKey" :options="stageEnum"></SelectActionSheet>
      </view>
    </view>
    <view class="tags-wrap">
      <view
        v-for="tag in tags"
        :key="tag"
        :class="['tag', { active: activeTag === tag }]"
        @click="activeTag = tag"
        >{{ tag }}({{ getTagCount(tag) }})</view
      >
    </view>
    <view class="list-wrap">
      <view v-if="!list.length" class="card">
        <u-empty-custom />
      </view>
      <view v-for="item in list" :key="item.id" class="card">
        <view class="header">
          <view class="title">
            <text class="time">{{ formatDate(item.createTime, 'YYYY-MM-DD hh:mm') }}</text>
            <text class="name">{{ item.creator }}</text>
          </view>
          <view
            v-if="
              (item.createBy === userInfo?.id || isCompere) &&
              topic?.stage !== 5 &&
              !isAdminRoleView
            "
            class="actions"
          >
            <SelectActionSheet
              :options="[
                { label: '编辑', value: 'edit' },
                { label: '删除', value: 'delete' },
              ]"
              @change="handleAction($event, item)"
            >
              <template #button="scope">
                <u-icon
                  color="#00000073"
                  :size="26"
                  name="more-dot-fill"
                  @click="scope.handleClickButton()"
                ></u-icon>
              </template>
            </SelectActionSheet>
          </view>
        </view>
        <view v-if="item.trend" class="tags">
          <Tag class="tag" :text="item.trend" color="blue" />
        </view>
        <view>
          <!-- 多个 u-parse 的内容会一起渲染到第一各 parse 上，百思不得其解 -->
          <!-- <u-parse :html="item.content"></u-parse> -->
          <rich-text :nodes="item.content"></rich-text>
          <UploadFile
            v-if="item.attachmentList?.length"
            disabled
            :default-file-list="getFileList(item)"
          ></UploadFile>
        </view>
      </view>
      <view
        v-if="addPermission && !isAdminRoleView"
        class="card add-btn"
        @click="toResearchTrendsPage()"
      >
        <u-icon name="plus" :size="36"></u-icon>
        <text class="btn-text">添加研究动态</text>
      </view>
    </view>
  </view>
  <Confirm ref="confirmRef"></Confirm>
</template>
<script setup lang="ts">
import Tag from '@/app-teacher-personnel/topic/components/Tag/index.vue';
import { loginStore } from '@/store/modules/login';
import { formatDate, isEdu as getIsEdu } from '@/utils/tools';
import { filter, find, isNil, map, some } from 'lodash-es';
import { PropType, computed, reactive, ref, watch } from 'vue';
import { deleteTrend } from '../../api/topicInfo';
import SelectActionSheet from '../../components/SelectActionSheet/index.vue';
import Confirm from '../../components/confirm/index.vue';
import UploadFile from '../../components/upload/UploadFile.vue';
import { stageEnum as _stageEnum } from '../../helper/enum';

const props = defineProps({
  topic: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  isAdminRoleView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'reload'): void;
}>();

const confirmRef = ref<InstanceType<typeof Confirm>>();

const isEdu = getIsEdu();
const store = loginStore();

const { userInfo } = store;
const isCompere = computed(() => {
  return props.topic?.compere?.userId === userInfo?.id;
});
const isMember = computed(() =>
  some(props.topic?.members, one => {
    return one.userId === userInfo?.id;
  }),
);

const showIsOnlyMe = computed(() => {
  return !isEdu && (isCompere.value || isMember.value);
});
const isOnlyMine = ref(false);

const showActionSheet = ref(false);
const activeKey = ref(props.topic.stage || 1);
const stageEnum = filter(_stageEnum, (s: any) => {
  return s.value <= 4;
});
const stop = watch(
  () => props.topic.stage,
  val => {
    if (!isNil(val)) {
      const v = val === 5 ? 4 : val;
      activeKey.value = v;
      stop();
    }
  },
  { immediate: true },
);

const activeTags = reactive<Record<string, string>>({});
const activeTag = computed({
  get: () => {
    return activeTags[activeKey.value] || '全部';
  },
  set: (val: string) => {
    activeTags[activeKey.value] = val;
  },
});

const tags = computed(() => {
  const trends = find(props.topic?.trendItems, one => one.stage === activeKey.value)?.trends || [];
  return ['全部', ...trends];
});

const list = computed(() => {
  const _list = filter(
    props.topic?.trendContents,
    one =>
      one.stage === activeKey.value &&
      (one.trend === activeTag.value || activeTag.value === '全部') &&
      (!isOnlyMine.value || one.createBy === userInfo?.id),
  );

  return _list;
});

const addPermission = computed(() => {
  return (
    props.topic?.declareStatus !== 6 &&
    props.topic?.stage !== 5 &&
    (isCompere.value || isMember.value)
  );
});

const getFileList = (item: any) => {
  return map(item.attachmentList, a => ({
    fileId: a.fileId,
    name: a.fileName,
    url: a.fileUrl,
  }));
};

function getTagCount(tag: string) {
  const temp = filter(
    props.topic?.trendContents,
    one =>
      one.stage === activeKey.value &&
      (tag === '全部' || one.trend === tag) &&
      (!isOnlyMine.value || one.createBy === userInfo?.id),
  );
  return temp?.length || 0;
}

const toResearchTrendsPage = (contentId?: string) => {
  let url = `/app-teacher-personnel/topic/detail/ResearchTrends?id=${props.topic.id}`;
  if (contentId) {
    url += `&contentId=${contentId}`;
  }
  uni.navigateTo({
    url,
    events: {
      reload: () => {
        emit('reload');
      },
    },
  });
};

async function deleteHandle(id: string) {
  if (
    !(await confirmRef.value?.confirm({
      title: '',
      content: '是否确认删除',
    }))
  ) {
    return;
  }
  await deleteTrend(id);
  // message.success('删除成功');
  emit('reload');
}

const handleAction = (type: string, item: any) => {
  console.log('...... > handleAction > type:', type, item);
  switch (type) {
    case 'delete':
      return deleteHandle(item.id);
    case 'edit':
      return toResearchTrendsPage(item.id);
  }
};
</script>
<style lang="scss" scoped>
.filters-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.radio-wrap {
  flex: 1 1 50%;
}
.stage-wrap {
  height: 68rpx;
  border-radius: 16rpx;
  background: #0000000a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 50%;
}
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8rpx;
  .tag {
    height: 64rpx;
    background-color: #0000000a;
    color: #000000a6;
    font-size: 26rpx;
    font-weight: 500;
    line-height: 36rpx;
    margin-right: 16rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    flex: none;
    padding: 0 32rpx;
    margin-bottom: 16rpx;
    &.active {
      background-color: #1677ff;
      color: #fff;
    }
  }
}
.card {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 24rpx 32rpx;
  &:not(:last-child) {
    margin-bottom: 24rpx;
  }
  .header {
    margin-bottom: 8rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: 30rpx;
    line-height: 40rpx;
    color: #000000a6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .time {
      margin-inline-end: 8rpx;
      white-space: nowrap;
    }
    .name {
      white-space: nowrap;
    }
  }
  .actions {
    flex: none;
  }
  .tags {
    margin-bottom: 24rpx;
    .tag {
      margin-right: 16rpx;
    }
  }
  :deep(.rich-text-image) {
    max-width: 100%;
    height: auto;
  }
}
.add-btn {
  color: #1677ff;
  align-items: center;
  justify-content: center;
  display: flex;
  .btn-text {
    font-size: 32rpx;
    margin-left: 20rpx;
  }
}
</style>
