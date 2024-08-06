<template>
  <view class="content" :style="{ height: bodyMaxHeight }">
    <view v-if="!searchKeyword" class="breadcrumb-content" style="position: relative; z-index: 100">
      <!--顶部横向tabbar横向导航页面-->
      <scroll-view scroll-x="true" class="scroll-view-x">
        <!--组织架构层级导航-面包屑-->
        <view
          v-for="(item, index) in breadcrumb"
          :key="index"
          class="breadcrumb-item"
          @click="handleBreadcrumbClick(index)"
        >
          <text
            class="breadcrumb-label"
            :style="{
              color:
                breadcrumb.length == 1 || index == breadcrumb.length - 1 ? '#000000E0' : '#1677FF',
            }"
            >{{ item?.label }}</text
          >
          <u-icon
            v-if="breadcrumb.length > 1 && index < breadcrumb.length - 1"
            name="arrow-right"
            color="#000000E0"
            style="margin-left: 8rpx"
          />
        </view>
      </scroll-view>
    </view>
    <!-- 搜索时使用列表页面 -->
    <scroll-view
      v-if="searchKeyword"
      class="scroller-content cc"
      scroll-y="true"
      @scrolltolower="scrolltolower"
      @scroll="searchScrollEvt"
    >
      <view style="height: 24rpx" />
      <!--搜索 常用联系人-->
      <view v-if="isShowCommonuserAndorganization" class="contact-list-content marB">
        <view class="flex-between">
          <view class="title-name1">常用联系人</view>
        </view>
        <view v-if="searchCommonUserList && searchCommonUserList.length > 0">
          <view
            v-for="(item, index) in searchCommonUserList"
            :key="index"
            class="contact-list-item"
            style="height: 128rpx"
            @click="toDetail(item.id)"
          >
            <image
              class="icon-head"
              :src="item.headImageUrl ? item.headImageUrl : icon_avatar"
              mode="aspectFill"
            />
            <view class="contact-list-item-title-head-content">
              <view class="contact-list-item-title-center-content">
                <text class="contact-list-item-title-head">{{
                  item.name && item.name.length > userNameMaxLength
                    ? item.name.substring(0, userNameMaxLength) + '...'
                    : item.name
                }}</text>
                <image
                  v-if="item.gender"
                  class="icon-sex-size"
                  :src="item.gender == 1 ? icon_sex_man : icon_sex_female"
                />
              </view>
              <view v-if="!isNil(item.position)">
                <text class="contact-list-item-title-content">{{
                  item.position && item.position.length > 18
                    ? item.position.substring(0, 18) + '...'
                    : item.position
                }}</text>
              </view>
            </view>
            <view
              v-if="item.tel && !isNil(item.tel)"
              class="phone-wrap"
              @click.stop="handlePhoneCall(item.tel)"
            >
              <u-icon
                v-if="item.tel && !isNil(item.tel)"
                name="phone-fill"
                color="#176bfb"
                size="32"
              />
            </view> </view
        ></view>
        <view v-else>
          <!-- <view><u-empty text="暂无数据" mode="list"></u-empty></view> -->
          <view class="empty-no-search-reslut">
            <u-empty-custom v-show="true" mode="search" model="list" card="true" font-size="10" />
          </view>
        </view>
      </view>
      <!--搜索本单位-->
      <view class="contact-list-content search">
        <view class="title-name1"> 本单位</view>
        <view
          v-for="(item, index) in searchUserList"
          :key="index"
          class="contact-list-item"
          style="height: 128rpx"
          @click="toDetail(item.id)"
        >
          <image
            class="icon-head"
            :src="item.headImageUrl ? item.headImageUrl : icon_avatar"
            mode="aspectFill"
          />
          <view class="contact-list-item-title-head-content">
            <view class="contact-list-item-title-center-content">
              <text class="contact-list-item-title-head">{{
                item.name && item.name.length > userNameMaxLength
                  ? item.name.substring(0, userNameMaxLength) + '...'
                  : item.name
              }}</text>
              <image
                v-if="item.gender"
                class="icon-sex-size"
                :src="item.gender == 1 ? icon_sex_man : icon_sex_female"
              />
            </view>
            <view style="display: flex; align-items: center">
              <text class="contact-list-item-title-content-dept">
                {{ item.departmentName }}
              </text>
              <view v-if="!isNil(item.position)">
                <text class="contact-list-item-title-content">{{
                  item.position && item.position.length > 14
                    ? item.position.substring(0, 14) + '...'
                    : item.position
                }}</text>
              </view>
            </view>
          </view>
          <view @click.stop="handlePhoneCall(item.tel)">
            <u-icon
              v-if="item.tel && !isNil(item.tel)"
              class="phone-wrap"
              name="phone-fill"
              color="#176bfb"
              size="32"
            />
          </view>
        </view>
        <view
          v-if="isSearchUserListLoaded && searchUserList && searchUserList.length == 0"
          class="empty-no-search-reslut"
        >
          <!-- <u-empty text="暂无数据" mode="list"></u-empty> -->
          <u-empty-custom v-show="true" mode="search" model="list" card="true" font-size="10" />
        </view>
      </view>

      <view v-if="searchShowNoMoreTip">
        <view style="height: 24rpx" />
        <u-loadmore :status="searchBottomLoadingState" bg-color="#f5f5f5" />
      </view>

      <!--加载中-->
      <view v-if="searchIsSearching" style="height: 120rpx; padding-top: 40rpx">
        <u-loadmore status="loading" bg-color="#f5f5f5" />
      </view>
      <view style="height: 24rpx" />
    </scroll-view>
    <!--正常浏览模式列表页面 
      参考文档：https://z-paging.zxlee.cn/api/props/virtual-list.html
      关键 props:
           fixed：false pz不要平铺整个页面 
           cell-height-mode="'fixed'" 固定宽度
           fixed-cell-height 适配微信,直接固定高度
    -->
    <z-paging
      v-if="!searchKeyword"
      ref="pagingOfNormalStudent"
      class="scroller-content"
      use-virtual-list
      :force-close-inner-list="true"
      :cell-height-mode="'fixed'"
      fixed-cell-height="128rpx"
      :default-page-no="1"
      :default-page-size="15"
      :fixed="false"
      :loading-more-enabled="true"
      :refresher-enabled="false"
      virtual-scroll-fps="90"
      @virtualListChange="virtualListChange"
      @query="queryList"
      @scroll="commonUserListScrollEvt"
    >
      <!--列表顶部-->
      <view>
        <view style="height: 24rpx" />
        <!-- 常用联系人 -->
        <view v-if="isShowCommonuserAndorganization" class="contact-list-content marB">
          <view class="flex-between">
            <view class="title-name1"> 常用联系人</view>
            <view v-if="organizationListTotal > 5" class="title-name3" @click="jumpToMore">
              查看更多</view
            >
          </view>
          <view v-if="commonUserList && commonUserList.length > 0">
            <view
              v-for="(item, index) in commonUserList"
              :key="index"
              class="contact-list-item"
              style="height: 128rpx"
              @click="toDetail(item.id)"
            >
              <image
                class="icon-head"
                :src="item.headImageUrl ? item.headImageUrl : icon_avatar"
                mode="aspectFill"
              />
              <view class="contact-list-item-title-head-content">
                <view class="contact-list-item-title-center-content">
                  <text class="contact-list-item-title-head">{{
                    item.name && item.name.length > userNameMaxLength
                      ? item.name.substring(0, userNameMaxLength) + '...'
                      : item.name
                  }}</text>
                  <image
                    v-if="item.gender"
                    class="icon-sex-size"
                    :src="item.gender == 1 ? icon_sex_man : icon_sex_female"
                  />
                </view>
                <view v-if="!isNil(item.position)">
                  <text class="contact-list-item-title-content">{{
                    item.position && item.position.length > 18
                      ? item.position.substring(0, 18) + '...'
                      : item.position
                  }}</text>
                </view>
              </view>

              <view @click.stop="handlePhoneCall(item.tel)">
                <u-icon
                  v-if="item.tel && !isNil(item.tel)"
                  class="phone-wrap"
                  name="phone-fill"
                  color="#176bfb"
                  size="32"
                />
              </view>
            </view>
          </view>
          <view v-else class="empty-tip">
            <view>暂无数据 </view>
            <view>可进入联系人详情页设置常用联系人</view>
          </view>
        </view>
        <!-- 相关单位 集团edu  -->
        <view v-if="edu && isShowCommonuserAndorganization" class="contact-list-content marB">
          <view class="title-name1"> 相关单位</view>

          <view v-if="organizationList && organizationList.length > 0">
            <view
              v-for="(item, index) in organizationList"
              :key="item.id + index"
              class="contact-list-item"
              @click="handleCorrelation(item.level, '0', item.id, item)"
            >
              <image
                class="icon-organization"
                :src="icon_organization"
                style="margin-right: 16rpx"
              />
              <text class="contact-list-item-title">{{ item.name }}</text>
              <u-icon name="arrow-right" color="#00000073" style="margin-top: 2rpx" />
            </view>
          </view>
          <view v-else>
            <u-empty-custom
              card
              bg-type="fill-light"
              type="mini"
              class-name="mt-b ptb-b"
              text="暂无数据"
            />
          </view>
        </view>
        <!-- 本单位 -->
        <view
          class="contact-list-content"
          style="border-bottom-left-radius: 0rpx; border-bottom-right-radius: 0rpx"
        >
          <!--一级组织架构-->
          <view v-if="breadcrumb.length <= 1">
            <u-sticky
              :offset-top="!hasTabBars ? 150 : 238"
              z-index="99"
              @fixed="handleFixed"
              @unfixed="handleUnFixed"
            >
              <view :class="['title-name1']"> 本单位</view>
            </u-sticky>
            <view
              class="contact-list-item"
              @click="handleRootClick(currentDepts.level, currentDepts.id)"
            >
              <image
                class="icon-organization"
                :src="icon_organization"
                style="margin-right: 16rpx"
              />
              <text class="contact-list-item-title">{{ currentDepts.departmentName }}</text>
              <text class="contact-list-item-right">{{ rootDeptPeopleNum }}</text>
              <u-icon name="arrow-right" color="#00000073" style="margin-top: 2rpx" />
            </view>
            <!--下属二级组织架构-->
            <view v-if="userInfo?.deptId" class="contact-list-item" @click="handleDirectDeptClick">
              <image class="icon-organization" :src="icon_subset" style="margin-right: 16rpx" />
              <text class="contact-list-item-title">{{ userInfo?.deptName }}</text>
              <text class="contact-list-item-right">{{ userDeptPeopleNum }}</text>
              <u-icon name="arrow-right" color="#00000073" style="margin-top: 2rpx" />
            </view>

            <view class="title-name2"> 全部联系人</view>
            <!--教职工用户列表-->
          </view>
          <!-- 二级页面 -->
          <view v-else class="two-level-content">
            <!-- 根目录 -->
            <view class="contact-list-item">
              <image
                class="icon-organization"
                :src="icon_organization"
                style="margin-right: 16rpx"
              />
              <text class="contact-list-item-title">{{
                // currentDepts.departmentName || correlationList.value.departmentName
                breadcrumb && breadcrumb.length > 0
                  ? breadcrumb[breadcrumb.length - 1].label
                  : '组织架构'
              }}</text>
            </view>

            <!-- 相关部门的二级页面 -->
            <view v-if="isShowCorrelation" class="xg">
              <view v-for="(item, index) in correlationList" :key="index">
                <view
                  class="contact-list-item"
                  @click="handleCorrelation(item.level, item.id, item.locationId, item)"
                >
                  <image class="icon-organization" :src="icon_subset" style="margin-right: 16rpx" />
                  <text class="contact-list-item-title">{{ item.departmentName }}</text>
                  <text class="contact-list-item-right">{{
                    item.memberCount ? item.memberCount : 0
                  }}</text>
                  <u-icon name="arrow-right" color="#00000073" style="margin-top: 2rpx" />
                </view>
              </view>
            </view>
            <!-- 部门的二级页面 -->
            <view v-else class="zc">
              <view v-for="(item, index) in currentDepts.children" :key="index">
                <view class="contact-list-item" @click="handleRootClick(item.level, item.id)">
                  <image class="icon-organization" :src="icon_subset" style="margin-right: 16rpx" />
                  <text class="contact-list-item-title">{{ item.departmentName }}</text>
                  <text class="contact-list-item-right">{{
                    item.departmentPersonNum ? item.departmentPersonNum : 0
                  }}</text>
                  <u-icon name="arrow-right" color="#00000073" style="margin-top: 2rpx" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!--中间学生列表页教职工列表-->
      <view
        v-for="(item, index) in virtualList"
        :id="`zp-id-${item.zp_index}`"
        :key="item.zp_index"
        class="contact-list-content"
        style="border-radius: 0rpx; margin: 0rpx 32rpx"
      >
        <view class="contact-list-item" style="height: 128rpx" @click="toDetail(item.id)">
          <image
            class="icon-head"
            :src="item.headImageUrl ? item.headImageUrl : icon_avatar"
            mode="aspectFill"
          />
          <view class="contact-list-item-title-head-content">
            <view class="contact-list-item-title-center-content">
              <text class="contact-list-item-title-head">{{
                item.name && item.name.length > userNameMaxLength
                  ? item.name.substring(0, userNameMaxLength) + '...'
                  : item.name
              }}</text>
              <image
                v-if="item.gender"
                class="icon-sex-size"
                :src="item.gender == 1 ? icon_sex_man : icon_sex_female"
              />
            </view>
            <view v-if="!isNil(item.position)">
              <text class="contact-list-item-title-content">{{
                item.position && item.position.length > 18
                  ? item.position.substring(0, 18) + '...'
                  : item.position
              }}</text>
            </view>
          </view>
          <view @click.stop="handlePhoneCall(item.tel)">
            <u-icon
              v-if="item.tel && !isNil(item.tel)"
              class="phone-wrap"
              name="phone-fill"
              color="#176bfb"
              size="32"
            />
          </view>
        </view>
      </view>
      <template #loadingMoreNoMore>
        <view></view>
      </template>
      <template #loadingMoreLoading>
        <view></view>
      </template>
      <template #loadingMoreDefault>
        <view></view>
      </template>
      <template #empty>
        <view></view>
      </template>
      <!--底部状态数据-->
      <view>
        <!--没有数据-->
        <u-empty-custom
          v-if="
            isUserListLoaded &&
            currentDepts &&
            currentDepts.children &&
            currentDepts.children.length == 0 &&
            userList &&
            userList.length == 0 &&
            !edu
          "
          text="暂无数据"
          model="list"
          class="content-empty"
        />
        <!--加载中-->
        <view style="height: 120rpx; padding-top: 40rpx">
          <u-loadmore :status="bottomLoadingState" bg-color="#f5f5f5" />
        </view>
        <!--没有更多-->
        <view style="height: 24rpx" />
      </view>
    </z-paging>
  </view>
