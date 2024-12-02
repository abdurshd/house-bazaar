import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentListingState } from '../atoms/listingAtom';
import { userState } from '../atoms/authAtom';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';
import { useLoadingWithRetry } from '../hooks/useLoadingWithRetry';

function Listing() {
  const [currentListing, setCurrentListing] = useRecoilState(currentListingState);
  const user = useRecoilValue(userState);
  const { loading, error, executeWithRetry } = useLoadingWithRetry();
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const params = useParams();

  useEffect(() => {
    const fetchListing = async () => {
      const fetchFunction = async () => {
        const docRef = doc(db, 'listinglar', params.listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCurrentListing(docSnap.data());
          return docSnap.data();
        }
        throw new Error('Listing not found');
      };

      await executeWithRetry(fetchFunction);
    };

    fetchListing();
  }, [params.listingId, setCurrentListing, executeWithRetry]);

  if (loading) {
    return <Spinner error={error} />;
  }

  const onShareLinkClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 2000);
  };

  return (
    <main>
      {currentListing && (
        <>
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            style={{ height: '300px' }}
          >
            {currentListing.imgUrls?.map((url, index) => (
              <SwiperSlide key={index}>
                <div
                  className='swiperSlideDiv'
                  style={{
                    background: `url(${currentListing.imgUrls[index]}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className='shareIconDiv' onClick={onShareLinkClick}>
            <img src={shareIcon} alt='share' />
          </div>
          {shareLinkCopied && <p className='linkCopied'>Link Copied!</p>}

          <div className='listingDetails'>
            <p className='listingName'>
              {currentListing.name} - $
              {currentListing.offer
                ? currentListing.discountedPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : currentListing.regularPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            <p className='listingLocation'>{currentListing.location}</p>
            <p className='listingType'>
              For {currentListing.type === 'rent' ? 'Rent' : 'Sale'}
            </p>
            {currentListing.offer && (
              <p className='discountPrice'>
                ${currentListing.regularPrice - currentListing.discountedPrice} discount
              </p>
            )}

            <ul className='listingDetailsList'>
              <li>
                {currentListing.bedrooms > 1
                  ? `${currentListing.bedrooms} Bedrooms`
                  : '1 Bedroom'}
              </li>
              <li>
                {currentListing.bathrooms > 1
                  ? `${currentListing.bathrooms} Bathrooms`
                  : '1 Bathroom'}
              </li>
              <li>{currentListing.parking && 'Parking Spot'}</li>
              <li>{currentListing.furnished && 'Furnished'}</li>
            </ul>

            <p className='listingLocationTitle'>Location</p>

            <div className='leafletContainer'>
              <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={[currentListing.latitude, currentListing.longitude]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                <Marker
                  position={[currentListing.latitude, currentListing.longitude]}
                >
                  <Popup>{currentListing.location}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {user?.uid !== currentListing.userRef && (
              <Link
                to={`/contact/${currentListing.userRef}?listingName=${currentListing.name}`}
                className='primaryButton'
              >
                Contact Landlord
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default Listing;
