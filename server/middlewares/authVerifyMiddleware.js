import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const AuthVerifyMiddleware = (app) => {
  router.use((req, res, next) => {
    const token = req.body.token || req.query.token || req.__mockedToken || req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, app.get('superSecret'), (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'No token provided.'
      });
    }
  });

  return router;
};

export default AuthVerifyMiddleware;
