import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import cheerio from 'cheerio';
import fs from 'fs';

import PlayerModel from '../models/player';

import TournamentModel from '../models/tournament';
import FantasyTournament from '../models/fantasy-tournament';
import MatchModel from '../models/match';
import MatchResultModel from '../models/match-result';
import UserModel from '../models/user';
import RewardModel from '../models/reward';
import riotFetch from '../riotFetch';

import find from 'lodash/find';
import difference from 'lodash/difference';

import moment from 'moment';
import uuid from 'uuid';

let router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const StreamerController = (io) => {
  router.get('/', async (req, res) => {
    let players = await PlayerModel.find();
    res.json({ players });
  });

  router.post('/players', async (req, res) => {
    const { name, photo, position } = req.body;

    const isPlayerExist = await PlayerModel.findOne({ name });

    if (name.length > 20) {
      res.status(400).send({
        error: 'Name can not contain more than 20 characters',
        type: 'name',
      });

      return;
    }

    if (!position) {
      res.status(400).send({
        error: 'serverErrors.position_is_empty',
        type: 'position',
      });

      return;
    }

    if (isPlayerExist) {
      res.status(400).send({
        error: 'serverErrors.champion_already_exist',
        type: 'name',
        name,
      });

      return;
    }

    // let summonerRequest = await riotFetch(`lol/summoner/v4/summoners/by-name/${name}`);
    // summonerRequest = await summonerRequest.json();

    // if(summonerRequest.status && summonerRequest.status.status_code === 404){
    //   res.status(404).send({ name });

    //   return;
    // }

    await PlayerModel.create({
      name,
      photo,
      position,
    });

    res.send({
      name,
      photo,
      position,
    });
  });

  router.get('/players', async (req, res) => {
    const players = await PlayerModel.find();
    res.json({ players });
  });

  router.get('/matches/last/:id', async (req, res) => {
    const accountId = req.params.id;
    const MATCHES_NUMBER = 5;

    if (!user.lolApiKey) {
      res.json({
        matches: [],
      })

      return;
    }

    let matchesList = await riotFetch(`lol/match/v4/matchlists/by-account/${accountId}`);
    matchesList = await matchesList.json();
    matchesList = matchesList.matches.slice(0, 5);

    const matches = await Promise.all(
      matchesList.matches
        .slice(0, MATCHES_NUMBER)
        .map(match =>
          riotFetch(`lol/match/v4/matches/${match.gameId}`).then(result =>
            result.json()
          )
        )
    );

    res.json({
      success: 'true',
      matches,
    });
  });

  router.get('/matches/:id', async (req, res) => {
    const matchId = req.params.id;
    const match = await MatchModel.findOne({ _id: matchId })
      .populate({
        path: 'results',
        populate: {
          path: 'playersResults.player',
          select: 'name'
        },
        populate: {
          path: 'playersResults.results.rule',
          select: 'name'
        }
      })

    res.send({ match });
  });

  router.post('/matches/:id', upload.single('resultFile'), async (req, res) => {
    const matchId = req.params.id;

    const { startDate, completed, name, results } = req.body;

    if (req.file) {
      fs.readFile(req.file.buffer, 'utf8', async (data, err) => {
        const $ = cheerio.load(data.path);
        let parsedMatchResults = [];
  
        $('.classic.player').each((index, element) => {
          const name = $('.champion-nameplate-name', element).find('a').text();
          const [kills, deaths, assists] = $('.kda-kda', element).find('div').map((index, element) => +$(element).text()).get();
  
          parsedMatchResults.push({
            name,
            kda: [kills, deaths, assists],
          });
        });
  
        const match = await MatchModel.findOne({ _id: matchId });
        let matchResult = await MatchResultModel.findOne({ _id: match.resultsId }).populate('playersResults.player', 'name').lean().exec();
  
        // Check if players in match and in lol match results are the same
        const matchPlayersNames = matchResult.playersResults.map(({ player }) => player.name);
        const parsedPlayersNames = parsedMatchResults.map(({ name }) => name);
        const playersDifference = difference(matchPlayersNames, parsedPlayersNames);
  
        if (playersDifference.length > 0) {
          res.status(400).send({
            error: 'serverErrors.players_are_not_same',
          });
  
          return;
        }
  
        matchResult.playersResults.forEach(item => {
          const parsedResult = find(parsedMatchResults, { name: item.player.name });
          item.results.forEach((result, index) => result.score = parsedResult.kda[index]);
        });
  
        await MatchResultModel.findOneAndUpdate({ matchId }, { playersResults: matchResult.playersResults });
      });
    } else {
      await MatchResultModel.findOneAndUpdate({ matchId }, { playersResults: JSON.parse(results) });
    }

    await MatchModel.findByIdAndUpdate(matchId, {
      name,
      startDate,
      completed,
    }, {
      new: true
    });

    let updatedMatch = await MatchModel.findOne({ _id: matchId }, { lean: false })
      .populate({
        path: 'results',
        populate: {
          path: 'playersResults.player',
          select: 'name'
        },
        populate: {
          path: 'playersResults.results.rule',
          select: 'name'
        }
      });

    const realTournamentId = await TournamentModel.findOne({ matches_ids: { $in: [updatedMatch._id] } }).lean().select('_id');
    const fantasyTournamentId = await FantasyTournament.findOne({ tournament: realTournamentId._id }).lean().select('_id');

    updatedMatch.tournament_id = fantasyTournamentId._id;

    io.emit('matchUpdated', { updatedMatch });

    res.send({
      updatedMatch,
    });
  });

  router.post('/tournament', async (req, res) => {
    const { name, userId, matches, thumbnail, playersIds, rulesValues } = req.body;

    let createdMatchesIds = [];

    const generatePlayersResults = (players) => {
      let results = [];
      const rulesIds = Object.keys(rulesValues);
      let rulesMock = rulesIds.map(item => ({ rule: item, score: 0 }));

      for (let i = 0; i < players.length; i++) {
        const playerResult = {
          playerId: players[i],
          results: rulesMock,
        }

        results.push(playerResult);
      }

      return results;
    }

    for (let i = 0; i < matches.length; i++) {
      const [hours, minutes] = matches[i].startTime.split(':');
      let matchDate = moment().hours(hours).minutes(minutes);

      const matchMock = {
        tournament_id: '',
        resultsId: '',
        name: matches[i].name,
        completed: false,
        startDate: matchDate,
        syncAt: matchDate,
        syncType: 'manual',
        origin: 'manual',
      };

      const match = await MatchModel.create(matchMock);
      const matchId = match._id;

      const matchResultMock = {
        matchId,
        playersResults: generatePlayersResults(playersIds),
      };

      const matchResult = await MatchResultModel.create(matchResultMock);
      const matchResultId = matchResult._id;

      await MatchModel.update({ _id: matchId }, { resultsId: matchResultId });

      createdMatchesIds.push(matchId);
    }

    const tournament = await TournamentModel.create({
      name,
      date: new Date().toISOString(),
      champions_ids: playersIds,
      matches_ids: createdMatchesIds,
      syncType: 'manual',
      origin: 'manual',
    });

    const tournamentId = tournament._id;

    const fantasyTournamentRules = Object.entries(rulesValues).map(rule => ({
      rule: rule[0],
      score: rule[1]
    })
    );

    const fantasyTournament = await FantasyTournament.create({
      name,
      thumbnail,
      tournament: tournamentId,
      rules: fantasyTournamentRules,
      creator: userId,
      winner: null,
    });

    const newTournamentPopulated = await FantasyTournament.findOne({ _id: fantasyTournament._id })
      .populate('tournament', 'name date')
      .populate({ path: 'users.players', select: 'id name' })
      .populate({ path: 'users.user', select: '_id username' })

    io.emit('fantasyTournamentCreated', { newTournamentPopulated });

    res.send({ fantasyTournament });
  });

  router.get('/tournament/:id/start', async (req, res) => {
    const tournamentId = req.params.id;
    await FantasyTournament.update({ _id: tournamentId }, { started: true });

    io.emit('fantasyTournamentStarted');

    res.send({
      message: 'Tournament started!',
    })
  })

  router.get('/tournament/:id/finalize', async (req, res) => {
    const tournamentId = req.params.id;

    const fantasyTournament = await FantasyTournament
      .findById(tournamentId)
      .populate({ path: 'users.players', select: '_id id name photo' })
      .populate({ path: 'users.user', select: '_id username' })
      .populate({ path: 'rules.rule' })
      .populate({ path: 'winner', select: 'id username' })
      .populate({ path: 'creator', select: 'id username' })
      .populate('tournament')
      .populate({
        path: 'tournament',
        populate: {
          path: 'champions',
        }
      })
      .populate({
        path: 'tournament',
        populate: {
          path: 'matches',
          populate: {
            path: 'results'
          }
        }
      });

    if (fantasyTournament.winner) {
      res.json({
        success: false,
        message: 'Tournament is already finalized'
      });

      return;
    }

    if (fantasyTournament.users.length === 0) {
      res.json({
        success: false,
        message: "You can't finalize tournament without participants"
      });

      return;
    }

    const realTournament = fantasyTournament.tournament;

    const matches = realTournament.matches;
    const areMatchesCompleted = matches.every(match => match.completed === true);

    const rulesSet = fantasyTournament.rules.reduce((set, item) => {
      set[item.rule._id] = item.score;
      return set;
    }, {});

    let playersCountedResults = [];

    const getUserPlayers = (userId) => {
      const user = find(fantasyTournament.users, (item) => item.user._id === userId);
      return user.players;
    };

    const getCountMatchPoints = (matchId, userId) => {
      const userPlayers = getUserPlayers(userId);
      const userPlayersIds = userPlayers.map(player => player._id);

      const match = find(matches, { _id: matchId });
      const results = match.results.playersResults;

      let userPlayersWithResults = [];

      for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < userPlayersIds.length; j++) {
          if (`${results[i].playerId}` === `${userPlayersIds[j]}`) {
            userPlayersWithResults.push(results[i]);
          }
        }
      }

      const userPlayersResults = userPlayersWithResults.reduce((arr, item) => {
        arr.push(...item.results);
        return arr;
      }, []);

      const userPlayersResultsSum = userPlayersResults.reduce((sum, item) => {
        if (rulesSet[item.rule]) {
          sum += item.score * rulesSet[item.rule];
        }
        return sum;
      }, 0);

      return userPlayersResultsSum;
    };

    const getTotalUserScore = (userId) => {
      const userMatchResults = fantasyTournament.tournament.matches.map(match => getCountMatchPoints(match._id, userId));
      const totalUserScore = userMatchResults.reduce((sum, score) => sum += score);

      return totalUserScore;
    };

    if (!areMatchesCompleted) {
      res.json({
        success: false,
        message: 'Not all matches of the tournament are completed'
      });

      return;
    }

    fantasyTournament.users.forEach(item => {
      playersCountedResults.push({
        user: item.user,
        score: getTotalUserScore(item.user._id)
      })
    });

    const tournamentWinner = playersCountedResults.sort((next, prev) => prev.score - next.score)[0];
    const winnerReward = await RewardModel.create({
      key: uuid(),
      description: `${fantasyTournament.name} reward`,
    });

    await UserModel.updateOne({ _id: tournamentWinner.user._id }, { $push: { rewards: winnerReward._id } });

    await FantasyTournament.updateOne({ _id: tournamentId }, {
      winner: tournamentWinner.user._id,
    });

    const tournamentUserNames = fantasyTournament.users.map(item => item.user.username);

    io.emit('fantasyTournamentFinalized', {
      tournamentId,
      participants: tournamentUserNames,
      winner: tournamentWinner.user.username,
    });

    res.json({
      message: 'Finalization completed',
      success: 'success',
    });
  });

  return router;
}

export default StreamerController;