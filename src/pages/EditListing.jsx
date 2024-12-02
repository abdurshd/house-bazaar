import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../components/Spinner';
import { useLoadingWithRetry } from '../hooks/useLoadingWithRetry';

function EditListing() {
  const { loading, error, executeWithRetry } = useLoadingWithRetry();
  const [geolocationEnabled] = useState(() => {
    return process.env.REACT_APP_GEOCODE_API_KEY ? true : false;
  });
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);
  const [countries, setCountries] = useState([]);

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error('You can not edit that listing');
      navigate('/');
    }
  });

  // Fetch listing to edit
  useEffect(() => {
    const fetchListing = async () => {
      const fetchFunction = async () => {
        const docRef = doc(db, 'listinglar', params.listingId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setListing(docSnap.data());
          const listingData = docSnap.data();
          setFormData({
            ...listingData,
            street: listingData.location,
            city: '',
            state: '',
            zipcode: '',
            country: '',
          });
          return listingData;
        }
        throw new Error('Listing does not exist');
      };

      await executeWithRetry(fetchFunction);
    };

    fetchListing();
  }, [params.listingId, executeWithRetry]);

  // Sets userRef to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        
        // Sort countries by name
        const sortedCountries = data
          .map(country => ({
            code: country.cca2,
            name: country.name.common
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to load countries list');
      }
    };

    fetchCountries();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    const submitFunction = async () => {
      try {
        if (discountedPrice >= regularPrice) {
          toast.error('Discounted price needs to be less than regular price');
          return;
        }

        if (images.length > 6) {
          toast.error('Max 6 images');
          return;
        }

        let geolocation = {};
        let location;

        if (geolocationEnabled) {
          const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipcode}, ${formData.country}`;
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`,
          );

          const data = await response.json();

          geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
          geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

          location =
            data.status === 'ZERO_RESULTS'
              ? undefined
              : data.results[0]?.formatted_address;

          if (location === undefined || location.includes('undefined')) {
            toast.error('Please enter a correct address');
            return;
          }
        } else {
          geolocation.lat = latitude;
          geolocation.lng = longitude;
        }

        // Store image in firebase
        const storeImage = async (image) => {
          return new Promise((resolve, reject) => {
            const storage = getStorage();
            const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

            const storageRef = ref(storage, 'images/' + fileName);

            const uploadTask = uploadBytesResumable(storageRef, image);

            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                  case 'paused':
                    console.log('Upload is paused');
                    break;
                  case 'running':
                    console.log('Upload is running');
                    break;
                  default:
                    break;
                }
              },
              (error) => {
                reject(error);
              },
              () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  resolve(downloadURL);
                });
              },
            );
          });
        };

        const imgUrls = await Promise.all(
          [...images].map((image) => storeImage(image)),
        ).catch(() => {
          toast.error('Images not uploaded');
          return;
        });

        const formDataCopy = {
          ...formData,
          imgUrls,
          geolocation,
          timestamp: serverTimestamp(),
        };

        formDataCopy.location = formData.street;
        delete formDataCopy.images;
        delete formDataCopy.street;
        delete formDataCopy.city;
        delete formDataCopy.state;
        delete formDataCopy.zipcode;
        delete formDataCopy.country;
        !formDataCopy.offer && delete formDataCopy.discountedPrice;

        // Update listing
        const docRef = doc(db, 'listinglar', params.listingId);
        await updateDoc(docRef, formDataCopy);
        toast.success('Listing saved');
        navigate(`/category/${formDataCopy.type}/${docRef.id}`);
      } catch (error) {
        toast.error('Error updating listing: ' + error.message);
      }
    };

    await executeWithRetry(submitFunction);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Booleans/Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner error={error} />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <div className="formAddressContainer">
            <label className="formLabel">Address</label>
            <div className="addressInputs">
              <input
                className="formInputAddress"
                type="text"
                id="street"
                placeholder="Street Address"
                value={formData.street}
                onChange={onMutate}
                required
              />
              <input
                className="formInputAddress"
                type="text"
                id="city"
                placeholder="City"
                value={formData.city}
                onChange={onMutate}
                required
              />
              <div className="addressInputRow">
                <input
                  className="formInputAddress"
                  type="text"
                  id="state"
                  placeholder="State/Province"
                  value={formData.state}
                  onChange={onMutate}
                  required
                />
                <input
                  className="formInputAddress"
                  type="text"
                  id="zipcode"
                  placeholder="Postal/Zip Code"
                  value={formData.zipcode}
                  onChange={onMutate}
                  required
                />
              </div>
              <select
                className="formInputAddress"
                id="country"
                value={formData.country}
                onChange={onMutate}
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="addressHelper">
              Example: 123 Main St, New York, NY 10001, USA
            </p>
          </div>

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
