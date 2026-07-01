import { verifyToken } from './verifyUser.js'; // whatever your existing JWT check is called
import User from '../models/user.model.js';
import { errorHandler } from './error.js';

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.isAdmin) return next(errorHandler(403, 'Admin access only'));
      next();
    } catch (err) {
      next(err);
    }
  });
};