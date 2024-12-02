import { atom } from 'recoil';

export const userState = atom({
  key: 'userState',
  default: null,
});

export const authLoadingState = atom({
  key: 'authLoadingState',
  default: false,
}); 