</template>
<script lang="ts" setup>
import zPaging from '@/business-components/z-paging/components/z-paging/z-paging.vue';
import {
  IGetDeptListRtn,
  IGetUserListRtn,
  commonUser,
  findSub,
  findSub2,
  getDeptPeopleNum,
  getDeptTreeDataNew,
  getUserList,
} from '@/services/contact';
import { requestPhoneCallPer } from '@/services/permissionRequest';
import icon_avatar from '@/static/avatar.png';
import icon_organization from '@/static/icon_organization.svg';
import icon_subset from '@/static/icon_subset.svg';
import { loginStore } from '@/store/modules/login';
import { tabBarStore } from '@/store/modules/tabbar';
import { debounce, isNil } from '@/utils/lodash-es';
import { isEdu, log, showInfo } from '@/utils/tools';
import { onBackPress, onHide, onReachBottom, onShow } from '@dcloudio/uni-app';
import { PropType, onBeforeMount, onMounted, onUnmounted, reactive, ref, toRefs, watch } from 'vue';
import icon_sex_female from '/static/icon_sex_female.svg';
import icon_sex_man from '/static/icon_sex_man.svg';

const componentPlaceholder = {
  'z-paging': 'view',
};

const { userInfo } = toRefs(loginStore());
const edu = ref(isEdu());
const getLocationIdNum = () => {
  return userInfo.value?.locationId;
};
const currentLocationId = ref('');
//标识是否正在搜索中
const searchIsSearching = ref(false);

