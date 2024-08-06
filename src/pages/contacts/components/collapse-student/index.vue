<template>
  <view class="contact-content">
    <u-collapse
      v-if="list && list.length != 0"
      :accordion="isAccordion"
      :item-style="uCollapseItemStyle"
      :head-style="uCollapseHeadStyle"
      hover-class="none"
    >
      <u-collapse-item
        v-for="(item, index) in list"
        :ref="(el: any) => getCollapseItemRefList(el, index)"
        :id="'contact-collapse-item-' + index"
        :key="'contact-collapse-item-' + index"
        class="content-list"
        :style="{ marginBottom: (index == list.length - 1 ? 0 : 24) + 'rpx' }"
        :index="index"
        :open="item.isExpense"
        @change="itemChange"
      >
        <!-- 折叠板头部 -->
        <template #title-all>
          <view class="collapse-head-content">
            <text class="collapse-head-left-text">{{ item.collapseItem?.name }}</text>
            <text class="collapse-head-right-text"
              >学生数:{{
                item.collapseItem?.studentCount ? item.collapseItem?.studentCount : '0'
              }}</text
            >
            <u-icon
              color="#00000073"
              :class="{ 'u-arrow-down-icon-active': item.isExpense }"
              class="u-arrow-down-icon"
              name="arrow-down"
              size="28"
            ></u-icon>
          </view>
        </template>
        <!-- 展开的时候在显示, 性能优化点 -->
        <view v-if="item.isExpense">
          <!-- 折叠板内容 -->
          <view class="line" style="margin-left: 0" />
          <view class="collapse-item-body">
            <view v-if="!stateSearch" class="collapse-item-invite">
              <u-button
                :custom-style="uCollapseItemChildButtonStyle"
                @click="handleAddStu(item?.collapseItem)"
                >新增学生</u-button
              >
              <u-button
                style="margin-left: 16rpx"
                :custom-style="uCollapseItemChildButtonStyle"
                @click="invitePopAction(index, item.collapseItem)"
                >邀请家长</u-button
              >
              <u-button
                style="margin-left: 16rpx"
                :custom-style="uCollapseItemChildButtonStyle"
                @click="
                  classTableAction(item.collapseItem?.name || '', item.collapseItem?.id || '')
                "
                >课表</u-button
              >
              <view v-if="item.isShowLoading" :style="uCollapseItemLoaddingStyle">
                <u-loading mode="circle" size="60" :show="item.isShowLoading" />
              </view>
            </view>
            <!-- 学生信息 -->
            <view v-for="(stuItem, stuIndex) in item.childItems" :key="stuIndex">
              <view>
                <view v-if="!stateSearch" class="line" />
                <view
                  class="collapse-item-people"
                  @click="handleJump(stuItem.id + '', item.collapseItem?.id || '')"
                >
                  <view class="le">
                    <view
                      v-if="stuItem.imageUrl || stuItem.photoUrl"
                      class="avatar-size"
                      :style="{
                        backgroundImage: `url(${
                          stateSearch ? stuItem.photoUrl : stuItem.imageUrl
                        })`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                      }"
                    />
                    <view v-else class="avatar-default" />
                    <text class="name-style">{{ stuItem.name }}</text>
                    <image
                      v-if="stuItem.gender"
                      class="icon-sex-size"
                      :src="stuItem.gender == 1 ? icon_sex_man : icon_sex_female"
                    />
                  </view>
                  <u-icon v-if="false" name="arrow-right" color="#00000073" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </u-collapse-item>
    </u-collapse>
    <!-- <u-empty-custom
      v-if="list && list.length == 0 && emptyShown"
      text="暂无数据"
      model="list"
      class="content-empty"
    /> -->

    <view v-if="list && list.length == 0 && emptyShown" class="content-empty">
      <u-empty-custom v-show="true" mode="search" model="list" card="true" font-size="10" />
    </view>
  </view>
