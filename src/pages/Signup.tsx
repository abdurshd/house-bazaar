import React, {useState} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {getAuth, createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import {firebaseConfig} from '../firebase.config'
import {db} from '../firebase.config'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

interface FormData {
  name: string;
  email: string;
  password: string;
}


const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  })

const {name, email, password} = formData;

const navigate = useNavigate()

const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData((prevState) => ({
    ...prevState,
    [e.target.id]: e.target.value,
  }))
};

  return (
    <>
      <div className="pageContainer">
        <header>
          <p className="pageHeader">Welcome Back!</p>
        </header>
        <main>
          <form>
          <input type="text" className="nameInput" placeholder="Name" id="name" value={name} onChange={onChange} />
            <input type="email" className="emailInput" placeholder="Email" id="email" value={email} onChange={onChange} />
            <div className="passwordInputDiv">
              <input type={showPassword ? 'text' : 'password'} className="passwordInput" placeholder='Password' id="password" value={password} onChange={onChange} />
              <img src={visibilityIcon} alt="showPassword" className="showPassword" onClick={() => setShowPassword((prevState) => !prevState)}/>
            </div>
            <Link to="/forgot-password" className='forgotPasswordLink'>
              Forgot Password
            </Link>

            <div className="signUpBar">
              <p className="signUpText">
                Sign up 
              </p>
              <button className="signUpButton">
                <ArrowRightIcon fill='#ffffff' width='34px' height='34px'/>
              </button>
            </div>
          </form>

          {/* Google auth */}

          <Link to='/signin' className="registerLink">Sign in</Link>
        </main>
      </div>
    </>
  )
}



export default Signup