const props = defineProps({
  hasTabBar: {
    type: Boolean,
    default: true,
  },
  /** 搜索时使用 */
  stateSearch: {
    type: Boolean,
    default: false,
  },
  teacherList: {
    type: Array as PropType<Array<IGetUserListRtn>>,
    default: () => [],
  },
  deptList: {
    type: Array as PropType<Array<IGetDeptListRtn>>,
    default: () => [],
  },
});

/** 翻页属性 */
export interface IPager {
  pageNum: number;
  pageSize: number;
  total: number;
}

const { isNativeTabBar } = toRefs(tabBarStore());

const userNameMaxLength = 11;

const pager = reactive({} as IPager);
const bottomLoadingState = ref('loading');
const isShowNoMoreTip = ref(false);
const isShowCommonuserAndorganization = ref(true);
const searchKeyword = ref('');
const searchUserList: IGetUserListRtn[] = reactive([]);
const searchPager = reactive({} as IPager);
const searchBottomLoadingState = ref('loading');
const searchShowNoMoreTip = ref(false);
const isSearchUserListLoaded = ref(true);

const userDeptPeopleNum = ref(0);
const userList: IGetUserListRtn[] = reactive([]);
const isUserListLoaded = ref(false);
const rootDeptPeopleNum = ref(0);

