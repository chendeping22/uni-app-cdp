<template>
  <page
    :empty="
      !isFetching && !currentLayered?.children?.length && !currentLayered?.subChildren?.length
    "
  >
    <view class="top-panel">
      <view class="searchbar">
        <u-search
          v-model="_searchKey"
          placeholder="搜索"
          shape="square"
          height="72"
          clearabled
          :show-action="false"
          @search="handleSearchKeyChange"
          @clear="handleSearchKeyChange"
        ></u-search>
      </view>
      <view v-if="selectorType === SelectorTypeEnum.location && !searchKey">
        <u-dropdown>
          <u-dropdown-item
            :title="currentSchoolGradeTypeOption.label"
            :options="schoolGradeTypeOptions"
            @change="handleOnSchoolGradeChange"
          ></u-dropdown-item>
          <u-dropdown-item
            :title="currentSchoolTypeOption.label"
            :options="schoolTypeOptions"
            @change="handleOnSchoolChange"
          ></u-dropdown-item>
        </u-dropdown>
      </view>
      <view
        v-if="!showSearchContent && selectorType !== SelectorTypeEnum.location"
        class="breadcrumbs"
      >
        <scroll-view
          v-if="layered.length && layered[0].name"
          scroll-x
          style="width: 100%; white-space: nowrap"
        >
          <view
            v-for="(item, index) in layered"
            :key="item.id"
            class="breadcrumbs__item subheadline-regular"
          >
            <text v-if="index" style="padding: 0 4px">/</text>
            <text v-if="index === layered.length - 1">{{ item.name }}</text>
            <view
              v-else
              class="breadcrumbs__item breadcrumbs__item__clickable"
              @click="handleBreadcrumbsClick(index)"
              >{{ item.name }}</view
            >
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="content body-regular">
      <scroll-view scroll-y style="height: 100%">
        <view style="height: 24rpx"></view>
        <!-- 全选模块 -->
        <view v-if="showSelectAll" style="margin-bottom: 24rpx">
          <u-cell-group :border="false">
            <cell-item
              :selector-type="selectorType"
              checkable
              disabled-icon
              :node="({ name: '全选' } as Layered)"
              :selected="isSelectAll"
              @check="handleSelectAll"
              @click="handleSelectAll"
            ></cell-item>
          </u-cell-group>
        </view>
        <!-- 非搜索列表 -->
        <template v-if="!showSearchContent">
          <view>
            <u-cell-group v-if="currentLayered?.children?.length" :border="false">
              <cell-item
                v-for="id in currentLayered.children"
                :selector-type="selectorType"
                :key="id"
                :node="nodes[id] || {}"
                :checkable="
                  nodes[id].isCheckbox !== false &&
                  (nodes[id].level === mainSelectorLevel || !!isScope)
                "
                :selected="!!selected[id]"
                :selected-type="isMultiple ? 'multiple' : 'single'"
                :disabled="disabledItemIds.includes(id)"
                :entity-type="entityType"
                @check="handleLayeredItemCheck"
                @click="handleLayeredItemClick"
                @drill="handleLayeredItemDrill"
              >
              </cell-item>
            </u-cell-group>
          </view>
          <view style="margin-top: 24rpx">
            <u-cell-group v-if="currentLayered?.subChildren?.length" :border="false">
              <cell-item
                v-for="id in currentLayered.subChildren"
                :selector-type="selectorType"
                :key="id"
                :node="nodes[id] || {}"
                :checkable="nodes[id].isCheckbox !== false && !!isScope"
                :selected="!!selected[id]"
                :selected-type="isMultiple ? 'multiple' : 'single'"
                :disabled="disabledItemIds.includes(id)"
                :entity-type="entityType"
                @check="handleLayeredItemCheck"
                @click="handleLayeredItemClick"
                @drill="handleLayeredItemDrill"
              >
              </cell-item>
            </u-cell-group>
          </view>
        </template>
        <!-- 搜索列表 -->
        <template v-else>
          <template v-if="isSearching"></template>
          <view v-else-if="searchContent.length === 0">
            <empty mode="search"></empty>
          </view>
          <template v-else>
            <view style="margin-top: 24rpx">
              <u-cell-group :border="false">
                <cell-item
                  v-for="id in searchContent"
                  :selector-type="selectorType"
                  :key="id"
                  :node="nodes[id] || {}"
                  :checkable="
                    nodes[id].isCheckbox !== false &&
                    (nodes[id].level === mainSelectorLevel || !!isScope)
                  "
                  :selected="!!selected[id]"
                  :selected-type="isMultiple ? 'multiple' : 'single'"
                  :disabled="disabledItemIds.includes(id)"
                  :entity-type="entityType"
                  @check="handleLayeredItemCheck"
                  @click="handleLayeredItemClick"
                >
                  <template #right-icon> <view /></template>
                </cell-item>
              </u-cell-group>
            </view>
          </template>
        </template>
        <view style="height: 24rpx"></view>
      </scroll-view>
    </view>
    <view v-if="isMultiple" class="toolbar body-regular">
      <view v-if="!useBlockButton" @click="showSelectedPanel = !!count">
        <text v-if="typeof count === 'number'">已选（{{ count }}）</text>
      </view>
      <view :style="{ width: useBlockButton ? '100%' : undefined }">
        <u-button
          type="primary"
          :style="{ width: useBlockButton ? '100%' : undefined }"
          @click="handleConfirmClick"
          >确定
          <text v-if="useBlockButton && count > 0">（{{ count }}）</text>
        </u-button>
      </view>
    </view>
    <u-popup
      v-if="isMultiple"
      v-model="showSelectedPanel"
      mode="bottom"
      height="70%"
      closeable
      safe-area-inset-bottom
      border-radius="8"
    >
      <view style="height: 48px; line-height: 48px; padding: 0 1rem; text-align: center">
        <text>已选（{{ count }}）</text>
      </view>
      <scroll-view scroll-y style="height: calc(100% - 48px)" class="popup-content">
        <template v-if="count">
          <template v-for="(items, _level) in selectedByLevelGroup" :key="_level">
            <u-cell-group v-if="items.length" :border="false" style="padding-top: 12px">
              <cell-item
                v-for="item in items"
                :selector-type="selectorType"
                :key="item.id"
                :node="item"
                :entity-type="entityType"
                :disabled="disabledItemIds.includes(item.id)"
                :description-prefix="isAcrossLocation ? item.locationName : ''"
              >
                <template #right-icon>
                  <view @click.stop="handleLayeredItemDelete(item)">
                    <u-icon name="close-circle-fill" size="32" color="#909399"></u-icon>
                  </view>
                </template>
              </cell-item>
            </u-cell-group>
          </template>
        </template>
      </scroll-view>
    </u-popup>
    <view class="u-fixed-placeholder safe-area-inset-bottom" style="background-color: #fff"></view>
  </page>
