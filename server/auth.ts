import { Request, Response, NextFunction } from 'express';
import { db, verifyPassword } from './db';

export { verifyPassword };

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    id: string;
    username: string;
    email: string;
    name: string;
  };
  sessionToken?: string;
}

export function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const customHeader = req.headers['x-admin-token'] as string;
  
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please log in with authorized administrator credentials.',
    });
    return;
  }

  const session = db.getSession(token);
  if (!session) {
    res.status(401).json({
      error: 'Session expired or invalid. Please log in again.',
    });
    return;
  }

  const admin = db.findAdminById(session.userId) || (session.userId === 'admin-1' ? db.getAdmin() : null);
  if (!admin) {
    res.status(401).json({
      error: 'User not authorized.',
    });
    return;
  }

  req.adminUser = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    name: admin.name,
  };
  req.sessionToken = token;
  next();
}