type Node = { label: string; level: number; deptId: string };
// 面包屑 -层级深度
const breadcrumb = reactive([] as Node[]);
let directDeptBreadcrumb = reactive([] as Node[]);
// 存放部门
const depts = reactive({ array: [] as IGetDeptListRtn[] });
// 当前部门
const currentDepts = reactive({} as IGetDeptListRtn);
let isBreadcrumbSplice = false;
const isFixed = ref(false);
const handleFixed = () => {
  isFixed.value = true;
};
const handleUnFixed = () => {
  isFixed.value = false;
};
const jumpToMore = () => {
  uni.navigateTo({
    url: '/pages/contacts/commonUser',
  });
};
const correlationList = ref();
const jj_currentParentId = ref('');
const jj_currentlocationId = ref('');
/**是否是相关单位 */
const isShowCorrelation = ref(false);
const findSubEvent = (locationId: any, parentId: any, allData: any) => {
  const data = {
    locationId: locationId ? locationId : getLocationIdNum(),
    parentId: parentId,
  };
  findSub2(data).then(res => {
    if (res.length == 0 && allData.memberCount == 0) {
      return;
    }
    correlationList.value = res;
    if (allData.locationLevel) {
      addBreadcrumb(allData.name || '', 0, parentId, allData.id);
    } else {
      addBreadcrumb(allData.departmentName || '', allData.level, allData.id, allData.locationId);
    }

    userList.length = 0;
    jj_currentParentId.value = parentId;
    jj_currentlocationId.value = locationId ? locationId : getLocationIdNum();
    clearDataAndScrollToTopInNormalMode();
    initPageParam();
    fetchUserList(parentId, jj_currentlocationId.value, 'findSubEvent');
  });
};
const getDepAndUserEvent = (locationId: any, parentId: any) => {
  const data = {
    locationId: locationId ? locationId : getLocationIdNum(),
    parentId: parentId ? parentId : '0',
  };
  jj_currentParentId.value = parentId ? parentId : '0';
  jj_currentlocationId.value = locationId ? locationId : getLocationIdNum();
  clearDataAndScrollToTopInNormalMode();

  findSub2(data).then(res => {
    correlationList.value = res;
    userList.length = 0;
    clearDataAndScrollToTopInNormalMode();
    fetchUserList(parentId, locationId ? locationId : getLocationIdNum(), 'getDepAndUserEvent');
  });
};
/**
 * 用于处理跨部门变化时，虚拟列表的数据清除 && 重新滚动到最顶部
 */
const clearDataAndScrollToTopInNormalMode = () => {
  pagingOfNormalStudent?.value?.clear();
  pagingOfNormalStudent?.value?.scrollToTop(true);
};

// 相关单位跳转
const handleCorrelation = (level: number, departmentId: string, locationId: any, allData: any) => {
  currentLocationId.value = locationId;
  isShowCorrelation.value = true;
  isShowCommonuserAndorganization.value = false;
  if (departmentId === 0) {
    const data = {
      locationId: locationId ? locationId : getLocationIdNum(),
      parentId: departmentId,
    };
    findSub2(data).then(res => {
      findSubEvent(locationId, res[0].id, allData);
    });
  } else {
    findSubEvent(locationId, departmentId, allData);
  }
};
const toDetail = (id: string) => {
  uni.navigateTo({
    url: `/app-platform/contacts/staff-detail/index?id=${id}`,
  });
};
function handleRootClick(level: number, departmentId: string) {
  isShowCommonuserAndorganization.value = false;
  isShowCorrelation.value = false;
  let refresh = false;
  log('handleRootClick -> level : ', level);
  log('handleRootClick -> departmentId : ', departmentId);
  isBreadcrumbSplice = false;
  if (level == 0) {
    refresh = true;
    addBreadcrumb(
      currentDepts.departmentName || '',
      currentDepts.level,
      currentDepts.id,
      currentDepts.locationId,
    );
  } else {
    //跳转到下一页中时需要重新新其拉到最顶
    pagingOfNormalStudent?.value.scrollToTop(true);

    // 查找下级部门
    const dept = mapTree(depts.array, departmentId, false);
    log('handleRootClick -> dept : ', dept);
    if (dept && dept.children && dept.children.length != 0) {
      refresh = true;

      Object.assign(currentDepts, dept);
      log('handleRootClick Object.assig currentDepts =', currentDepts);
    } else {
      // 无下级部门但是当前部门有人数的情况，
      const findDept = currentDepts.children.find(item => item.id == departmentId);
      log('handleRootClick -> dept_people_num: ', findDept?.departmentPersonNum);
      if (!findDept || findDept.departmentPersonNum == 0) {
        return;
      } else {
        currentDepts.children = [];
        addBreadcrumb(
          findDept.departmentName || '',
          findDept.level,
          findDept.id,
          findDept.locationId,
        );
        Object.assign(currentDepts, findDept);
        isShowNoMoreTip.value = false;
        initPageParam();
        userList.length = 0;
        fetchUserList(findDept.id, findDept.locationId, 'handleRootClick.获取下级部门');
      }
    }
  }
  if (refresh) {
    if (currentDepts.children && currentDepts.children.length > 0) {
      let deptIds = [] as string[];
      currentDepts.children.forEach(item => {
        deptIds.push(item.id);
      });
      log('handleRootClick -> deptIds : ', deptIds);
      if (deptIds && deptIds.length > 0) {
        requestDeptPeopleNum(deptIds, level);
      }
    }
    isShowNoMoreTip.value = false;
    initPageParam();
    userList.length = 0;

    fetchUserList(departmentId, currentDepts.locationId, 'handleRootClick.数据刷新');
  }
}

function handleDirectDeptClick() {
  isShowCommonuserAndorganization.value = false;
  isShowCorrelation.value = false;
  isBreadcrumbSplice = false;
  if (!userInfo.value?.deptId || userInfo.value?.deptId == undefined) {
    return;
  }
  if (!userInfo.value?.deptName || userInfo.value?.deptName == undefined) {
    return;
  }
  // 找到这个人所在的部门
  log('handleDirectDeptClick -> depts.array : ', depts.array);
  log('handleDirectDeptClick -> userInfo.value?.deptId : ', userInfo.value?.deptId);
  const findUserInDept = depts.array.find(item => item.id == userInfo.value?.deptId);
  log('handleDirectDeptClick -> findUserInDept : ', findUserInDept);
  // 如果在根部门
  if (findUserInDept?.level === 0) {
    Object.assign(currentDepts, findUserInDept);
    log('handleDirectDeptClick.findUserInDept?.level  currentDepts=', findUserInDept);
    addBreadcrumb(
      findUserInDept?.departmentName || '',
      findUserInDept?.level,
      findUserInDept?.id,
      findUserInDept?.locationId,
    );
    let deptIds = [] as string[];
    currentDepts.children.forEach(item => {
      deptIds.push(item.id);
    });
    log('handleDirectDeptClick -> deptIds : ', deptIds);
    if (deptIds && deptIds.length > 0) {
      requestDeptPeopleNum(deptIds, findUserInDept?.level);
    }
  } else {
    Object.assign(currentDepts, mapTree(depts.array, userInfo.value?.deptId, true));
    log('handleDirectDeptClick currentDepts', currentDepts);
    log('handleDirectDeptClick -> directDeptBreadcrumb : ', directDeptBreadcrumb);
    // mapTree 处理完的directDeptBreadcrumb需要进行逆序处理
    directDeptBreadcrumb = directDeptBreadcrumb.slice().reverse();
    directDeptBreadcrumb.forEach(item => {
      addBreadcrumb(item?.label, item.level, item.deptId, item.locationId);
    });
    // 获取部门人数
    let deptIds = [] as string[];
    currentDepts.children.forEach(item => {
      deptIds.push(item.id);
    });
    log('handleBreadcrumbClick -> deptIds : ', deptIds);
    if (deptIds && deptIds.length > 0) {
      requestDeptPeopleNum(deptIds, directDeptBreadcrumb[directDeptBreadcrumb.length - 1]?.level);
    }
  }
  log('handleDirectDeptClick -> Breadcrumb : ', breadcrumb);
  initPageParam();
  userList.length = 0;
  fetchUserList(userInfo.value?.deptId, currentDepts.locationId);
}

