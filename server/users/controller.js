import qs from 'qs';
import passport from '../auth/passport';
import { database as db } from '../config';

const CLIENT_URI = process.env.CLIENT_URI;
const STRATEGY = 'github';

const loginHandler = (req, res, next) => {
  passport.authenticate(STRATEGY, {
    failureRedirect: `${CLIENT_URI}/login`,
  })(req, res, next);
};

const sendUserHandler = (req, res) => {
  const { User } = db;
  const { user } = req;

  const where = { id: user.id };

  User.findOne({ where }).then(user =>
    res.status(200).json({
      user: user.getAuthToken(),
    }),
  );
};

const publishToken = (req, res) => {
  const { user } = req;
  const { needSignup } = user;
  const query = qs.stringify(user);
  const path = `${CLIENT_URI}${needSignup ? '/signup?' : '/redirect?'}${query}`;

  res.redirect(path);
};

const signUpHandler = (req, res, next) => {
  if (!req.user.needSignup)
    return res.status(404).send({ message: 'Cannot Signup' });

  const { User } = db;
  const { user } = req.body;

  User.updateInfo(user).then(([result]) => {
    if (!result) return res.status(404).send({ message: 'Cannot Signup' });

    next();
  });
};

export { loginHandler, publishToken, signUpHandler, sendUserHandler };
