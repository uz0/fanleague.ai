import { param } from 'express-validator/check';

import Match from '../../../models/match';
import Tournament from '../../../models/tournament';

import { isEntityExists } from '../../validators';
import { withValidationHandler } from '../../helpers';

export const validator = [
  param('matchId').custom(matchId => isEntityExists(matchId, Match)),
  param('matchId').custom(async matchId => {
    const { endAt } = await Match.findById(matchId).exec();

    if (endAt) throw new Error('Match is already ended');

    return true;
  })
];

export const handler = withValidationHandler(async (req, res) => {
  const { tournamentId, matchId } = req.params;

  await Match.update(
    { _id: matchId },
    { $set: { isActive: false, endAt: Date.now() } }
  ).exec();

  const modifiedTournament = await Tournament
    .findById(tournamentId)
    .populate('creatorId')
    .populate('applicants')
    .populate('matches')
    .populate('teams')
    .populate('creator', '_id username summonerName')
    .exec();

  res.json(modifiedTournament);
});