// 递归查询树 direct:直查
const mapTree = (data: IGetDeptListRtn[], deptId: string, direct: boolean) => {
  let newData = {} as IGetDeptListRtn;
  data.some(element => {
    if (element.id === deptId) {
      newData = element;
      if (direct) {
        directDeptBreadcrumb.push({
          label: element.departmentName || '',
          level: element.level,
          deptId: element.id,
        });
      }
      return true;
    } else {
      if (element.children && element.children.length > 0) {
        let redata = mapTree(element.children, deptId, direct);
        if (redata.id === deptId) {
          newData = redata;
          if (direct) {
            directDeptBreadcrumb.push({
              label: element.departmentName || '',
              level: element.level,
              deptId: element.id,
            });
          }
          return true;
        }
      }
    }
  });
  return newData;
};

function addBreadcrumb(label: string, level: number, deptId: string, locationId: any) {
  if (!breadcrumb.some(item => item.deptId == deptId)) {
    breadcrumb.push({ label: label, level: level, deptId: deptId, locationId: locationId });
  }
}

function handleBreadcrumbClick(index: number) {
  userList.length = 0;
  if (index == 0) {
    //选中的是根目录的话要显示（常用联系人或者相关单位）模块
    isShowCommonuserAndorganization.value = true;
  }
  // if ((index == 0 && breadcrumb.length == 1) || index == breadcrumb.length - 1) return;
  directDeptBreadcrumb.length = 0;
  isBreadcrumbSplice = true;
  breadcrumb.splice(index + 1, breadcrumb.length - index);
  log('handleBreadcrumbClick -> splice-breadcrumb : ', breadcrumb);
  initPageParam();

  log('handleBreadcrumbClick -> userList : ', userList.length);
  const bcData = breadcrumb[index];
  log('handleBreadcrumbClick -> bcData', bcData);
  //debugger;
  // 根部门
  if (isShowCorrelation.value) {
    //相关单位
    getDepAndUserEvent(bcData.locationId, bcData.deptId);
    getData();
  } else {
    if (bcData.level == 0) {
      // 组织架构
      Object.assign(
        currentDepts,
        depts.array.find(item => item.level == 0),
      );
      log('handleBreadcrumbClick111---> currentDepts-->', currentDepts);
      // 获取部门人数
      let deptIds = [] as string[];
      currentDepts.children.forEach(item => {
        deptIds.push(item.id);
      });
      log('handleBreadcrumbClick -> deptIds : ', deptIds);
      if (deptIds && deptIds.length > 0) {
        requestDeptPeopleNum(deptIds, bcData?.level);
      }
      /**
       * FiX: 引入z-paging的时候，需要对数据进行重新初始化
       *      容易出现在二级部门较多用户情况下，直接切到上级部门，但是未滚动到顶部情况
       */
      pagingOfNormalStudent?.value.clear();
      pagingOfNormalStudent?.value.scrollToTop(true);
      fetchUserList(
        bcData.deptId,
        currentDepts.locationId,
        'handleBreadcrumbClick.获取部门用户数据',
      );

      //需要更新常用联系人
      getData();
    } else {
      handleRootClick(bcData.level, bcData.deptId);
    }
  }
}

watch(
  () => props.deptList,
  newValue => {
    log('newValue :', newValue);
    Object.assign(breadcrumb, [{ label: newValue[0].departmentName, value: newValue[0].level }]);
  },
  { deep: true },
);

watch(
  () => currentDepts,
  newCurrentDept => {
    // 当部门数据变更时，添加面包屑
    log('isBreadcrumbSplice :', isBreadcrumbSplice, newCurrentDept, currentDepts);
    if (newCurrentDept.level != 0 && !isBreadcrumbSplice) {
      addBreadcrumb(
        newCurrentDept.departmentName || '',
        newCurrentDept.level,
        newCurrentDept.id,
        newCurrentDept.locationId,
      );
      //变化时，需要重新清理用户列表
      // log('加载用户列表  清除数据watch----');
      pagingOfNormalStudent?.value.clear();
      //virtualList.value.length = 0;
      initPageParam();
      userList.length = 0;
    }
    isBreadcrumbSplice = false;
  },
  { deep: true },
);

const requestDeptPeopleNum = async (depts: string[], level: number) => {
  const res = await getDeptPeopleNum(depts);
  log('requestDeptPeopleNum -> level :', level);
  log('requestDeptPeopleNum -> getDeptPeopleNum_res : ', res);

  if (level == -1) {
    rootDeptPeopleNum.value = res[0].departmentPersonNum;
    log('requestDeptPeopleNum -> rootDeptPeopleNum : ', rootDeptPeopleNum.value);
    // currentDepts.departmentPersonNum = res[0].departmentPersonNum;
    Object.assign(currentDepts, { departmentPersonNum: res[0].departmentPersonNum });
    log(' requestDeptPeopleNum  currentDepts', currentDepts);
    userDeptPeopleNum.value = res[1].departmentPersonNum;
  } else {
    currentDepts.children.map(
      (item, index) => (item.departmentPersonNum = res[index].departmentPersonNum),
    );
  }
};

