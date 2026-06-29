import { CustomJwtPayload } from '@/interface/interface';
import { jwtDecode } from 'jwt-decode';

export const verifyToken = (token: string | null | undefined): CustomJwtPayload | null => {
  if (!token) return null;

  const normalizedToken = token.trim();
  if (!normalizedToken) return null;

  const cleanedToken = normalizedToken.replace(/^['"]|['"]$/g, '');

  try {
    return jwtDecode<CustomJwtPayload>(cleanedToken);
  } catch {
    return null;
  }
};