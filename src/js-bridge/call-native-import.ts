import { default as auth } from './call-native-auth';
import { default as errorPage } from './call-native-errorPage';
import { default as file } from './call-native-file';
import { default as navigation } from './call-native-navigation';
import { default as system } from './call-native-system';
import { default as workbench } from './call-native-workbench';

const services = {
  navigation,
  errorPage,
  system,
  workbench,
  auth,
  file,
};

export default services;