</template>
<script setup lang="ts">
import { IGetClazzListRtn, IStuContact, getclazzFile } from '@/services/contact';
import { contactStore } from '@/store/modules/contacts';
import { loginStore } from '@/store/modules/login';
import { IApplication } from '@/store/modules/workbench';
import { clearContactInfoCache } from '@/utils/cache-app';
import { goToApplicationFromMsg } from '@/utils/go-to-application';
import { debounce } from '@/utils/lodash-es';
import { log, showInfo } from '@/utils/tools';
import { PropType, computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import icon_sex_female from '/static/icon_sex_female.svg';
import icon_sex_man from '/static/icon_sex_man.svg';

interface IExpendData {
  id: string;
  show: boolean;
}

const emits = defineEmits(['oninvitePopShow', 'eventScrollIntoIndex']);

const props = defineProps({
  /** 是否入班申请 */
  hasApplyNotify: {
    type: Boolean,
    default: true,
  },
  /** 搜索时使用 */
  stateSearch: {
    type: Boolean,
    default: false,
  },
  list: {
    type: Array as PropType<Array<IStuContact>>,
    default: () => [],
  },
  emptyShown: {
    type: Boolean,
    default: false,
  },
});

// UI
const uCollapseItemStyle = computed(() => ({ backgroundColor: '#FFFFFF', borderRadius: '16rpx' }));
const uCollapseHeadStyle = computed(() => ({
  height: '96rpx',
  fontSize: '32rpx',
  fontWeight: '500',
  color: '#000000E0',
  padding: '0rpx 16rpx 0rpx 32rpx',
  marginTop: '23rpx',
}));
const uCollapseItemChildButtonStyle = computed(() => ({
  width: '140rpx',
  height: '64rpx',
  borderRadius: '16rpx',
  borderColor: '#176bfb',
  fontSize: '26rpx',
  fontWeight: '500',
  color: '#176bfb',
}));
const uCollapseItemLoaddingStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'right',
  padding: '0 16rpx',
}));

// store
const contactSt = contactStore();
const store = loginStore();

// 搜索不做折叠板
const accordingState = computed(() => !props.stateSearch);
// 是否折叠板手风琴模式(改成默认手风琴模式)
const isAccordion = ref(accordingState);
let lastExpendIndex = -1;
// 存放所有班级学生数据
const clzStudentsData = computed(() => props.list);

// 存放展开的数据
let expendSaveData = [] as IExpendData[];

// 判断当前人员是否有权限操作班级学生
const hasAuthOp = (item?: IGetClazzListRtn) => {
  log('hasAuthOp_clazzId : ', item);
  if (!item) return false;
  const { gradeId, sectionId } = item;
  // 在任课老师列表中
  // 在学段负责人列表中
  log('=====', contactSt.userAuthInfo);
  const sectionIdList = contactSt.userAuthInfo.sectionIdList;
  const inSectionIdList = sectionIdList.some(id => id === sectionId);
  // 在年段长列表中
  const gradeIdList = contactSt.userAuthInfo.gradeIdList;
  const inGradeIdList = gradeIdList.some(id => id === gradeId);
  // 在班主任列表中
  const masterList = contactSt.userAuthInfo.masterClazzIdList;
  const inMasterClazzIdList = masterList.some(id => id === item.id);
  return (
    contactSt.userAuthInfo.isAdmin ||
    contactSt.userAuthInfo.isNormalAdmin ||
    contactSt.userAuthInfo.isSchoolMaster ||
    inSectionIdList ||
    inGradeIdList ||
    inMasterClazzIdList
  );
};

const invitePopAction = async (inx: number, item?: IGetClazzListRtn) => {
  // uploadFileChoice();
  if (!hasAuthOp(item)) {
    showInfo('您是任课老师，无法操作该功能');
    return;
  }
  log('invitePopAction -> index : ' + inx + ', clazzId : ', item);
  emits('oninvitePopShow', inx, item?.id);
};

// 班级课表
const classTableAction = async (name: String, clazzId: string) => {
  const path = `/subPackages/curriculum/clazz-curriculum?id=${clazzId}&name=${name}`;
  const params = { path: path } as IApplication;
  goToApplicationFromMsg(params);
};

let currentExpendIndex = 0;
const collapseRefs = ref(null as any);

