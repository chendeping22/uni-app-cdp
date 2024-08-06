<template>
  <mt-page title="观察要点" theme="default" :show-top-gap="false" :show-bottom-gap="false">
    <c-top height="88rpx">
      <view class="tab-header">
        <u-tabs
          v-if="isShowTab"
          v-model="current"
          :list="treeData"
          :is-scroll="true"
          bg-color="white"
          :active-color="primaryColor"
          @change="onChange"
        />
      </view>
    </c-top>

    <view class="mt-s flex">
      <view class="leftBox">
        <view
          v-for="(item, index) in currentLeftData"
          :key="index"
          :class="[currentLeftActiveIndex == index ? 'active' : null, 'leftTab']"
          @click="leftClick(item, index)"
        >
          <view class="title_header flex-between">
            <view>{{ item.name?.split('：')[0] }}</view>
            <view class="color-blue-dark-1">{{ item.currentLevel || item.level }}</view>
          </view>
          <view class="title_content">{{ item.name?.split('：')[1] }}</view>
        </view>
      </view>
      <view class="rightBox">
        <view
          v-for="(item, index) in currentRightData"
          :key="index"
          :class="[item.checked ? 'activeRight' : null, 'rightTab']"
          @click.stop="rightClick(item, index)"
        >
          <view class="title_header flex-between">
            <view class="leftContent">{{ item.level }}.{{ item.name }}</view>
            <view class="rightContent" @click.stop="showTipEvent(item)">
              <c-icon
                :class="[item.checked ? 'color-blue-dark-1' : 'color-placeholder', 'rightContent']"
                name="icon_state_info"
                size="40"
              />
            </view>
          </view>
        </view>
      </view>
    </view>
    <imp-bottom>
      <view class="plr-l">
        <u-button type="primary" @click="hanldeSubmit">确定</u-button>
      </view>
    </imp-bottom>
  </mt-page>
  <c-modal v-model:show="showTip" title="" :has-cancel="false" confirm-text="关闭">
    <view class="font-content">
      <view>解析：</view>
      <view class="color-placeholder mt-s">{{ tipContent.remark }}</view>
    </view>
    <view class="font-content mt-l">
      <view>观察举例：</view>
      <view class="color-placeholder mt-s">{{ tipContent.example }}</view>
    </view>
  </c-modal>
</template>
<script lang="ts" setup>
import impBottom from '@/app-preprimary-education/components/imp-bottom/imp-bottom.vue';
import mtPage from '@/app-preprimary-education/components/mt-page/mt-page.vue';
import { getPrimaryColor } from '@/styles/theme/get-config-color';
import { onBeforeMount, ref } from 'vue';
import { findTree } from './utils/service';
import { useTimeImpression } from './utils/use-time-impression';

const store = useTimeImpression();
let tabList: any[] = [];
const current = ref(0);
const showTip = ref(false);
const isShowTab = ref(true);
const tipContent = ref<any>([]);
/**原始树数据 */
const treeData = ref<any>([]);
/**左边内容原始数据 */
const currentLeftData = ref<any>([]);
/**右边内容原始数据 */
const currentRightData = ref<any>([]);
/**左边选择中index */
const currentLeftActiveIndex = ref<number>(0);
/**左边选择中index */
const currentRightActiveIndex = ref<number | null>(null);
// 获取主题色
const primaryColor = getPrimaryColor();
/**获取原始树数据 */
const getTreeData = async () => {
  if (store.PointsOfObservationData.treeDataSave.length) {
    treeData.value = store.PointsOfObservationData.treeDataSave;
    tabList = store.PointsOfObservationData.tabList;
  } else {
    const res: any = await findTree();
    treeData.value = res;
    res?.forEach((item: { name: any }) => {
      tabList.push(item.name);
    });
  }

  //默认选中第一个
  getCurrentLeftData(0);
  backFill();
};

const onChange = (index: number) => {
  current.value = index;
  getCurrentLeftData(index);
};

/** 获取当前左边数据*/
const getCurrentLeftData = (val: number) => {
  currentLeftData.value = treeData.value[val].childs;
  //默认选择左边第一项
  leftClick(currentLeftData.value[0], 0);
};

const showTipEvent = (data: any) => {
  tipContent.value = data;
  showTip.value = true;
};

