import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Explore from './pages/Explore'
import ForgotPassword from './pages/ForgotPassword'
import Offers from './pages/Offers';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import PrivateRoutes from './components/PrivateRoutes';
import Category from './components/Category';
import Createlisting from './pages/CreateListing';
import Listing from './pages/Listing';
import Contact from './pages/Contact';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Explore/>}/>
        <Route path="/offers" element={<Offers/>}/>
        <Route path="/category/:categoryName" element={<Category/>}/>
        <Route path="/profile" element={<PrivateRoutes/>}>
          <Route path="/profile" element={<Profile/>}/>
        </Route>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/signin" element={<Signin/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/create-listing" element={<Createlisting/>}/>
        <Route path="/category/:categoryName/:listingId" element={<Listing/>}/>
        <Route path="/contact/:lanlordId" element={<Contact/>}/>
      </Routes>
      <Navbar/>
    </Router> 
    <ToastContainer/>
    </>
  )
}

export default App;