const collapseItemRefList = ref<any[]>([]);
const getCollapseItemRefList = (el: any, index: number) => {
  if (el) {
    collapseItemRefList.value[index] = el;
  }
};

const handleJump = (id: string, clazzId: string) => {
  uni.navigateTo({
    url: `/app-platform/contacts/student-detail?id=${id}&clazzId=${clazzId}`,
  });
};

const handleAddStu = (item?: IGetClazzListRtn) => {
  if (!hasAuthOp(item)) {
    showInfo('您是任课老师，无法操作该功能');
    return;
  }
  uni.navigateTo({
    url: `/app-platform/contacts/add-student/index?id=${item?.id}&name=${item?.name}&type=add`,
  });
};

const itemChange = (changeInfo: any) => {
  log('itemChange -> index: ' + changeInfo.index + ', show : ' + changeInfo.show);
  const { index, show } = changeInfo;
  currentExpendIndex = index;
  // Object.assign(props.list[index].isExpense, show);
  const id = props.list[index].collapseItem?.id || '';
  // 更新当前item打开状态
  props.list[index].isExpense = changeInfo.show;
  // 需要先queryRect让loading部分出来
  nextTick(() => {
    collapseItemRefList.value[index]?.queryRect(); // 性能更好
  });
  // 如果是手风琴模式，设置上次展开的item index
  if (isAccordion.value && index != lastExpendIndex && lastExpendIndex >= 0) {
    props.list[lastExpendIndex].isExpense = !changeInfo.show;
    lastExpendIndex = index;
  }
  // 保存Item展开状态
  if (
    !expendSaveData.some(item => {
      if (item.id == id) {
        item.show = show;
        return true;
      }
    })
  ) {
    expendSaveData.push({ id: id, show: show });
  }

  const saveId = show ? id : '';
  log('itemChange -> save-class-id : ', saveId);
  debounceLoad(saveId, show, index, id);
};

// 延迟加载学生列表，让collapse动画执行
const debounceLoad = debounce(function (saveId: string, show: boolean, index: number, id: string) {
  setItemExpendState(saveId, show);
  // 展示且没有数据才去加载数据
  if (show && (!props.list[index].childItems || props.list[index].childItems?.length == 0)) {
    // part loading
    fetchClazzFilePartLoading(true, id);
    fetchClazzFile(index, id, false)
      .then()
      .finally(() => fetchClazzFilePartLoading(false, id));
  } else {
    // itemRefs[index]?.el?.queryRect();
    // collapseRefs.value.init();
    if (show) {
      // 保证手风琴模式下能够显示出当前打开的项
      updateScrollInto(index);
      // 静默加载数据如果有不同的补充
      fetchClazzFileSilent(index, id)
        .then()
        .finally(() => {});
    }
  }
}, 200);

/**Loading控制 */
const fetchClazzFilePartLoading = (isLoading: boolean, id: string) => {
  // 设置对应折叠板局部loading状态
  props.list.some(item => {
    if (id == item.collapseItem?.id) {
      item.isShowLoading = isLoading;
      return true;
    } else {
      return false;
    }
  });
};

const fetchClazzFileSilent = async (index: number, id: string) => {
  log('fetchClazzFileSilent');
  const res = await getclazzFile(id, false);
  log('fetchClazzFileSilent -> res : ', res);
  if (res && res.studentResps && res.studentResps.length > 0) {
    // 做一个人员数量限制（100条限制）
    if (res.studentResps.length > 100) {
      res.studentResps = res.studentResps.slice(0, 100);
    }
    // 班级数据
    props.list.some((item: any) => {
      if (id == item.collapseItem?.id) {
        log('开始判断更新');
        if (item.childItems && item.childItems.length != res.studentResps.length) {
          log('当前班级学生列表与请求到的学生列表数不一致');
          item.childItems = res;
          // 更新折叠板
          nextTick(() => {
            collapseItemRefList.value[index]?.queryRect(); // 性能更好
          });
        } else {
          let arr2 = [...item.childItems].filter(x =>
            [...res.studentResps].every(y => y.name != x.name || y.gender != x.gender),
          ); // 差集
          log('当前班级学生列表与请求到的学生列表数一致, 计算差集 : ', arr2);
          // 如果存在差集，更新数据
          if (arr2 && arr2.length > 0) {
            item.childItems = res;
            // 更新折叠板
            nextTick(() => {
              collapseItemRefList.value[index]?.queryRect(); // 性能更好
            });
          }
        }
        return true;
      }
    });
  }
};

