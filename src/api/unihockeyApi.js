export async function fetchGames(season) {
  const response = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=club&club_id=447636&season=${season}`);
  const data = await response.json();
  return data;
}

export async function fetchTeamGames(teamId, season) {
  const response = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=team&team_id=${teamId}&season=${season}`);
  const data = await response.json();
  return data;
}

export async function fetchTeamRankings(teamId, season) {
  // First, get the team's league information
  const teamResponse = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=list&team_id=${teamId}&season=${season}`);
  const teamData = await teamResponse.json();
  const context = teamData.data.context;

  // Then get the rankings using the league information
  const rankingResponse = await fetch(`https://api-v2.swissunihockey.ch/api/rankings?tabs=off&locale=de_CH&split=on&season=${season}&league=${context.league}&game_class=${context.game_class}&view=full&group=${encodeURIComponent(context.group)}`);
  const rankingData = await rankingResponse.json();
  return rankingData;
}

export async function getGameDetails(gameId) {
  try {
    const response = await fetch(`https://api-v2.swissunihockey.ch/api/games/${gameId}`);
    const data = await response.json();
    
    const teams = data.data.regions[0].rows[0].cells[0].text;
    const images = data.data.regions[0].rows[0].cells[0].images || [];
    
    return {
      homeLogo: images[0]?.url || '',
      awayLogo: images[1]?.url || ''
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return { homeLogo: '', awayLogo: '' };
  }
}
