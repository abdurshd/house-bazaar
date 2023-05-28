import {Navigate, Outlet} from 'react-router-dom'
import {useAuth} from '../hooks/useAuth'
import Spinner from './Spinner'

const PrivateRoutes = () => {
    const {loggedIn, loading} = useAuth()

    if (loading) {
        return <Spinner/>
    }


  return loggedIn? <Outlet/>:<Navigate to="/signin"/>
}

export default PrivateRoutes
