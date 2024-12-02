import { useRecoilValue, useRecoilState } from 'recoil';
import { userState } from '../atoms/authAtom';
import { listingsState, listingLoadingState } from '../atoms/listingAtom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc, doc, collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import ListingItem from '../components/ListingItem';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';
import { Link } from 'react-router-dom';
import { useLoadingWithRetry } from '../hooks/useLoadingWithRetry';
import Spinner from '../components/Spinner';

function Profile() {
  const user = useRecoilValue(userState);
  const [listings, setListings] = useRecoilState(listingsState);
  const [loading, setLoading] = useRecoilState(listingLoadingState);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
  });

  const { name, email } = formData;
  const auth = getAuth();
  const navigate = useNavigate();
  const { loading: loadingWithRetry, error, executeWithRetry } = useLoadingWithRetry();

  useEffect(() => {
    const fetchUserListings = async () => {
      setLoading(true);
      const fetchFunction = async () => {
        const listingsRef = collection(db, 'listinglar');
        const q = query(
          listingsRef,
          where('userRef', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        const querySnap = await getDocs(q);
        const listings = [];

        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
        return listings;
      };

      if (user) {
        await executeWithRetry(fetchFunction);
      } else {
        setLoading(false);
        setListings([]);
      }
    };

    fetchUserListings();
  }, [user, executeWithRetry, setListings, setLoading]);

  if (loadingWithRetry || loading) {
    return <Spinner error={error} />;
  }

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      if (user.displayName !== name) {
        // Update display name in Firebase
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          name,
        });
        
        toast.success('Profile details updated');
      }
    } catch (error) {
      toast.error('Could not update profile details');
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        await deleteDoc(doc(db, 'listinglar', listingId));
        const updatedListings = listings.filter(
          (listing) => listing.id !== listingId
        );
        setListings(updatedListings);
        toast.success('Successfully deleted listing');
      } catch (error) {
        toast.error('Could not delete listing');
      }
    }
  };

  const onEdit = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  return (
    <div className='profile'>
      <header className='profileHeader'>
        <p className='pageHeader'>My Profile</p>
        <button type='button' className='logOut' onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className='profileDetailsHeader'>
          <p className='profileDetailsText'>Personal Details</p>
          <p
            className='changePersonalDetails'
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>

        <div className='profileCard'>
          <form>
            <input
              type='text'
              id='name'
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type='text'
              id='email'
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to='/create-listing' className='createListing'>
          <img src={homeIcon} alt='home' />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt='arrow right' />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className='listingText'>Your Listings</p>
            <ul className='listingsList'>
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;