const leftClick = (data: any, index: number) => {
  currentLeftActiveIndex.value = index;
  currentRightData.value = data.childs;
};
const rightClick = (data: any, index: number) => {
  currentRightActiveIndex.value = index;

  const checked =
    treeData.value[current.value].childs[currentLeftActiveIndex.value].childs[
      currentRightActiveIndex.value
    ];
  const rightData = treeData.value[current.value].childs[currentLeftActiveIndex.value].childs;
  ///////////////////////////////////////////////////////////////////右边选中逻辑 start
  rightData.map((item: any, inx: number) => {
    if (index == inx) {
      //选中的都要取反，其他的要设为false（因为是单选）
      item.checked = !item.checked;
    } else {
      item.checked = false;
    }
  });
  ///////////////////////////////////////////////////////////////////右边选中逻辑 end

  ///////////////////////////////////////////////////////////////////左边记录右边选中哪项的逻辑 start
  if (checked.checked) {
    //左边数据中用currentLevel记录右边选中的level
    treeData.value[current.value].childs[currentLeftActiveIndex.value].currentLevel = data.level;
  } else {
    //如果右边选中项checked为false，则左边level置空onChange
    treeData.value[current.value].childs[currentLeftActiveIndex.value].currentLevel = '';
  }
  ///////////////////////////////////////////////////////////////////左边记录右边选中哪项的逻辑 end

  ///////////////////////////////////////////////////////////////////头部tab计数逻辑 start
  const leftData = treeData.value[current.value].childs;
  const currentTopData = treeData.value[current.value];
  let countNum = 0;
  leftData.map((item: any, inx: number) => {
    if (item.currentLevel) {
      countNum++;
    }
  });
  const nameCopy = tabList[current.value];
  if (countNum == 0) {
    currentTopData.name = nameCopy;
  } else {
    currentTopData.checked = true;
    currentTopData.name = `${nameCopy}(${countNum})`;
  }
  //为了重新渲染头部tab start
  isShowTab.value = false;
  setTimeout(() => {
    isShowTab.value = true;
  }, 10);
  //为了重新渲染头部tab end
  ///////////////////////////////////////////////////////////////////头部tab计数逻辑 end
};

const hanldeSubmit = () => {
  let data: any = [];
  treeData.value.forEach((item: any) => {
    if (item.checked) {
      item.childs.forEach((child: any) => {
        if (child.currentLevel) {
          child.childs.forEach((grandchild: any) => {
            if (grandchild.checked) {
              data.push({
                domainId: item.id,
                projectId: child.id,
                indicatorId: grandchild.id,
                level: child.currentLevel,
              });
            }
          });
        }
      });
    }
  });
  //保存到缓存
  store.PointsOfObservationData.setIndicators(data);
  store.PointsOfObservationData.setTreeDataSave(treeData.value);
  store.PointsOfObservationData.setTabList(tabList);
  uni.navigateBack();
};
/** 将选中的数据清除 */
const clearChecked = () => {
  if (!Array.isArray(treeData.value) || treeData.value.length <= 0) {
    return;
  }
  treeData.value.forEach((domain: any, idx: number) => {
    domain.checked = false;
    domain.name = tabList[idx];
    domain.childs.forEach((project: any) => {
      project.currentLevel = '';
      project.childs.forEach((indicator: any) => {
        indicator.checked = false;
      });
    });
  });
};
/**草稿箱时候回填数据 */
const backFill = () => {
  clearChecked();
  const indicatorsChecked: any = store.PointsOfObservationData.indicators;
  indicatorsChecked.forEach((item: any) => {
    treeData.value.forEach((domain: any) => {
      if (item.domainId === domain.id) {
        domain.checked = true;
        domain.childs.forEach((project: any) => {
          if (item.projectId === project.id) {
            project.currentLevel = item.level;
            project.childs.forEach((indicator: any) => {
              if (item.indicatorId === indicator.id) {
                indicator.checked = true;
              }
            });
          }
        });
      }
    });
  });
  //头部数量
  for (var i = 0, len = treeData.value.length; i < len; i++) {
    if (treeData.value[i].checked) {
      let countNum = 0;
      for (var j = 0, len2 = treeData.value[i].childs.length; j < len2; j++) {
        if (treeData.value[i].childs[j]?.currentLevel) {
          countNum++;
          treeData.value[i].name = `${tabList[i]}(${countNum})`;
        } else {
          continue;
        }
      }
    } else {
      continue;
    }
  }
};

const init = async () => {
  const types = store.PointsOfObservationData.currentType;
  if (types === 'dartf') {
    const res: any = await findTree();
    treeData.value = res;
    res?.forEach((item: { name: any }) => {
      tabList.push(item.name);
    });
    getCurrentLeftData(0);
    backFill();
  } else {
    getTreeData();
  }
};
onBeforeMount(() => {
  init();
});
</script>
<style lang="scss" scoped>
.leftBox {
  width: 35%;
  height: 100vh;
  background-color: #f5f5f5;
}
.rightBox {
  width: 65%;
  height: 100vh;
  padding: 20rpx;
  background-color: #fff;
}
.leftTab {
  padding: 20rpx;
  .title_header {
    font-size: 22rpx;
    font-weight: 400;
    color: #86909c;
  }
  .title_content {
    font-size: 26rpx;
    font-weight: 400;
    color: #1d2129;
  }
}
.rightTab {
  border: 1rpx solid #e5e6ec;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 26rpx;
  font-weight: 400;
  color: #1d2129;
  margin-top: 10rpx;
}
.active {
  background: #fff;
  border-left: 4rpx solid #176bfb;
}
.activeRight {
  background: #fff;
  border: 1rpx solid #176bfb;
}
.leftContent {
  width: 90%;
  padding-right: 5rpx;
}
.rightContent {
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.tab-header {
  width: 100%;
  height: 88rpx;
  background-color: $ui-color-white;
  padding: 0 10rpx;
  ::v-deep {
    scroll-view {
      ::-webkit-scrollbar {
        display: none;
        width: 0 !important;
        height: 0 !important;
        -webkit-appearance: none;
        background: transparent;
      }
    }
  }
}
</style>