</template>
<script setup lang="ts">
import {
  DeviceItemLevelEnum,
  LocationScopeEnum,
  PersonItemLevelEnum,
  SelectorTypeEnum,
  StudentItemLevelEnum,
} from '@/components/selector/types';
import empty from '@/components/u-empty-custom/u-empty-custom.vue';
import { loginStore } from '@/store/modules/login';
import { debounce } from '@/utils/lodash-es';
import { onLoad } from '@dcloudio/uni-app';
import { computed, onBeforeUnmount, ref, shallowRef, triggerRef, unref, watch } from 'vue';
import CellItem from './Item.vue';
import {
  fetchGradeClass,
  fetchLocationDepartments,
  fetchLocationPersons,
  fetchLocationRelationship,
  fetchLocationRoles,
  fetchLocationStudents,
  fetchPosition,
  fetchSpace,
  fetchSpaceDevice,
  fetchStudents,
  fetchUsers,
  filterLocationPerson,
  filterStudents,
} from './services';
import {
  EntityType,
  Layered,
  LocationLevel,
  SchoolGradeTypeOptions,
  SchoolTypeOptions,
} from './types';

const { userInfo } = loginStore();
const pages = getCurrentPages();
const p = pages[pages.length - 1] as any;
const eventChannel = p.getOpenerEventChannel();
const isFetching = ref(true);
const isMultiple = ref(1);
const scopeType = ref<LocationScopeEnum | StudentItemLevelEnum>(LocationScopeEnum.all);
const disabledItemIds = ref<string[]>([]);
const selectorType = ref<SelectorTypeEnum>();
/** 选择的类型 */
const entityType = ref<EntityType>();

