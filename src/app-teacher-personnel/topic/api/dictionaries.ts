import { request } from '@/utils/request';

export async function getDictionaries(codes: string[]) {
  return request(`/dictionaries/query`, { entryCodes: codes.join(',') }, 'GET', {
    spaceType: request.service.auth,
    showLoading: false,
  });
}