const switchIdentityThenInit = () => {
  try {
    edu.value = isEdu();
    // pagingOfNormalStudent?.value.clear();
    //身份切换后，将搜索数据清空
    searchKeyword.value = '';
    //需要将顶部-面包屑数据重置
    breadcrumb.splice(1, breadcrumb.length - 1);
    //相关单位，重置相关单位的显示状态
    isShowCommonuserAndorganization.value = true;
    clearDataAndScrollToTopInNormalMode();
    initPageParam();
    fetchDept('switchIdentityThenInit');
    getData();
  } catch (err: any) {
    console.error('切换身份发生异常', err);
  }
};

const fetchDept = async (ref: string) => {
  const res = await getDeptTreeDataNew();
  Object.assign(depts.array, res);
  Object.assign(
    currentDepts,
    depts.array.find(item => item.level == 0),
  );
  log(' fetchDept.currentDepts.' + ref, currentDepts);
  requestDeptPeopleNum([currentDepts?.id, userInfo.value?.deptId || ''], -1);
  //z-pagging会进行拉取,如果这边也拉取会导致列表中的数据重复
  if (edu.value) {
    jj_currentParentId.value = '0';
    jj_currentlocationId.value = depts.array.find(item => item.level == 0)?.locationId;
    fetchUserList('', currentDepts.locationId, 'fetchDept.' + ref);
  }
};

const fetchUserList = async (departmentId: string, locationId: any, ref?: string) => {
  isUserListLoaded.value = false;
  // isSearchUserListLoaded.value = false;
  let res;
  // debugger;
  try {
    let _tempRequestParams = departmentId
      ? {
          pageNum: pager.pageNum,
          pageSize: pager.pageSize,
          departmentId: departmentId,
          locationId: locationId ? locationId : getLocationIdNum(),
        }
      : {
          pageNum: pager.pageNum,
          pageSize: pager.pageSize,
          locationId: locationId ? locationId : getLocationIdNum(),
        };
    log('fetchUserList 触发----》加载用户列表 start.requestParams ', _tempRequestParams);
    res = await getUserList(_tempRequestParams);
    //bottomLoadingState }

    Object.assign(pager, {
      total: res['total'],
    });

    res.result.map(item => {
      userList.push(item);
    });
    log('fetchUserList 触发----》加载用户列表：', res.result, ref);
    //res.result
    pagingOfNormalStudent?.value.complete(res.result);
    isUserListLoaded.value = true;

    if (pager.total == 0) {
      isShowNoMoreTip.value = false;
      bottomLoadingState.value = 'nomore';
    } else {
      log('fetchUserList -> userList.length : ', userList.length);
      if (pager.pageNum * pager.pageSize >= pager.total && userList.length != 0) {
        bottomLoadingState.value = 'nomore';
        isShowNoMoreTip.value = true;
      }
    }
  } catch (error: any) {
    isShowNoMoreTip.value = false;
    Object.assign(pager, {
      pageNum: pager.pageNum - 1,
    });
    isUserListLoaded.value = true;
    // isSearchUserListLoaded.value = true;
  }
};
const searchCommonUserList = ref<any>([]);
const handlesearch = debounce(async (options: any) => {
  const { teachKeyword } = options;
  log('handlesearch -> teachKeyword : ', teachKeyword);
  // 本单位
  searchKeyword.value = teachKeyword;
  if (searchKeyword.value) {
    Object.assign(searchPager, { pageNum: 1, pageSize: 15, total: Infinity });
    // searchUserList.length = 0;
    searchShowNoMoreTip.value = false;
    actionTeachSearchByKeyword('new');
  } else {
    searchShowNoMoreTip.value = false;
  }
  // 常用联系人
  if (searchKeyword.value) {
    const prams = {
      pageNum: 1,
      pageSize: 500,
      keyword: searchKeyword.value,
    };
    commonUser(prams).then(res => {
      searchCommonUserList.value = res.result;
    });
  }
}, 600);

const actionTeachSearchByKeyword = debounce(async function (type) {
  isSearchUserListLoaded.value = false;
  try {
    const res = await getUserList({
      locationId: currentLocationId.value ? currentLocationId.value : getLocationIdNum(),
      pageNum: searchPager.pageNum,
      pageSize: searchPager.pageSize,
      condition: searchKeyword.value,
    });
    Object.assign(searchPager, {
      total: res['total'],
    });
    if (searchPager.total == 0) {
      searchShowNoMoreTip.value = false;
    } else {
      if (searchPager.pageNum * searchPager.pageSize >= searchPager.total) {
        searchBottomLoadingState.value = 'nomore';
        searchShowNoMoreTip.value = true;
      }
    }
    if (type === 'new') {
      searchUserList.length = 0;
    }
    res.result.map(item => {
      searchUserList.push(item);
    });
    isSearchUserListLoaded.value = true;
    log('actionTeachSearchByKeyword -> searchUserList : ', searchUserList);
  } catch (error: any) {
    searchShowNoMoreTip.value = false;
    Object.assign(searchPager, {
      pageNum: searchPager.pageNum - 1,
    });
  }
  isSearchUserListLoaded.value = true;
  searchIsSearching.value = false;
}, 600);

const handlePhoneCall = (phone: string) => {
  log('handlePhoneCall -> phone : ', phone);
  if (phone.includes('*')) {
    showInfo('您未开通查看用户隐私权限，不支持拨号!');
    return;
  }

  let platformAndroid = false;
  // #ifdef APP-PLUS
  /** App且是android需要权限使用说明（华为上架要求） */
  if (plus.os.name === 'Android') {
    platformAndroid = true;
    requestPhoneCallPer(
      res => {
        // 已有权限
        log('permissionRequestResult : ', res);
        uni.makePhoneCall({
          phoneNumber: phone,
        });
      },
      err => {
        // 无权限
        log('permissionRequestFail : ', err);
      },
    );
  }
  // #endif
  // 选择图片文件
  if (!platformAndroid) {
    uni.makePhoneCall({
      phoneNumber: phone,
    });
  }
};
const hasTabBars = ref(props.hasTabBar);
watch(
  () => props.hasTabBar,
  newValue => {
    hasTabBars.value = newValue;
    log('hasTabBar change===================', newValue);
    bodyMaxHeight.value = `calc(100vh - var(--window-top) - 100rpx - 172rpx)`;
    if (!newValue) {
      bodyMaxHeight.value = `calc(100vh - var(--window-top) - 188rpx)`;
    }
    // #ifndef H5
    let safeArea = uni.getSystemInfoSync().safeAreaInsets?.bottom;
    log('safeArea : ', safeArea);
    log('isNativeTabBar : ', isNativeTabBar.value);
    if (isNativeTabBar.value) {
      bodyMaxHeight.value = `calc(100vh - var(--window-top) - 100rpx - 66rpx - 100rpx  + 88rpx - ${
        safeArea + 'px'
      })`;
    } else {
      bodyMaxHeight.value = `calc(100vh - var(--window-top) - 100rpx - 66rpx - 100rpx - ${
        safeArea + 'px'
      })`;
    }

    if (!newValue) {
      if (isNativeTabBar.value) {
        bodyMaxHeight.value = `calc(100vh - var(--window-top) - 88rpx - 100rpx  + 88rpx - ${
          safeArea + 'px'
        })`;
      } else {
        bodyMaxHeight.value = `calc(100vh - var(--window-top) - 88rpx - 100rpx - ${
          safeArea + 'px'
        })`;
      }
    }

    // #endif
  },
  { deep: true },
);