// search
const isSearching = ref<boolean>(false);
const _searchKey = ref<string>();
const searchKey = ref<string>();
const searchContent = ref<string[]>([]);
const showSearchContent = ref(false);
const currentSchoolTypeOption = { label: '公立/私立', value: -1 };
const schoolTypeOptions = [{ label: '公立/私立', value: -1 }, ...SchoolTypeOptions];
const currentSchoolGradeTypeOption = { label: '全部学段', value: -1 };
const schoolGradeTypeOptions = [{ label: '全部学段', value: -1 }, ...SchoolGradeTypeOptions];

// 主要选择level
const mainSelectorLevel = shallowRef<
  PersonItemLevelEnum | StudentItemLevelEnum | SelectorTypeEnum | DeviceItemLevelEnum
>();
const layered = shallowRef<Layered[]>([]);
const selected = shallowRef<{ [key: string]: any }>({});
const currentLayered = computed(() => {
  return layered.value[layered.value.length - 1];
});
const count = computed(() => Object.keys(selected.value)?.length || 0);
const showSelectedPanel = ref(false);
// 所有的节点数据
const nodes = shallowRef<Record<string, Layered>>({});

const selectedByLevelGroup = computed(() => {
  const _result: { [key: string]: any } = {
    users: [],
    others: [],
  };

  Object.values(selected.value).forEach((item: any) => {
    if (item.level === PersonItemLevelEnum.user || item.level === StudentItemLevelEnum.student) {
      _result.users.push(item);
    } else {
      _result.others.push(item);
    }
  });

  return _result;
});

/** 当前层级可选的项目列表 */
const currentLayeredSelectableItems = computed(() => {
  let ids: string[] = [];
  if (showSearchContent.value) {
    ids = searchContent.value;
  } else if (currentLayered.value) {
    ids = ids.concat(
      currentLayered.value.children || [],
      isScope.value ? currentLayered.value.subChildren || [] : [],
    );
  }

  let result: string[] = [];
  ids.forEach(id => {
    if (
      !nodes.value[id].disabled &&
      nodes.value[id].isCheckbox !== false &&
      !disabledItemIds.value.includes(id)
    ) {
      result.push(id);
    }
  });

  return result;
});

const showSelectAll = computed(() => {
  if ([SelectorTypeEnum.position].includes(selectorType.value!)) {
    return false;
  }

  return isMultiple.value && currentLayeredSelectableItems.value.length;
});

const isSelectAll = computed(() => {
  if (!isMultiple.value) {
    return false;
  }
  if (Object.keys(selected.value).length === 0) {
    return false;
  }

  const items = currentLayeredSelectableItems.value;
  if (items.length) {
    const len = items.length;
    for (let i = 0; i < len; i += 1) {
      const id = items[i];
      if (!selected.value[id]) {
        return false;
      }
    }
    return true;
  }
  return false;
});

