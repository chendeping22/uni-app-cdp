import { request } from '@/utils/request';

export const getOpenApiCode = (personId: string) =>
  request<string>(`/v1/third/app/urls/actions/getCodeByPersonId?personId=${personId}`, {}, 'GET');

export const getOpenApiCodeEncrypt = (studentCode: string) =>
  request<string>(`/v1/utils/aes/encrypt`, { source: studentCode }, 'GET', {});

type GetThreeUrl = {
  fullUrl: string;
};

export const getThreeThirdUrl = (applicationId: string, locationId: string) =>
  request<GetThreeUrl>(
    `/v1/third/app/urls/application/${applicationId}?locationId=${locationId}&clientType=2`,
    {},
    'GET',
  );
