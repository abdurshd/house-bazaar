import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '../atoms/authAtom';

const PrivateRoute = () => {
  const user = useRecoilValue(userState);
  console.log('Current user state:', user);
  return user ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
