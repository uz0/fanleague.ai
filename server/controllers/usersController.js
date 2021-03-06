import express from 'express';
import UserModel from '../models/user';

import isEmpty from 'lodash/isEmpty';

const router = express.Router();

const UsersController = () => {
  router.get('/', async (req, res) => {
    const users = await UserModel.find();
    res.json({ users });
  });

  router.get('/me', async (req, res) => {
    if (isEmpty(req.decoded)) {
      res.send({
        user: null
      });

      return;
    }

    const userId = req.decoded._id;
    const user = await UserModel.findOne({ _id: userId }).select('-password');
    res.json({ user });
  });

  router.post('/me', async (req, res) => {
    const userId = req.decoded._id;

    const { username, email, lolApiKey, photo, about, gameSpecificFields } = req.body;

    const streamerAccountId = '';

    // if (gameSpecificName != ''){
    //   let accountInfo = await riotFetch(`/lol/summoner/v4/summoners/by-name/${gameSpecificName}`);
    //   accountInfo = await accountInfo.json();

    //   if (accountInfo.status && accountInfo.status.status_code === 404){
    //     res.send({
    //       success: false,
    //       error: 'user_not_found',
    //     });

    //     return;
    //   }

    //   streamerAccountId = accountInfo.accountId;
    // }

    const fields = {
      email,
      photo,
      about,
      username,
      lolApiKey,
      gameSpecificFields,
      streamerAccountId
    };

    const updatedUser = await UserModel
      .findOneAndUpdate({ _id: userId }, fields)
      .select('-password');

    res.json({
      success: true,
      user: updatedUser
    });
  });

  router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await UserModel.findOne({ _id: id });

    res.json({ user });
  });

  return router;
};

export default UsersController;