const bodyMaxHeight = ref(`calc(100vh - var(--window-top) - 100rpx - 172rpx)`);
if (!props.hasTabBar) {
  bodyMaxHeight.value = `calc(100vh - var(--window-top) - 172rpx)`;
}
// #ifndef H5
let safeArea = uni.getSystemInfoSync().safeAreaInsets?.bottom;
log('safeArea : ', safeArea);
log('isNativeTabBar : ', isNativeTabBar.value);
if (isNativeTabBar.value) {
  bodyMaxHeight.value = `calc(100vh - var(--window-top) - 172rpx - 100rpx + 88rpx - ${
    safeArea + 'px'
  })`;
} else {
  bodyMaxHeight.value = `calc(100vh - var(--window-top) - 172rpx - 100rpx - ${safeArea + 'px'})`;
}

// 没有顶部tabbar情况
if (!props.hasTabBar) {
  if (isNativeTabBar.value) {
    bodyMaxHeight.value = `calc(100vh - var(--window-top) - 172rpx + 88rpx - ${safeArea + 'px'})`;
  } else {
    bodyMaxHeight.value = `calc(100vh - var(--window-top) - 172rpx - ${safeArea + 'px'})`;
  }
}
// #endif

const initPageParam = () => {
  Object.assign(pager, { pageNum: 1, pageSize: 15, total: Infinity });
};

// 滚动到底监听
const scrolltolower = () => {
  log('到底了');
  log('到底了->当前搜索加载状态： isSearchUserListLoaded=', isSearchUserListLoaded.value);
  if (searchKeyword.value) {
    if (searchPager.total == 0) {
      return;
    }
    //如果正在加载中，不要再去触发
    if (!isSearchUserListLoaded.value) {
      log('到底了  --> 正在加载中不要重新触发加载  searchPager.pageNum-->', searchPager.pageNum);
      return;
    } else {
      log('到底了   --》 非加载中....', isSearchUserListLoaded.value);
    }
    isSearchUserListLoaded.value = false;
    if (searchPager.pageNum * searchPager.pageSize >= searchPager.total) {
      searchBottomLoadingState.value = 'nomore';
      searchShowNoMoreTip.value = true;
      isSearchUserListLoaded.value = true;
      return;
    }

    Object.assign(searchPager, {
      pageNum: searchPager.pageNum + 1,
    });
    searchBottomLoadingState.value = 'loading';
    searchShowNoMoreTip.value = true;
    actionTeachSearchByKeyword('append');
  } else {
    if (
      currentDepts &&
      currentDepts.children &&
      currentDepts.children.length == 0 &&
      userList &&
      userList.length == 0
    )
      return;
    if (pager.pageNum * pager.pageSize >= pager.total) {
      bottomLoadingState.value = 'nomore';
      isShowNoMoreTip.value = true;
      return;
    }
    Object.assign(pager, {
      pageNum: pager.pageNum + 1,
    });
    bottomLoadingState.value = 'loading';
    isShowNoMoreTip.value = true;
    fetchUserList(
      breadcrumb.length == 1 ? '' : currentDepts.id,
      currentDepts.locationId,
      'scrolltolower.滚动到底.加载更多',
    );
  }
};

onBeforeMount(() => {
  breadcrumb.push({ label: '组织架构', level: 0, deptId: '' });
  initPageParam();
});
const commonUserList = ref([]);
const organizationList = ref<any>([]);
const organizationListTotal = ref(0);
const getData = () => {
  let prams = searchKeyword.value
    ? {
        pageNum: 1,
        pageSize: 5,
        keyword: searchKeyword.value,
      }
    : {
        pageNum: 1,
        pageSize: 5,
      };

  commonUser(prams).then((res: any) => {
    organizationListTotal.value = res.total;
    if (searchKeyword.value) {
      searchCommonUserList.value = res.result;
    }
    commonUserList.value = res.result;
  });
  if (edu.value) {
    findSub().then(res => {
      organizationList.value = res;
    });
  }
};
onMounted(() => {
  log('teacher-search-onMounted');
  uni.$on('switchIdentitySuccess', switchIdentityThenInit);
  uni.$on('action-teach-search', handlesearch);
  console.log('=====================================onMounted');
  fetchDept('onMounted');
  getData();
});
onShow(() => {
  console.log('=====================================onShow222', edu.value);
  if (breadcrumb.length == 1) {
    userList.length = 0;
    fetchDept('onShow');
    getData();
  }
});
onHide(() => {
  if (breadcrumb.length == 1) {
    userList.length = 0;
  }
  pager.pageNum = 1;
});

onUnmounted(() => {
  pager.pageNum = 1;
  uni.$on('switchIdentitySuccess', switchIdentityThenInit);
  uni.$off('action-teach-search', handlesearch);
});

onReachBottom(async () => {
  log('下拉加载更多');
});

