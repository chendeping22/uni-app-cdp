import { IOrganizationInfo, loginStore } from '@/store/modules/login';
import { EUserType } from './kind';

// 是否是当前组织
export const isCurrentOrganization = message => {
  const userClientType = loginStore().currentUserType === EUserType.teacher ? 1 : 2;
  const locationId = loginStore().currentOrganization?.id;
  return message.userClientType === userClientType && message.locationId.toString() === locationId;
};

// 更新红点信息
export const saveMessage = message => {
  if (!message) {
    return;
  }

  const selectOrganizationInfos = getMessageOrganizationInfos(message);
  for (const key of selectOrganizationInfos) {
    key.showRedDot = true;
  }
};

const getMessageOrganizationInfos = (message: any) => {
  const selectOrganizationInfos = [];
  const tmpOrganizationList = loginStore().organizationList;
  for (const organization of tmpOrganizationList.locations) {
    const userClientType = organization.userType === EUserType.teacher ? 1 : 2;
    if (userClientType !== message.userClientType) {
      continue;
    }

    const info = findMessageOrganizationInfo(organization.locations, message.locationId.toString());
    if (info) {
      selectOrganizationInfos.push(info);
    }
  }
  return selectOrganizationInfos;
};

const findMessageOrganizationInfo = (
  locations: IOrganizationInfo[],
  locationId: string,
): IOrganizationInfo | undefined => {
  for (const info of locations) {
    if (info.id === locationId) {
      return info;
    }

    if (info.children && info.children.length > 0) {
      const target = findMessageOrganizationInfo(info.children, locationId);
      if (target) {
        return target;
      }
    }
  }

  return undefined;
};

// 清除缓存信息
export const clearMessage = (location: IOrganizationInfo, userType: EUserType) => {
  if (!location) {
    return;
  }

  const userClientType = userType === EUserType.teacher ? 1 : 2;
  const message = {
    locationId: location.id,
    userClientType,
  };
  const selectOrganizationInfos = getMessageOrganizationInfos(message);
  for (const key of selectOrganizationInfos) {
    key.showRedDot = false;
  }
};

// 查找是否存在未读消息
export const isHaveUnreadMessage = (): boolean => {
  let isHaveUnread = false;
  const tmpOrganizationList = loginStore().organizationList;
  for (const organization of tmpOrganizationList.locations) {
    const msg = findUnMessageOrganization(organization.locations);
    if (msg) {
      isHaveUnread = true;
      break;
    }
  }
  return isHaveUnread;
};

const findUnMessageOrganization = (locations: IOrganizationInfo[]) => {
  for (const info of locations) {
    if (info.showRedDot) {
      return info;
    }

    if (info.children && info.children.length > 0) {
      const target = findUnMessageOrganization(info.children);
      if (target) {
        return target;
      }
    }
  }

  return undefined;
};
