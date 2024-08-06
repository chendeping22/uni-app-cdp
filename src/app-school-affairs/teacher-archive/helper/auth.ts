import { ref } from 'vue';
import { getAuth } from './api';

export const useAuth = () => {
  const authFlag = ref(true);
  const authData = ref();
  const fetchAuth = async () => {
    //查询
    const res = await getAuth();
    authData.value = res;
    authFlag.value = !!res.auth;
  };

  fetchAuth();

  return {
    authFlag,
    authData,
    fetchAuth,
  };
};
