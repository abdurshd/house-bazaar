import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';
import { useLoadingWithRetry } from '../hooks/useLoadingWithRetry';

function Offers() {
  const [listings, setListings] = useState(null);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const { loading, error, executeWithRetry } = useLoadingWithRetry();

  useEffect(() => {
    const fetchListings = async () => {
      const fetchFunction = async () => {
        const listingsRef = collection(db, 'listinglar');
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);

        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        return listings;
      };

      await executeWithRetry(fetchFunction);
    };

    fetchListings();
  }, [executeWithRetry]);

  // Pagination / Load More
  const onFetchMoreListings = async () => {
    const fetchMoreFunction = async () => {
      const listingsRef = collection(db, 'listinglar');
      const q = query(
        listingsRef,
        where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      );

      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);

      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState, ...listings]);
      return listings;
    };

    await executeWithRetry(fetchMoreFunction);
  };

  if (loading) {
    return <Spinner error={error} />;
  }

  return (
    <div className="category">
      <header className="pageExplore">
        <p className="pageHeader">Offers</p>
        <p className="pageSubHeader">HouseBazaar</p>
      </header>

      {listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>

          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
}

export default Offers;
