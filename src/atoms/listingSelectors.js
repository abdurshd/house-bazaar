import { selector } from 'recoil';
import { listingsState } from './listingAtom';

export const offerListingsSelector = selector({
  key: 'offerListingsSelector',
  get: ({get}) => {
    const listings = get(listingsState);
    return listings.filter(listing => listing.data.offer);
  },
});

export const categoryListingsSelector = selector({
  key: 'categoryListingsSelector',
  get: ({get}) => (category) => {
    const listings = get(listingsState);
    return listings.filter(listing => listing.data.type === category);
  },
}); 