/** 是否范围选择，该状态父级节点也可以选择 */
const isScope = computed(() =>
  [
    SelectorTypeEnum.personScope,
    SelectorTypeEnum.acrossLocationPersonScope,
    SelectorTypeEnum.studentScope,
    SelectorTypeEnum.acrossLocationStudentScope,
    SelectorTypeEnum.gradeClass,
    SelectorTypeEnum.deviceScope,
    SelectorTypeEnum.personRole,
  ].includes(selectorType.value!),
);
/** 是否跨组织 */
const isAcrossLocation = computed(() =>
  [
    SelectorTypeEnum.acrossLocationPerson,
    SelectorTypeEnum.acrossLocationPersonScope,
    SelectorTypeEnum.acrossLocationStudent,
    SelectorTypeEnum.acrossLocationStudentScope,
  ].includes(selectorType.value!),
);

const useBlockButton = computed(() =>
  [SelectorTypeEnum.location, SelectorTypeEnum.position].includes(selectorType.value!),
);

const formatFetchDataRecursive = (
  data: any[],
  result: any,
  childrenMap: string[],
  subChildrenMap: string[],
  childrenKey = 'children',
  parentId = '',
) => {
  data.forEach(item => {
    const children: string[] = [];
    const subChildren: string[] = [];
    if (item[childrenKey]) {
      formatFetchDataRecursive(
        item[childrenKey],
        result,
        children,
        subChildren,
        childrenKey,
        item.id,
      );
    }

    result[item.id] = {
      id: item.id,
      name: item.name,
      isCheckbox: item.isCheckbox,
      locationName: item.locationName,
      // 选择部门服务端返回的 level 值不对，需要重置
      level:
        selectorType.value === SelectorTypeEnum.department
          ? PersonItemLevelEnum.department
          : item.level || 0,
      parentId,
      children,
      subChildren,
    };
    if (item.jobNo) result[item.id]['jobNo'] = item.jobNo;
    if (item.phoneNumber) result[item.id]['phone'] = item.phoneNumber;
    if (item.firstLetter) result[item.id]['firstLetter'] = item.firstLetter;

    if (item.hasOwnProperty('schoolType') || item.hasOwnProperty('schoolGradeList')) {
      result[item.id]['schoolType'] = item.schoolType ? Number(item.schoolType) : undefined;
      result[item.id]['schoolGradeList'] = item.schoolGradeList || [];
    }

    /** 回填补全已选项内容 */
    if (selected.value[item.id] && !selected.value[item.id].name) {
      selected.value = {
        ...selected.value,
        [item.id]: result[item.id],
      };
    }
    // 选择空间 选择部门 全部可选
    if (
      [SelectorTypeEnum.space, SelectorTypeEnum.department, SelectorTypeEnum.position].includes(
        selectorType.value!,
      )
    ) {
      childrenMap.push(item.id);
    } else if (
      isAcrossLocation.value &&
      (item.level === PersonItemLevelEnum.location || item.level === StudentItemLevelEnum.location)
    ) {
      /** 组织层级 */
      result[item.id].hasFetched = false;
      childrenMap.push(item.id);
    } else if (selectorType.value === SelectorTypeEnum.location) {
      result[item.id].hasFetched = true;
      childrenMap.push(item.id);
    } else if (item.level !== mainSelectorLevel.value) {
      if (children.length || subChildren.length || isScope.value) {
        subChildrenMap.push(item.id);
      }
    } else if (item.level === mainSelectorLevel.value) {
      childrenMap.push(item.id);
    }
  });
};

const formatNodesData = (data: any[], childrenKey?: string) => {
  const result = {};
  const children: string[] = [];
  const subChildren: string[] = [];
  formatFetchDataRecursive(data, result, children, subChildren, childrenKey);
  nodes.value = result;
  // console.debug(children, subChildren, nodes.value, Object.keys(nodes.value).length);
  return { children, subChildren };
};

