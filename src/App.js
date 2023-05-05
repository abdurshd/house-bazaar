import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Explore from './pages/Explore'
import ForgotPassword from './pages/ForgotPassword'
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Signin from './pages/Signin';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Explore/>}/>
        <Route path="/offers" element={<Offers/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/signin" element={<Signin/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
      </Routes>
      <Navbar/>
    </Router> 
    </>
  )
}

export default App;
