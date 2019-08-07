import find from 'lodash/find';
import pick from 'lodash/pick';
import {
  calcSummonersPoints,
} from '../../helpers';

export default (tournaments, users) => {
  const userIds = users.map(user => user._id);

  const tournamentsList = userIds.reduce((list, user) => {
    const userTournaments = tournaments.filter(item => find(item.summoners, user));
    const normalizedTournaments = userTournaments.map(tournament => pick(tournament, ['rules', 'summoners', 'viewers', 'matches']));

    list[user] = normalizedTournaments;
    return list;
  }, {});

  const resultsMap = userIds.reduce((results, userId) => ({...results, [userId]: 0}), {});

  for(const user of userIds) {
    tournamentsList[user].forEach(tournament => {
      const { summoners, matches, rules } = tournament;
  
      const summonersResults = calcSummonersPoints(summoners, matches, rules);
  
      for(const { summoner, points } of summonersResults) {
        resultsMap[summoner] += points;
      }
    });
  }

  const applicantsRating = Object.entries(resultsMap).map(([summonerId, points]) => {
    const { summonerName, username } = users.find(item => String(item._id) === String(summonerId));

    return {
      username,
      summonerName,
      points,
    }
  })
  .sort((prev, next) => next.points - prev.points);

  return applicantsRating;
};