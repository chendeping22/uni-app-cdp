import { LocationScopeEnum, StudentItemLevelEnum } from '@/components/selector/types';
import { request } from '@/utils/request';
import { LocationLevel } from './types';

const pageSize = 60;

export const fetchLocationDepartments = () => {
  return request('/departmentSelect/locationDepartments', {}, 'GET', {
    spaceType: request.service.auth,
  });
};

export const fetchLocationPersons = ({ locationId }: { locationId?: string }) => {
  return request(
    '/userSelect/locationPersons',
    {
      locationId: locationId,
    },
    'GET',
    {
      spaceType: request.service.auth,
    },
  );
};

export const fetchLocationRelationship = ({
  locationId,
  locationLevel,
  scope,
}: {
  locationId?: string;
  locationLevel?: LocationLevel;
  scope?: string;
}) => {
  return request(
    '/userSelect/locationRelationship',
    {
      locationId: locationId,
      scope: scope || 'all',
      locationLevel: locationLevel || '',
    },
    'GET',
    {
      spaceType: request.service.auth,
    },
  );
};

export const fetchLocationStudents = (locationId?: string) => {
  return request(
    '/locationStudents',
    {
      locationId: locationId,
    },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );
};

export const fetchLocations = (locationId?: string, scope?: any) => {
  return request(
    '/locationSelect/locations',
    {
      scope: scope || 'all',
      locationId,
    },
    'GET',
    {
      spaceType: request.service.auth,
    },
  );
};

export const fetchGradeClass = (locationId?: string, scope?: string) => {
  return request(
    '/locationGradeClazz',
    {
      scope: scope || '',
      locationId,
    },
    'GET',
    {
      spaceType: request.service.campusbase,
    },
  );
};

export const fetchSpaceDevice = (locationId?: string) => {
  return request(
    '/device/actions/getDeviceSpaceTree',
    {
      locationId,
      // labelId,
      // deviceTypeId,
    },
    'POST',
    {
      spaceType: request.service.controller,
    },
  );
};

export const fetchLocationRoles = (locationId?: string) => {
  return request(
    '/userSelect/locationRoles',
    {
      locationId,
    },
    'GET',
    {
      spaceType: request.service.auth,
    },
  );
};

export const fetchUsers = (ids: string[]) => {
  return request('/userSelect/users', ids, 'POST', {
    spaceType: request.service.auth,
  });
};

export const fetchStudents = (ids: string[]) => {
  return request('/students', ids, 'POST', {
    spaceType: request.service.campusbase,
  });
};

export const fetchSpace = (locationId?: string) => {
  return request('/space/findTree', { locationId, flag: '0' }, 'GET', {
    spaceType: request.service.building,
  });
};

export const filterLocationPerson = (
  onUniRequest: (instance: ReturnType<typeof uni.request>) => void,
  keyword: string,
  pageNum: number,
  scope: LocationScopeEnum | StudentItemLevelEnum,
  type?: number,
) => {
  return request(
    '/userSelect/locationPerson',
    {
      keyword,
      pageNum,
      pageSize,
      scope,
      type: type || '',
    },
    'GET',
    {
      spaceType: request.service.auth,
      defaultError: false,
      overdueShowLoadingTime: 0,
      onUniRequest,
    },
  );
};

export const filterStudents = (
  onUniRequest: (instance: ReturnType<typeof uni.request>) => void,
  keyword: string,
  pageNum: number,
  scope: LocationScopeEnum | StudentItemLevelEnum,
  type?: number,
) => {
  return request(
    '/searchStudents',
    {
      keyword,
      pageNum,
      pageSize,
      scope,
      type,
    },
    'GET',
    {
      spaceType: request.service.campusbase,
      defaultError: false,
      overdueShowLoadingTime: 0,
      onUniRequest,
    },
  );
};

export const fetchPosition = () => {
  return request('/positions/actions/list', {}, 'GET', {
    spaceType: request.service.auth,
  });
};

export const fetchSeparatedPerson = (params: {
  pageNum: number;
  pageSize: number;
  condition?: string;
}) => {
  return request('/departureUsers/page', params, 'POST', {
    spaceType: request.service.auth,
  });
};