const acceptDataFromSelectorComponent = (data: {
  selectedValue: { [key: string]: any };
  disabledItemIds: string[];
}) => {
  disabledItemIds.value = data.disabledItemIds || [];

  const ids = data.selectedValue ? Object.keys(data.selectedValue) : [];

  if (!ids.length || selectorType.value === undefined) {
    return;
  }

  if (
    [SelectorTypeEnum.acrossLocationPerson, SelectorTypeEnum.acrossLocationStudent].includes(
      selectorType.value,
    )
  ) {
    const _api =
      SelectorTypeEnum.acrossLocationStudent === selectorType.value ? fetchStudents : fetchUsers;
    _api(ids).then((res: any) => {
      selected.value = (res || []).reduce((all: { [key: string]: any }, item: any) => {
        all[item.id] = item;
        return all;
      }, {});
    });
  } else {
    /** 回填补全已选项内容 可能已经取完数据了*/
    if (Object.keys(nodes.value).length) {
      selected.value = ids.reduce((all: { [key: string]: any }, id: string) => {
        all[id] = nodes.value[id] || selected.value[id];
        return all;
      }, {});
    } else {
      selected.value = data.selectedValue;
    }
  }
};

const addLayered = (newLayered: any) => {
  if (newLayered.children?.length || newLayered.subChildren?.length) {
    layered.value = [
      ...layered.value,
      {
        id: newLayered.id,
        name: newLayered.name,
        level: newLayered.level,
        children: newLayered.children,
        subChildren: newLayered.subChildren,
      },
    ];
    // console.debug(newLayered, layered.value, nodes.value);
  }

  if (isFetching.value) {
    isFetching.value = false;
  }
};

const handleBreadcrumbsClick = (index: number) => {
  const newLayered = layered.value.slice(0, index + 1);
  layered.value = newLayered;
};

const handleLayeredItemSelected = ({ children, ...item }: Layered) => {
  // console.debug('handleLayeredItemSelected', item);
  const key = item.id;
  if (isMultiple.value) {
    if (selected.value[key]) {
      delete selected.value[key];
      triggerRef(selected);
    } else {
      selected.value = {
        ...selected.value,
        [key]: unref(item),
      };
    }
  } else {
    // 单选选中同一个应该是反选
    if (selected.value[key]) {
      selected.value = {};
    } else {
      selected.value = {
        [key]: unref(item),
      };
    }
    handleConfirmClick();
  }
};

const handleLayeredItemDelete = (item: Layered) => {
  if (disabledItemIds.value.includes(item.id)) {
    return;
  }
  handleLayeredItemSelected(item);
};

let nextLocationItemDrillId: string | undefined;
const handleLocationItemDrill = (locationId: string) => {
  const current = nodes.value[locationId];
  nextLocationItemDrillId = undefined;

  if (current.hasFetched) {
    addLayered(current);
  } else if (isAcrossLocation.value) {
    nodes.value = {
      ...nodes.value,
      [locationId]: { ...current, isFetching: true },
    };
    nextLocationItemDrillId = locationId;

    const _fetch =
      entityType.value === 'student'
        ? fetchLocationStudents(locationId)
        : fetchLocationPersons({
            locationId,
          });

    _fetch
      .then((data: any) => {
        if (Array.isArray(data) && data[0] && data[0].children?.length) {
          const children: string[] = [];
          const subChildren: string[] = [];
          formatFetchDataRecursive(
            data[0]?.children,
            nodes.value,
            children,
            subChildren,
            'children',
            data[0].id,
          );
          nodes.value = {
            ...nodes.value,
            [locationId]: {
              ...current,
              children,
              subChildren,
              hasFetched: true,
              isFetching: false,
            },
          };

          if (nextLocationItemDrillId === locationId) {
            addLayered(nodes.value[locationId]);
            nextLocationItemDrillId = undefined;
          }
        } else {
          nodes.value = {
            ...nodes.value,
            [locationId]: { ...current, hasFetched: true, isFetching: false },
          };
        }
      })
      .catch((ex: any) => {
        nodes.value = {
          ...nodes.value,
          [locationId]: { ...current, isFetching: false },
        };
      });
  }
};

