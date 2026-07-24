import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  return {
    ...auth,
    role: auth?.user?.role || 'Guest',
    isAdmin: auth?.user?.role === 'Administrator',
    isOrthodontist: auth?.user?.role === 'Orthodontist' || auth?.user?.role === 'Administrator',
    isResearcher: auth?.user?.role === 'Researcher' || auth?.user?.role === 'Administrator'
  };
};