const fetchClazzFile = async (index: number, id: string, firstLoad: boolean) => {
  try {
    const res = await contactSt.getStuListData(id);
    // 如果超过20条数据，先展示20条，滚动后再展示剩余的

    props.list.some((item: any) => {
      if (id == item.collapseItem?.id) {
        item.childItems = res;
        return true;
      }
    });

    nextTick(() => {
      collapseItemRefList.value[index]?.queryRect(); // 性能更好
      updateScrollInto(index);
    });
    // collapseRefs.value.init();
  } catch (e: any) {
    log('fetchClazzFile -> 获取班级对应的学生列表出错：', e);
  }
};

/**
 * scroll-view滚动到具体位置
 * @param inx
 */
const updateScrollInto = (inx: number) => {
  emits('eventScrollIntoIndex', 'contact-collapse-item-' + inx);
};

/**
 * 保存折叠状态，下次进来使用最后一次折叠状态
 * @param id
 * @param isShow
 */
const setItemExpendState = (id: string, isShow: boolean) => {
  try {
    if (isShow) {
      uni.setStorage({ key: 'expend', data: id });
    } else {
      const expendItems = expendSaveData.filter(item => item.show);
      if (expendItems && expendItems.length > 0) {
        uni.setStorage({ key: 'expend', data: expendItems[expendItems.length - 1].id });
      }
    }
  } catch (error) {
    log('setItemExpendState -> error : ' + error);
  }
};

/**首次加载 */
const handleFirstFetchClazzFile = (options: any) => {
  log('handleFirstFetchClazzFile');
  // 上次展开的班级Id
  const { expendClzId, expendIndex } = options;
  try {
    log('handleFirstFetchClazzFile -> expendClzId : ', expendClzId);
    log('handleFirstFetchClazzFile -> expendIndex : ', expendIndex);
    // 手风琴模式保存上次展开的index
    log(
      'handleFirstFetchClazzFile -> isAccordion : ' +
        isAccordion.value +
        ', lastExpendIndex : ' +
        lastExpendIndex,
    );
    if (isAccordion.value) {
      lastExpendIndex = expendIndex;
    }
    currentExpendIndex = expendIndex;
    // 首次加载学生列表
    fetchClazzFilePartLoading(true, expendClzId);
    fetchClazzFile(expendIndex, expendClzId, true)
      .then()
      .finally(() => fetchClazzFilePartLoading(false, expendClzId));
  } catch (error) {
    log('handleFirstFetchClazzFile -> error : ', error);
    fetchClazzFilePartLoading(false, expendClzId);
  }
};

/**更新完学生后需要更新学生数 */
const handleUpdateStuCallback = async (options: any) => {
  const { id } = options;
  log('handleUpdateStuCallback -> id :', id);
  try {
    // 重新加载班级下的学生
    fetchClazzFilePartLoading(true, id);
    await fetchClazzFile(currentExpendIndex, id, true);
    fetchClazzFilePartLoading(false, id);
  } catch (error) {
    fetchClazzFilePartLoading(false, id);
  }
};

/**添加完学生后需要更新学生数 */
const handleAddStuCallback = async (options: any) => {
  const { id } = options;
  try {
    // 更新班级学生数
    props.list.some((item: any) => {
      if (id == item.collapseItem?.id) {
        item.collapseItem = {
          ...item.collapseItem,
          studentCount: item.collapseItem.studentCount + 1,
        };
        return true;
      }
    });
    // 重新加载班级下的学生
    fetchClazzFilePartLoading(true, id);
    await fetchClazzFile(currentExpendIndex, id, true);
    fetchClazzFilePartLoading(false, id);
  } catch (error) {
    fetchClazzFilePartLoading(false, id);
  }
};

