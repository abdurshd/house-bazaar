import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useLoadingWithRetry } from '../hooks/useLoadingWithRetry';
import Spinner from './Spinner';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {
  const [listings, setListings] = useState(null);
  const { loading, error, executeWithRetry } = useLoadingWithRetry();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const fetchFunction = async () => {
        const listingsRef = collection(db, 'listinglar');
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnap = await getDocs(q);

        let listings = [];
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

  if (loading) {
    return <Spinner error={error} />;
  }

  if (listings?.length === 0) {
    return <h3> There are no listings yet</h3>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recommended</p>

        <Swiper
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
        >
          {listings?.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                style={{
                  background: `url(${data.imgUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className="swiperSlideDiv"
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </Swiper>
      </>
    )
  );
}

export default Slider;
