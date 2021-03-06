import { param, check } from 'express-validator/check';

import find from 'lodash/find';

import Tournament from '../../models/tournament';
import { isEntityExists } from '../validators';
import { withValidationHandler } from '../helpers';

export const validator = [
  param('id').custom(id => isEntityExists(id, Tournament)),
  param('id').custom(id =>
    Tournament.findById(id)
      .exec()
      .then(
        ({ isReady }) =>
        // eslint-disable-next-line
          !isReady || Promise.reject("Can't attend ready tournament")
      )
  ),
  check('userId')
    .custom(async (_, { req }) => {
      const { _id: userId } = req.decoded;
      const { id } = req.params;
      const { applicants, summoners } = await Tournament.findById(id).exec();

      const isAlreadyApplicantOrSummoner = summoners.includes(userId) || find(applicants, { user: userId });

      if (isAlreadyApplicantOrSummoner) {
        throw new Error('User already an applicant or summoner');
      }

      return true;
    })
];

export const handler = withValidationHandler(async (req, res) => {
  const { id } = req.params;
  const { _id: userId } = req.decoded;

  const modifiedTournament = await Tournament.findByIdAndUpdate(id, {
    $push: { applicants: { user: userId } }
  });

  await modifiedTournament.save();

  res.json({});
});