const handleDelStuCallback = async (options: any) => {
  const { id } = options;
  try {
    let studentCount = 0;
    // 更新班级学生数
    props.list.some((item: any) => {
      if (id == item.collapseItem?.id) {
        studentCount = item.collapseItem.studentCount - 1;
        item.collapseItem = {
          ...item.collapseItem,
          studentCount: studentCount,
        };
        return true;
      }
    });
    // 学生数为0时，需要清下缓存
    if (studentCount <= 0) {
      log(
        'handleDelStuCallback ---> studentCount : ' +
          studentCount +
          ', action clearContactInfoCache',
      );
      clearContactInfoCache();
    }
    // 重新加载班级下的学生
    fetchClazzFilePartLoading(true, id);
    await fetchClazzFile(currentExpendIndex, id, true);
    fetchClazzFilePartLoading(false, id);
  } catch (error) {
    fetchClazzFilePartLoading(false, id);
  }
};

onMounted(() => {
  uni.$on('fetchClazzFile', handleFirstFetchClazzFile);
  uni.$on('addStuCallback', handleAddStuCallback);
  uni.$on('delStuCallback', handleDelStuCallback);
  uni.$on('updateStuCallback', handleUpdateStuCallback);
});

onUnmounted(() => {
  uni.$off('fetchClazzFile', handleFirstFetchClazzFile);
  uni.$off('addStuCallback', handleAddStuCallback);
  uni.$off('delStuCallback', handleDelStuCallback);
  uni.$off('updateStuCallback', handleUpdateStuCallback);
});
</script>
<style scoped lang="scss">
.content-empty {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.contact-content {
  padding: 1rpx 32rpx;

  .collapse-head-content {
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: space-between; /* 水平居中 */
    align-items: center; /* 垂直居中 */

    .collapse-head-left-text {
      flex: 1;
      font-size: 32rpx;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
    }

    .collapse-head-right-text {
      margin-right: 20rpx;
      font-size: 30rpx;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);
    }
  }

  .content-list {
    background-color: white;
    border-radius: 16rpx;
    margin-top: 23rpx;
    // margin-bottom: 24rpx;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04);
  }

  .collapse-item-body {
    .collapse-item-invite {
      display: flex;
      width: 0;
      padding: 16rpx 32rpx;
      .button-custom-style {
        color: $ui-color-primary;
        font-size: 26rpx;
        font-weight: 500;
        width: 140rpx;
        height: 64rpx;
        border: 2rpx var(--global-primary-color-primary-base, $ui-color-primary);
      }
    }

    .collapse-item-people {
      padding: 24rpx 32rpx;
      display: flex;
      justify-content: space-between; /* 水平居中 */
      align-items: center; /* 垂直居中 */

      .le {
        flex: 1;
        display: flex;
        align-items: center; /* 垂直居中 */
        .avatar-size {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          box-shadow: 0px 0px 1.333px 0.333px rgba(0, 0, 0, 0.04) inset;
        }
        .name-style {
          max-width: 70%;
          color: rgba(0, 0, 0, 0.88);
          font-size: 32rpx;
          font-weight: 400;
          margin-left: 32rpx;
          margin-right: 16rpx;
        }
        .icon-sex-size {
          width: 40rpx;
          height: 40rpx;
        }
      }
    }
  }
}

.u-arrow-down-icon {
  transition: all 0.3s;
  margin-right: 20rpx;
  margin-left: 14rpx;
}

.u-arrow-down-icon-active {
  transform: rotate(180deg);
  transform-origin: center center;
}

