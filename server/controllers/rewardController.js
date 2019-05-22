import express from 'express';
import RewardModel from '../models/reward';
import UserModel from '../models/user';
import uuid from 'uuid';

let router = express.Router();

const RewardController = () => {
  router.get('/', async (req, res) => {
    const rewards = await RewardModel.find();

    res.send({ rewards });
  });

  router.post('/', async (req, res) => {
    const reward = await RewardModel.create({
      key: uuid(),
      description: 'Golden Reward',
    });

    res.send({ reward });
  });

  return router;
}

export default RewardController;