const handleLayeredItemDrill = (node: Layered) => {
  // 下钻
  if (node.children?.length || node.subChildren?.length) {
    addLayered(node);
    return true;
  }

  // 跨组织需要异步获取数据
  if (
    isAcrossLocation.value &&
    (node.level === PersonItemLevelEnum.location || node.level === StudentItemLevelEnum.location) &&
    !node.hasFetched
  ) {
    handleLocationItemDrill(node.id);
    return true;
  }
  return false;
};

const handleLayeredItemCheck = (node: Layered) => {
  if (node.isCheckbox !== false && (node.level === mainSelectorLevel.value || isScope.value)) {
    handleLayeredItemSelected(node);
    return true;
  }
  return false;
};

const handleLayeredItemClick = (node: Layered) => {
  handleLayeredItemDrill(node) || handleLayeredItemCheck(node);
};

const handleConfirmClick = () => {
  if (eventChannel) {
    eventChannel.emit('acceptDataFromSelectorComponentPage', selected.value);
  }

  uni.navigateBack();
};

/** 筛选选择所有项 */
const handleSelectAll = () => {
  if (isSelectAll.value) {
    selected.value = [];
  } else {
    const result: Record<string, any> = {};
    const items = currentLayeredSelectableItems.value;
    if (items) {
      items.forEach(id => {
        if (!selected.value[id]) {
          result[id] = nodes.value[id];
        }
      });
    }
    selected.value = { ...selected.value, ...result };
  }
};

const handleSchoolFilter = () => {
  searchContent.value = [];
  if (currentSchoolGradeTypeOption.value === -1 && currentSchoolTypeOption.value === -1) {
    searchContent.value = [];
    showSearchContent.value = false;
  } else {
    const result: string[] = [];
    Object.keys(nodes.value).forEach(id => {
      const item = nodes.value[id];
      if (
        currentSchoolGradeTypeOption.value !== -1 &&
        item?.schoolGradeList?.indexOf(currentSchoolGradeTypeOption.value) === -1
      ) {
        return;
      }
      if (
        currentSchoolTypeOption.value !== -1 &&
        item?.schoolType !== currentSchoolTypeOption.value
      ) {
        return;
      }
      result.push(id);
    });
    searchContent.value = result;
    showSearchContent.value = true;
  }
};

const handleOnSchoolGradeChange = (value: number) => {
  if (value !== currentSchoolGradeTypeOption.value) {
    currentSchoolGradeTypeOption.value = value;
    currentSchoolGradeTypeOption.label =
      schoolGradeTypeOptions.find(item => item.value === value)?.label || '';
    handleSchoolFilter();
  }
};

const handleOnSchoolChange = (value: any) => {
  if (value !== currentSchoolTypeOption.value) {
    currentSchoolTypeOption.value = value;
    currentSchoolTypeOption.label =
      schoolTypeOptions.find(item => item.value === value)?.label || '';
    handleSchoolFilter();
  }
};

const handleSearchKeyChange = (value?: string) => {
  _searchKey.value = value;
  searchKey.value = value;
};

let searchRequest: ReturnType<typeof uni.request>;
const filterByRemote = debounce((key: string) => {
  const content: string[] = [];
  let request;

  if (searchRequest) {
    searchRequest.abort();
  }

  const getInstance = (r: any) => {
    searchRequest = r;
  };
  switch (selectorType.value) {
    case SelectorTypeEnum.acrossLocationPerson: {
      request = filterLocationPerson(getInstance, key, 1, scopeType.value);
      break;
    }
    case SelectorTypeEnum.acrossLocationPersonScope: {
      request = filterLocationPerson(getInstance, key, 1, scopeType.value, 2);
      break;
    }
    case SelectorTypeEnum.acrossLocationStudent: {
      request = filterStudents(getInstance, key, 1, scopeType.value);
      break;
    }
    case SelectorTypeEnum.acrossLocationStudentScope: {
      request = filterStudents(getInstance, key, 1, scopeType.value, 2);
      break;
    }
    default:
      break;
  }
  if (request) {
    request
      .then(data => {
        if (data && data.list) {
          if (data.list.length) {
            const children: string[] = [];
            const subChildren: string[] = [];
            formatFetchDataRecursive(data.list, content, children, subChildren);
            nodes.value = Object.assign({}, nodes.value, content);
            if (isScope.value) {
              const ids: string[] = [];
              children.concat(subChildren).forEach(id => {
                if (nodes.value[id] && nodes.value[id].level !== PersonItemLevelEnum.location) {
                  ids.push(id);
                }
              });
              searchContent.value = ids;
            } else {
              searchContent.value = children;
            }
          } else {
            searchContent.value = [];
          }
        }
      })
      .finally(() => {
        isSearching.value = false;
      });
  }
}, 300);

