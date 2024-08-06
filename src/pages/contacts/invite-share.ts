import { InviteParams } from '@/store/modules/invite';
import { Server_Asset_Prefix } from '@/utils/constant';
import { log } from '@/utils/tools';

type IShare = Pick<InviteParams, 'id' | 'locationId' | 'title'>;

export const shareInviteTask = (task: IShare) => {
  log('shareInviteTask_task : ', task);
  const params = `id=${task.id}&locationId=${task.locationId}&inviteType=3`;
  const path = `/app-platform/contacts/register-form/index?${params}`;
  log('shareInviteTask_path : ', path);
  return {
    title: task.title,
    path: path,
    imageUrl: `${Server_Asset_Prefix}img_invite.png`,
  };
};
