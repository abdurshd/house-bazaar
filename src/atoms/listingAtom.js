import { atom } from 'recoil';

export const listingsState = atom({
  key: 'listingsState',
  default: [],
});

export const listingLoadingState = atom({
  key: 'listingLoadingState',
  default: false,
});

export const currentListingState = atom({
  key: 'currentListingState',
  default: null,
}); 