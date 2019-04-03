import http from './httpService';
import moment from 'moment';
import BasicService from './basicService';

export default class TournamentService extends BasicService {
  participateInTournament = async(tournamentId, players) => {
    return this.request('POST', `/api/tournaments/${tournamentId}/setup`, players);
  }

  createNewTournament = (payload) => {
    return this.request('POST', '/api/tournaments', payload);
  }

  getRealTournaments = async() => {
    let tournamentsQuery = await http('/api/tournaments/real');
    let tournaments = await tournamentsQuery.json();
    return tournaments;
  }

  getFantasyTournaments = async() => {
    let tournamentsQuery = await http('/api/tournaments/fantasy');
    let tournaments = await tournamentsQuery.json();
    return tournaments;
  }

  getAllTournaments = async() => {
    let tournamentsQuery = await http('/api/tournaments');
    let tournaments = await tournamentsQuery.json();
    return tournaments;
  }

  getMyTournaments = async() => {
    let tournamentsQuery = await http('/api/tournaments/my');
    let tournaments = await tournamentsQuery.json();
    return tournaments;
  }

  getUserTournamentsById = async(id) => {
    let tournamentsQuery = await http(`/api/tournaments/user/${id}`);
    let tournaments = await tournamentsQuery.json();
    return tournaments;
  }

  getTournamentById = async(id) => {
    let tournamentQuery = await http(`/api/tournaments/${id}`);
    let tournament = await tournamentQuery.json();
    return tournament;
  }

  filterTournamentsByEntry = async(entryValue) => {
    let tournamentsQuery = await http('/api/tournaments/fantasy');
    let tournaments = await tournamentsQuery.json();
    return tournaments.tournaments.filter(item => item.entry >= entryValue);
  }

  filterTournamentsByDate = async(filterDate) => {
    let tournaments = await this.getAllTournaments();
    return tournaments.tournaments.filter(item => moment(item.date).isAfter(filterDate));
  }

  filterTournamentsBySelect = async(filterSelect) => {
    const { tournaments } = await this.getFantasyTournaments();
    return tournaments.filter(item => item.tournament.name === filterSelect);
  }

}
