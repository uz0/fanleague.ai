import find from 'lodash/find';
import express from "express";
import TournamentModel from "../models/tournament";
import FantasyTournament from "../models/fantasy-tournament";
import UserModel from "../models/user";
import RuleModel from "../models/rule";
import TransactionModel from "../models/transaction";
import MatchResult from "../models/match-result";
import MatchModel from "../models/match";
import PlayerModel from "../models/player";
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import config from "../config";

import MockService from "../mockService";

import moment from 'moment';

let router = express.Router();

const SystemController = () => {

  router.get('/reset', async (req, res) => {

    await FantasyTournament.deleteMany();
    await TournamentModel.deleteMany();
    await MatchResult.deleteMany();
    await MatchModel.deleteMany();

    res.send({
      "success": "all data was resetted"
    })

  })

  router.get('/sync', async (req, res) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', config.client_id);
    params.append('client_secret', config.client_secret);

    let auth = await fetch('https://api.abiosgaming.com/v2/oauth/access_token', {
      method: 'POST',
      body: params,
    });

    auth = await auth.json();
    const token = auth.access_token;

    const getAbios = (endPoint, params) => {
      const url = `https://api.abiosgaming.com/v2/${endPoint}?access_token=${token}`;

      if (params) {
        const string = Object.entries(params).map(([key, val]) => `${key}=${val}`).join('&');
        return fetch(`${url}&${string}`);
      }

      return fetch(url);
    };

    const loadPaginatedData = async (endPoint, params) => {
      console.log(`${endPoint} is loading`);
      let firstPage = await getAbios(endPoint, params);
      firstPage = await firstPage.json();
      console.log(`1 of ${firstPage.last_page} page loaded`);

      let list = firstPage.data;

      if (firstPage.last_page === 1) {
        return list;
      }

      const wait = time => new Promise(resolve => setTimeout(() => resolve(), time));

      for (let i = 2; i < firstPage.last_page + 1; i++) {
        const advancedParams = Object.assign(params, { page: i });
        let response = await getAbios(endPoint, advancedParams);
        response = await response.json();

        if (!response.error) {
          console.log(`${i} of ${firstPage.last_page} page loaded`);
          list = list.concat(response.data);
        } else {
          console.log(`${i} of ${firstPage.last_page} page request error`);
          console.log(response);
        }

        await wait(350);
      }

      return list;
    };

    let game = await getAbios('games', { q: 'CS:GO' });
    game = await game.json();
    game = game.data[0];

    let formattedPlayers = [];
    let formattedTournaments = [];
    let formattedMatches = [];

    const countPlayers = await PlayerModel.count();

    if (countPlayers === 0) {
      const players = await loadPaginatedData('players', {'games[]': game.id});

      players.forEach(player => {
        formattedPlayers.push({
          id: player.id,
          name: player.nick_name,
          photo: player.images.default,
        });
      });

      await PlayerModel.deleteMany();
      console.log('Players model cleared');
      await PlayerModel.create(formattedPlayers);
      console.log('Players loaded');
    } else {
      console.log('Players loading skipped');
    }

    const series = await loadPaginatedData('series', {'games[]': game.id, 'with[]': 'matches'});
    const tournaments = await loadPaginatedData('tournaments', {'games[]': game.id, 'with[]': 'series'});

    for (let i = 0; i < tournaments.length; i++) {
      const tournament = tournaments[i];

      let object = {
        id: tournament.id,
        name: tournament.title,
        date: tournament.start,
        champions_ids: [],
        matches_ids: [],
      };

      if (tournament.series && tournament.series.length > 0) {
        for (let j = 0; j < tournament.series.length; j++) {
          let oneSeries = find(series, { id: tournament.series[j].id }) || tournament.series[j];

          if (oneSeries.matches && oneSeries.matches.length > 0) {
            oneSeries.matches.forEach(match => {
              formattedMatches.push({
                id: match.id,
                tournament_id: tournament.id,
                // в абиос нет даты у матча, вставил даты турнира
                startDate: tournament.start,
                endDate: tournament.end,
                results: null,
                completed: false,
              });

              object.matches_ids.push(match.id);
            });
          }

          if (oneSeries.rosters && oneSeries.rosters.length > 0) {
            oneSeries.rosters.forEach(roster => {
              roster.players.forEach(player => {
                object.champions_ids.push(player.id);
              });
            });
          }
        }
      }

      formattedTournaments.push(object);
    }

    await MatchModel.deleteMany();
    console.log('Matches creared');
    await MatchModel.create(formattedMatches);
    console.log('Matches loaded');

    await TournamentModel.deleteMany();
    console.log('Tournaments creared');
    await TournamentModel.create(formattedTournaments);
    console.log('Tournaments loaded');

    res.send({
      success: 'Sync successfully completed',
    });
  })

  router.get('/finalize', async (req, res) => {

    // here we will store refs of the tournaments without winner and finished matches
    let finishedTournaments = [];

    // Query all tournaments without winner
    const tournaments = await FantasyTournament
      .find({ winner: null })
      .populate('tournament')
      .populate('rules.rule')
      .populate({ path: 'users.players', select: 'name' })
      .populate({ path: 'users.user', select: '_id username' })
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
          },
        }
      })


    // Filter tournaments, leaving only finished ones
    tournaments.forEach(tournament => {

      // presume that all matches of the tournament are finished
      let allMatchesCompleted = true;

      tournament.tournament.matches.forEach(match => {
        if(!match.completed){
          allMatchesCompleted = false;
        }
      })

      if (allMatchesCompleted){
        // finishedTournaments.push(tournament)
        finishedTournaments.push({
          _id: tournament._id,
          users: tournament.users,
          matches: tournament.tournament.matches,
          rules: tournament.rules,
        })
      }

    })

    const findTournamentWinner = (tournament) => {

      const users = tournament.users;
      const usersResults = [];

    }


    finishedTournaments.forEach(tournament => {
      findTournamentWinner(tournament);
    })

    res.send({
      // tournaments,
      finishedTournaments,
      // tournament, 
    })

  });

  router.get('/tournaments', async (req, res) => {
    const tournaments = await TournamentModel.find({})
    .populate('champions')
    .populate('matches')

    res.send({
      tournaments
    })
  })

  router.get('/createmock', async (req, res) => {

    let tournamentRef = '';
    let tournamentChampions = [];

    let championsResults = () => tournamentChampions.map(item => {
      let result = MockService.generatePlayerResult(item);
      return result;
    })

    let matches = [];
    let matchesRefs = [];

    let matchResults = [];
    let matchResultsRefs = [];

    const matchDateGap = 150000; // <- this equals 7.5 minutes
    const tournamentDateGap = 86400000; // <- this equals 1 day

    const tournament = await TournamentModel.create({
      name: MockService.getRandomTournamentName(),
      // date: Date.now() + 86400000,
      date: moment.now(),
      champions: MockService.getRandomTournamentChampions(),
    })

    const createdTournament = await TournamentModel.find({}).sort({_id:-1}).limit(1).populate('champions');
    
    tournamentRef = createdTournament[0]._id;
    tournamentChampions = createdTournament[0].champions.map(item => item.name);
    
    // matches array
    for(let i = 0; i <= 5; i++){

      matches.push({
        tournament: tournamentRef,
        startDate: (Date.now() - matchDateGap) + matchDateGap * i,
        endDate: Date.now() + matchDateGap * i,
        // date: Date.now() + 86400000 + (matchDateGap * i) - 900000,
        completed: false,
      })

    }
    
    await MatchModel.insertMany(matches)
    
    const insertedMatches = await MatchModel.find({}).sort({_id:-1}).limit(5);

    matchesRefs = insertedMatches.map(item => item._id);
    
    // match results array
    for(let i = 0; i <= 5; i++){

      matchResults.push({
        matchId: matchesRefs[i],
        playersResults: championsResults(),
      })

    }

    await MatchResult.insertMany(matchResults)

    const insertedResults = await MatchResult.find({}).sort({_id:-1}).limit(5);

    matchResultsRefs = insertedResults.map(item => { 
      return item._id
    });

    for(let i = 0; i <= 5; i++){
      await MatchModel.update({ _id: matchesRefs[i] }, { results: matchResultsRefs[i]})
    }

    await TournamentModel.findByIdAndUpdate(tournamentRef, { matches: matchesRefs })

    const newTournament = await TournamentModel.find({}).sort({_id:-1}).limit(1)
      .populate('champions')
      .populate('matches')
      .populate({
        path: 'matches',
        populate: {
          path: 'results',
          model: 'MatchResult',
          select: 'playersResults'
        }
      });

    res.send({
      "success": "success",
      newTournament
    });

  })
  
  return router;
}

export default SystemController