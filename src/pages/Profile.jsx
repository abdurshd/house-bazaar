import {useState} from 'react'
import {getAuth, updateProfile} from 'firebase/auth'
import {useNavigate, Link} from 'react-router-dom'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebase.config'
import {toast} from 'react-toastify'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

const Profile = () => {
  const auth = getAuth()
  const [changeDetails, setChangeDetails] = useState(false)
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  })

  const {name, email} = formData;

  const navigate = useNavigate();
  const onLogout = () => {
    auth.signOut()
    navigate('/')
  }
const onSubmit = async () => {
  try {
    if(auth.currentUser.displayName !== name) {
      await updateProfile(auth.currentUser, {
        displayName: name
      })

      const userRef = doc(db, 'users', auth.currentUser.uid)

      await updateDoc(userRef, {
        name,
      })
    } 
  } catch (error) {
    toast.error('Could not update the profile')
  }
}

const onChange = (e) => {
  setFormData((prevState) => ({
    ...prevState,
    [e.target.id]: e.target.value
  }))
}

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My profile</p>
        <button type="button" className="logOut" onClick={onLogout}>log out</button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal details</p>
          <p className="changePersonalDetails" onClick={() => {
            changeDetails && onSubmit()
            setChangeDetails((prevState) => !prevState)
          }}>
            {changeDetails ? 'done':'change details'}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input type="text" id="name" className={!changeDetails ? 'profileName' : 'profileNameActive'} disabled={!changeDetails} value={name}
            onChange={onChange}/>
            
          </form>
        </div>
        <Link to='/create-listing' className="createListing">
          <img src={homeIcon} alt="home icon" />
          <p> Sell or rent your home</p>
          <img src={arrowRight} alt="arrow icon" /> 
        </Link>
      </main>
    </div>
  )
}

export default Profile
