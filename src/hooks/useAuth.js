import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { userState } from '../atoms/authAtom';

export const useAuth = () => {
  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser]);
}; 