watch(searchKey, value => {
  if (value) {
    if (isAcrossLocation.value) {
      // 跨组织需远程搜索
      isSearching.value = true;
      filterByRemote(value);
    } else {
      const content: string[] = [];
      const match = new RegExp(value, 'i');
      const isMatch = (ctx?: string) => ctx && match.test(ctx);
      Object.entries(nodes.value).forEach(([id, item]) => {
        if (
          isMatch(item.name) ||
          isMatch(item.phone) ||
          isMatch(item.jobNo) ||
          isMatch(item.firstLetter)
        ) {
          if (isScope.value || (!isScope.value && item.level === mainSelectorLevel.value)) {
            content.push(id);
          }
        }
      });
      searchContent.value = content;
    }
    showSearchContent.value = true;
  } else {
    if (searchRequest) {
      searchRequest.abort();
    }
    isSearching.value = false;
    searchContent.value = [];
    showSearchContent.value = false;
  }
});

onLoad(({ type, multiple, scope, locationId: _locationId }: any) => {
  isMultiple.value = Number(multiple);
  selectorType.value = Number(type);
  scopeType.value = scope || LocationScopeEnum.all;

  const locationId = _locationId || userInfo?.locationId;

  uni.getStorage({
    key: 'acceptDataFromSelectorComponent',
    success(res) {
      acceptDataFromSelectorComponent(res.data);
    },
  });

  let title = '选择内容';
  switch (selectorType.value) {
    case SelectorTypeEnum.personScope: {
      title = '选择人员范围';
      entityType.value = 'person';
      mainSelectorLevel.value = PersonItemLevelEnum.user;
      fetchLocationPersons({ locationId }).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.person: {
      title = '选择人员';
      entityType.value = 'person';
      mainSelectorLevel.value = PersonItemLevelEnum.user;
      fetchLocationPersons({ locationId }).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.acrossLocationPerson: {
      title = '选择人员';
      entityType.value = 'person';
      mainSelectorLevel.value = PersonItemLevelEnum.user;
      fetchLocationRelationship({
        locationId,
        scope,
      }).then(children => {
        addLayered({
          name: '组织架构',
          ...formatNodesData((children as any[])?.map(i => ({ ...i, isCheckbox: false }))),
        });
      });
      break;
    }
    case SelectorTypeEnum.acrossLocationPersonScope: {
      title = '选择人员范围';
      entityType.value = 'person';
      mainSelectorLevel.value = PersonItemLevelEnum.user;
      fetchLocationRelationship({
        locationId,
        scope,
      }).then(children => {
        addLayered({
          name: '组织架构',
          ...formatNodesData((children as any[])?.map(i => ({ ...i, isCheckbox: false }))),
        });
      });
      break;
    }
    // 部门选择逻辑
    case SelectorTypeEnum.department: {
      title = '选择部门';
      mainSelectorLevel.value = PersonItemLevelEnum.department;
      fetchLocationDepartments().then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.student: {
      title = '选择学生';
      entityType.value = 'student';
      mainSelectorLevel.value = StudentItemLevelEnum.student;
      fetchLocationStudents(userInfo?.locationId).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.studentScope: {
      title = '选择学生范围';
      entityType.value = 'student';
      mainSelectorLevel.value = StudentItemLevelEnum.student;
      fetchLocationStudents(userInfo?.locationId).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.acrossLocationStudent: {
      title = '选择学生';
      entityType.value = 'student';
      mainSelectorLevel.value = StudentItemLevelEnum.student;
      fetchLocationRelationship({
        locationId,
        locationLevel: LocationLevel.School,
        scope,
      }).then(children => {
        addLayered({
          name: '组织架构',
          ...formatNodesData((children as any[])?.map(i => ({ ...i, isCheckbox: false }))),
        });
      });
      break;
    }
    case SelectorTypeEnum.acrossLocationStudentScope: {
      title = '选择学生范围';
      entityType.value = 'student';
      mainSelectorLevel.value = StudentItemLevelEnum.student;
      fetchLocationRelationship({
        locationId,
        locationLevel: LocationLevel.School,
        scope,
      }).then(children => {
        addLayered({
          name: '组织架构',
          ...formatNodesData((children as any[])?.map(i => ({ ...i, isCheckbox: false }))),
        });
      });
      break;
    }
    case SelectorTypeEnum.location: {
      title = '选择组织';
      entityType.value = 'location';
      mainSelectorLevel.value = StudentItemLevelEnum.location;
      fetchLocationRelationship({
        locationId,
        scope,
      }).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.gradeClass: {
      title = '选择年级/班级';
      mainSelectorLevel.value = StudentItemLevelEnum.student;
      fetchGradeClass(locationId, scope).then(children => {
        addLayered({ name: '组织架构', ...formatNodesData(children as any[]) });
      });
      break;
    }
    // TODO 数据量太大
    case SelectorTypeEnum.device: {
      title = '选择设备';
      mainSelectorLevel.value = DeviceItemLevelEnum.device;
      fetchSpaceDevice(locationId).then(children => {
        addLayered({ name: '空间', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.deviceScope: {
      title = '选择设备范围';
      mainSelectorLevel.value = DeviceItemLevelEnum.device;
      fetchSpaceDevice(locationId).then(children => {
        addLayered({ name: '空间', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.personRole: {
      title = '选择角色';
      entityType.value = 'role';
      // mainSelectorLevel.value = undefined;
      fetchLocationRoles(locationId).then(children => {
        addLayered({ name: '角色', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.space: {
      title = '选择空间';
      mainSelectorLevel.value = DeviceItemLevelEnum.space;
      fetchSpace(locationId).then(children => {
        addLayered({ name: '空间', ...formatNodesData(children as any[]) });
      });
      break;
    }
    case SelectorTypeEnum.position: {
      title = '选择职位';
      mainSelectorLevel.value = 0;
      fetchPosition().then(children => {
        addLayered({ name: '', ...formatNodesData(children as any[]) });
      });
      break;
    }
    default: {
      break;
    }
  }
  uni.setNavigationBarTitle({ title });
});

onBeforeUnmount(() => {
  uni.removeStorage({ key: 'acceptDataFromSelectorComponent' });
});
</script>

<style lang="scss">
.page {
  display: flex;
  flex-direction: column;
}
</style>

<style lang="scss" scoped>
$page-gap: 32rpx;
$section-gap: 24rpx;

.top-panel {
  // z-index: 1;
  padding: 16rpx 0;
  background-color: #fff;
  box-shadow: $shadow-light-down-md;
}
.searchbar {
  padding: 0 $page-gap;
}
.breadcrumbs {
  padding: 16rpx $page-gap 0;
  &__item {
    display: inline-block;

    &__clickable {
      color: $color-primary;
    }
  }
}
.content {
  flex: 1;
  overflow: hidden;
}
.toolbar {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx $page-gap;
  background-color: #fff;
  box-shadow: $shadow-light-up-md;
}
.popup-content {
  background-color: $uni-bg-color;
}
</style>
