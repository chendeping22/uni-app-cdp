<template>
  <CustomPage title="选择模板" bg-type="white" class="choose-template">
    <c-refresh-scroll :fetch-data-func="fetchDataFunc" :show-no-more-tip="true">
      <view class="choose-template-wrapper">
        <view v-if="templateList.array.length" class="popular-template">
          <view class="title">
            <image :src="templateLeftIcon" class="icon" />
            热门打卡模板
            <image :src="templateRightIcon" class="icon" />
          </view>
          <view class="popular-template-content">
            <view
              v-for="(item, index) in templateList.array"
              :key="item.id"
              class="template-item"
              @click="handleNewTaskByTemplate(item.id)"
            >
              <image class="template-img" :src="transformImageUrl(item.imageFileUrl)" />
              <view class="template-name">{{ item.templateName || '/' }}</view>
              <view class="flex-inline">
                <c-image
                  v-if="index < 3 && item.hot > 0"
                  class="hot-icon"
                  :src="fireIcon"
                  width="24"
                  height="24"
                />
                <c-icon v-else name="icon_fire" color-type="placeholder" size="24" />
                <text class="color-placeholder font-secondary ml-xxs">{{ item.hot }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="add-btn">
          <u-button type="primary" class="custom-clockin" @click="handleNewTask">
            <c-icon name="icon_add" color="white" size="48" class-name="mr-xs" />
            自定义打卡
          </u-button>
        </view>
      </view>
    </c-refresh-scroll>
  </CustomPage>
</template>
<script lang="ts">
import ImpButton from '@/app-preprimary-education/components/imp-button/imp-button.vue';
import {
  IDataLoadType,
  IPager,
} from '@/app-preprimary-education/components/imp-refresh-scroll/imp-refresh-scroll.vue';
import CustomPage from '@/app-preprimary-education/components/page/page.vue';
import {
  ITemplateItem,
  getClockinTemplatePage,
  updateTemplateHot,
} from '@/app-preprimary-education/services/clock-in';
import templateLeftIcon from '@/app-preprimary-education/static/svg/template_left_icon.svg';
import templateRightIcon from '@/app-preprimary-education/static/svg/template_right_icon.svg';
import { transformImageUrl } from '@/app-preprimary-education/utils/tools';
import { defineComponent, onBeforeMount, reactive } from 'vue';
import fireIcon from '../../../../static/image/fire_icon.png';

export default defineComponent({
  components: { CustomPage, ImpButton },
  setup() {
    const templateList = reactive({ array: [] } as { array: ITemplateItem[] });

    const handleNewTask = () => {
      uni.navigateTo({
        url: '/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/index',
      });
    };

    const handleNewTaskByTemplate = async (id: number | string) => {
      await updateTemplateHot(id);
      uni.navigateTo({
        url: `/app-preprimary-education/clock-in/teacher/tasks/new-edit-tasks/index?templateId=${id}`,
      });
    };

    const fetchDataFunc = async (pager: IPager, type: IDataLoadType) => {
      const { pageSize, pageNum } = pager;
      const res = await getClockinTemplatePage({
        pageSize,
        pageNum,
        validStatus: 1,
      });
      if (type === 'new') templateList.array = [];
      templateList.array.push(...res.result);
      return res;
    };

    onBeforeMount(() => {});
    return {
      templateList,
      templateLeftIcon,
      templateRightIcon,
      fireIcon,
      handleNewTask,
      handleNewTaskByTemplate,
      fetchDataFunc,
      transformImageUrl,
    };
  },
});
</script>
<style lang="scss" scoped>
.choose-template {
  ::v-deep {
    .root-page.page-bg-white {
      background: $ui-color-fill-default;
    }
  }

  &-wrapper {
    min-height: calc(100vh - 224rpx);
    padding-top: $ui-gap-default;
  }
}
.custom-clockin {
  &-icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: $ui-gap-xxs * 2;
  }
}
.popular-template {
  background: #ffffff;
  margin: $ui-gap-default $ui-gap-large;
  padding: $ui-gap-large;
  border-radius: $ui-radius-xl;
  .title {
    font-size: $ui-font-size-xt;
    color: $ui-color-base;
    line-height: $ui-font-size-xxt;
    font-weight: $ui-font-weight-bold;
    text-align: center;
    .icon {
      width: 26rpx;
      height: 26rpx;
    }
  }
  &-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .template-item {
      width: calc(50% - 20rpx);
      margin-top: $ui-radius-xl;

      .heat {
        width: 20rpx;
        height: 24rpx;
      }
    }
    .template-img {
      width: 295rpx;
      height: 168rpx;
      border-radius: $ui-radius-large;
    }
    .template-name {
      font-size: $ui-font-size-title;
      color: $ui-color-base;
      font-weight: $ui-font-weight-bold;
      margin: $ui-gap-xs 0;
      @include ellipsis-some-line;
    }
    .template-hot {
      font-size: $ui-font-size-secondary;
      color: $ui-color-placeholder;
      line-height: $ui-font-size-content;
    }
  }
}
.hot-icon {
  line-height: 0;
  :deep(.u-image__image) {
    border-radius: 0 !important;
  }
}
.add-btn {
  padding: 0rpx 32rpx;
}
</style>