onBackPress(e => {
  log('onBackPress: ' + JSON.stringify(e));
  let contactTabIndex = uni.getStorageSync('contactTabIndex') || 0;
  if (contactTabIndex == 0) {
    // tab0不拦截
    return false;
  }
  if (breadcrumb.length == 1) {
    // 面包屑长度1不拦截
    return false;
  }
  // 返回处理面包屑返回
  handleBreadcrumbClick(breadcrumb.length - 2);
  return true;
});
//当前虚拟数据老师显示的内容
const virtualList = ref([]);
//当前老师列表页面
const pagingOfNormalStudent = ref(null as any);
//虚拟列表更新元素数据回调
const virtualListChange = vList => {
  virtualList.value = vList;
};
//触发查询日志
const queryList = (pageNo, pageSize) => {
  if (
    currentDepts &&
    currentDepts.children &&
    currentDepts.children.length == 0 &&
    userList &&
    userList.length == 0
  )
    return;

  log(
    'queryList [正常模式] 当前预加载  ' +
      pageNo +
      '   pageSize=' +
      pageSize +
      ' currentDepts.id=' +
      currentDepts.id +
      '   breadcrumb.length=' +
      breadcrumb.length,
  );
  Object.assign(pager, {
    pageNum: pageNo,
  });
  bottomLoadingState.value = 'loading';
  isShowNoMoreTip.value = true;
  /**
   * 页面载入，用户身份会触发加载，这边会触发重新加载
   */
  if (edu.value) {
    log(
      'queryList 进入局局通讯录加载' + jj_currentParentId.value + '  ' + jj_currentlocationId.value,
    );
    fetchUserList(
      jj_currentParentId.value === '0' ? '' : jj_currentParentId.value,
      jj_currentlocationId.value,
      'queryList.正常模式下.触发加载->局集.pageNum=' + pageNo,
    );
  } else {
    log('queryList 进入K12的通讯录加载');
    fetchUserList(
      breadcrumb.length === 1 ? '' : currentDepts.id,
      currentDepts.locationId,
      'queryList.正常模式下.触发加载.pageNum=' + pageNo,
    );
  }
};
/**
 * 搜索 -列表栏滚动
 */
const searchScrollEvt = e => {
  //log('[搜索列表]  滚动中.....');
  uni.hideKeyboard();
};

/**
 * 搜索 -列表栏滚动
 */
const commonUserListScrollEvt = e => {
  //log('[普通搜索]  滚动中.....');
  uni.hideKeyboard();
};
</script>

<style lang="scss" scoped>
.content-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: -9;
}
.icon-sex-size {
  width: 40rpx;
  height: 40rpx;
  margin-left: 16rpx;
}
.content {
  display: flex;
  flex-flow: column;

  .scroller-content {
    flex: 1;
    overflow: scroll;
  }
  .breadcrumb-content {
    padding-left: 32rpx;
    padding-right: 32rpx;
    background-color: white;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  }

  .shadow {
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
  }

  .scroll-view-x {
    width: 100%;
    height: 60rpx; //小程序要高度
    white-space: nowrap;
    padding: 0 0 16rpx 0;
    background-color: white;
    .breadcrumb-item {
      display: inline-block;

      .breadcrumb-label {
        font-size: 30rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 40rpx;
      }
    }
  }

  .contact-list-content {
    border-radius: 16rpx;
    margin: 1rpx 32rpx;
    background-color: white;
    padding: 0 32rpx;
    .contact-list-item {
      padding: 24rpx 0;
      height: 96rpx;
      display: flex;
      align-items: center;
      border-bottom: solid 1rpx var(--global-basic-color-split, #0000000f);
      .icon-organization {
        width: 48rpx;
        height: 48rpx;
      }

      .icon-head {
        width: 80rpx;
        height: 80rpx;
        will-change: transform;
        border-radius: 50%;
      }

      .contact-list-item-title {
        flex: 1;
        color: #000000e0;
        /* IOS/Body/Regular */
        font-family: PingFang SC;
        font-size: 32rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 48rpx; /* 141.176% */
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .contact-list-item-title-head-content {
        display: flex;
        flex-direction: column;
        margin-left: 32rpx;
        margin-right: 32rpx;
        flex: 1;

        .contact-list-item-title-center-content {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .contact-list-item-title-head {
          color: #000000e0;
          /* IOS/Body/Regular */
          font-family: PingFang SC;
          font-size: 32rpx;
          font-style: normal;
          font-weight: 400;
          line-height: 48rpx; /* 141.176% */
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 350rpx;
        }

        .contact-list-item-title-content {
          display: inline-block;
          color: #1677ff;
          /* IOS/Caption2/Regular */
          font-family: PingFang SC;
          font-size: 22rpx;
          font-style: normal;
          font-weight: 400;
          margin-top: 10rpx;
          padding: 4rpx 8rpx;
          border-radius: 8rpx;
          background-color: #e6f4ff;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: calc(25vw);
        }

        .contact-list-item-title-content-dept {
          padding-right: 8rpx;
          color: #00000073;
          font-family: PingFang SC;
          font-size: 26rpx;
          font-style: normal;
          font-weight: 400;
          margin-top: 5rpx;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: calc(25vw);
        }
      }

      .contact-list-item-right {
        color: #00000073;
        /* IOS/Body/Regular */
        font-family: PingFang SC;
        font-size: 34rpx;
        font-style: normal;
        font-weight: 400;
        line-height: 48rpx; /* 141.176% */
        margin-right: 16rpx;
      }
      .phone-wrap {
        padding: 16rpx;
        border-radius: 16rpx;
        border: 1px solid var(--global-basic-color-border, #1677ff);
      }
    }
  }
  .marB {
    margin-bottom: 24rpx;
  }
  .title-name1 {
    font-size: 32rpx;
    font-weight: 500;
    color: #000000e0;
    padding: 26rpx;
    background-color: #fff;
    border-radius: 16rpx 16rpx 0 0;
    margin: 0 -30rpx;
  }
  .title-name2 {
    font-size: 26rpx;
    font-weight: 400;
    color: #000000a6;
    padding: 26rpx 0;
  }
  .title-name3 {
    font-size: 30rpx;
    font-weight: 500;
    color: #1677ff;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .empty-tip {
    font-size: 32rpx;
    font-weight: 400;
    color: #00000073;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 48rpx;
    padding-top: 74rpx;
  }
}
.sticky-style {
  border-bottom: 1px solid #fff;
  box-shadow: 0px 2px 5px #ddd;
}

.empty-no-search-reslut {
  padding-bottom: 40rpx;
}
</style>