.line {
  width: 100%;
  height: 1rpx;
  flex-shrink: 0;
  margin-left: 32rpx;
  border-radius: var(--radius-radius-none, 0);
  background: var(--global-basic-color-split, #0000000f);
}

.avatar-default {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  box-shadow: 0px 0px 1.333px 0.333px rgba(0, 0, 0, 0.04) inset;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzQ4MzdfMjA4MTIpIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNCQUUwRkYiLz4KPHBhdGggZD0iTTIzLjc1IDIxLjExMTNIMTYuMjVMMTUuNjgzNyAyNS4zOTAxQzE1LjU1NTEgMjYuMzYxNiAxNC44MDE5IDI3LjEyMzggMTMuODQ3MSAyNy4zNDQzQzguMzE2MzYgMjguNjIxOSA0LjQ0NDQ2IDMxLjU2OTEgNC40NDQ0NiAzNS4wMDAyQzQuNDQ0NDYgMzkuNjAyMSA0LjQ0NDQ2IDQzLjMzMzUgMjAgNDMuMzMzNUMzNS41NTU2IDQzLjMzMzUgMzUuNTU1NiAzOS42MDIxIDM1LjU1NTYgMzUuMDAwMkMzNS41NTU2IDMxLjU2OTEgMzEuNjgzNyAyOC42MjE5IDI2LjE1MyAyNy4zNDQzQzI1LjE5ODEgMjcuMTIzOCAyNC40NDQ5IDI2LjM2MTYgMjQuMzE2MyAyNS4zOTAxTDIzLjc1IDIxLjExMTNaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfNDgzN18yMDgxMikiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNi4xMjgzIDIwLjk3MjdIMjMuODcxN0wyNC40NTQgMjUuMzcyMUMyNC41NzQzIDI2LjI4MDkgMjUuMjgwNSAyNy4wMDA0IDI2LjE4NDIgMjcuMjA5MkMyOC45NjM4IDI3Ljg1MTMgMzEuMzM1MiAyOC45MTQ3IDMzLjAxNDkgMzAuMjU2NEMzNC42OTQzIDMxLjU5NzggMzUuNjk0NCAzMy4yMjg1IDM1LjY5NDQgMzUuMDAwNFYzNS4wMjU1QzM1LjY5NDUgMzcuMzA1OSAzNS42OTQ1IDM5LjQ1MjcgMzMuNjk2MiA0MS4wMDI1QzMyLjcwMDEgNDEuNzc1MSAzMS4yMTgxIDQyLjM5MTMgMjkuMDE5MyA0Mi44MTUyQzI2LjgxOTggNDMuMjM5MiAyMy44OTM0IDQzLjQ3MjcgMjAgNDMuNDcyN0MxNi4xMDY2IDQzLjQ3MjcgMTMuMTgwMiA0My4yMzkyIDEwLjk4MDYgNDIuODE1MkM4Ljc4MTkgNDIuMzkxMyA3LjI5OTg5IDQxLjc3NTEgNi4zMDM3NiA0MS4wMDI1QzQuMzA1NDkgMzkuNDUyNyA0LjMwNTUyIDM3LjMwNTkgNC4zMDU1NCAzNS4wMjU1TDQuMzA1NTQgMzUuMDAwNEM0LjMwNTU0IDMzLjIyODUgNS4zMDU3IDMxLjU5NzggNi45ODUwNCAzMC4yNTY0QzguNjY0NzkgMjguOTE0NiAxMS4wMzYyIDI3Ljg1MTMgMTMuODE1OCAyNy4yMDkyQzE0LjcxOTUgMjcuMDAwNCAxNS40MjU3IDI2LjI4MDkgMTUuNTQ2IDI1LjM3MjFMMTYuMTI4MyAyMC45NzI3Wk0xNi4zNzE3IDIxLjI1MDRMMTUuODIxNCAyNS40MDg1QzE1LjY4NDUgMjYuNDQyNiAxNC44ODQyIDI3LjI0NzUgMTMuODc4MyAyNy40Nzk5QzExLjEyNzIgMjguMTE1MyA4Ljc5NzI3IDI5LjE2NDMgNy4xNTg0IDMwLjQ3MzRDNS41MTkxMSAzMS43ODI4IDQuNTgzMzIgMzMuMzQxMyA0LjU4MzMyIDM1LjAwMDRDNC41ODMzMiAzNy4zMTI1IDQuNTkwNyAzOS4zMjI0IDYuNDc0IDQwLjc4M0M3LjQyMjMxIDQxLjUxODYgOC44NTY5NiA0Mi4xMjI5IDExLjAzMzIgNDIuNTQyNEMxMy4yMDg3IDQyLjk2MTggMTYuMTE1NiA0My4xOTQ5IDIwIDQzLjE5NDlDMjMuODg0MyA0My4xOTQ5IDI2Ljc5MTMgNDIuOTYxOCAyOC45NjY3IDQyLjU0MjRDMzEuMTQzIDQyLjEyMjkgMzIuNTc3NyA0MS41MTg2IDMzLjUyNiA0MC43ODNDMzUuNDA5MyAzOS4zMjI0IDM1LjQxNjcgMzcuMzEyNSAzNS40MTY3IDM1LjAwMDRDMzUuNDE2NyAzMy4zNDEzIDM0LjQ4MDkgMzEuNzgyOCAzMi44NDE2IDMwLjQ3MzRDMzEuMjAyNyAyOS4xNjQzIDI4Ljg3MjggMjguMTE1MyAyNi4xMjE3IDI3LjQ3OTlDMjUuMTE1OCAyNy4yNDc1IDI0LjMxNTUgMjYuNDQyNiAyNC4xNzg2IDI1LjQwODVMMjMuNjI4MyAyMS4yNTA0SDE2LjM3MTdaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjcuMjIyMiAxNS43NDY3QzI3LjIyMjIgMjAuNDIyNSAyNC4zNDggMjUuNTU1MSAyMC4yNjc1IDI1LjU1NTFDMTYuMTg3IDI1LjU1NTEgMTIuNzc3OCAyMC40MjI1IDEyLjc3NzggMTUuNzQ2N0MxMi43Nzc4IDExLjY4MzkgMTUuNjUyIDcuNzc3MzQgMTkuNzMyNSA3Ljc3NzM0QzIzLjgxMyA3Ljc3NzM0IDI3LjIyMjIgMTEuNjgzOSAyNy4yMjIyIDE1Ljc0NjdaIiBmaWxsPSJ3aGl0ZSIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzQ4MzdfMjA4MTIpIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMC4yNjc1IDI1LjU1NTVDMjQuMzQ4IDI1LjU1NTUgMjcuMjIyMiAyMC40MjI5IDI3LjIyMjIgMTUuNzQ3MUMyNS43MDMgMjMuMTE3NyAyMC41NTU1IDI3LjIyMjIgMTYuMDI4NCAyMy42MTExQzE3LjI0MDUgMjQuODAyNyAxOC43MDQ3IDI1LjU1NTUgMjAuMjY3NSAyNS41NTU1WiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzQ4MzdfMjA4MTIpIi8+CjwvZz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzQ4MzdfMjA4MTIiIHg9IjE1LjQ3MjkiIHk9IjE1LjE5MTUiIHdpZHRoPSIxMi4zMDQ5IiBoZWlnaHQ9IjEwLjkxOTciIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0ic2hhcGUiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMC4yNzc3NzgiIHJlc3VsdD0iZWZmZWN0MV9mb3JlZ3JvdW5kQmx1cl80ODM3XzIwODEyIi8+CjwvZmlsdGVyPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfNDgzN18yMDgxMiIgeDE9IjIwIiB5MT0iMjEuMTExMyIgeDI9IjIwIiB5Mj0iNDMuMzMzNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuMTAwMzY2IiBzdG9wLWNvbG9yPSIjRTZFRUY1Ii8+CjxzdG9wIG9mZnNldD0iMC4zNTI2IiBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjAuNzExNzMzIiBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNFNkVFRjUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzQ4MzdfMjA4MTIiIHgxPSIyNS41NTU1IiB5MT0iMTYuNjY2NiIgeDI9IjIzLjYxMTEiIHkyPSIyNS41NTU1IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IndoaXRlIi8+CjxzdG9wIG9mZnNldD0iMC45ODEwMDYiIHN0b3AtY29sb3I9IiNFNkVFRjUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF80ODM3XzIwODEyIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==');
  background-repeat: no-repeat;
  background-size: cover;
}

:deep(.u-collapse-head) {
  font-size: 32rpx;
  font-weight: 500;
  padding: 24rpx 32rpx;
}
:deep(.u-border-bottom:after) {
  border-bottom: 0;
}
</style>
