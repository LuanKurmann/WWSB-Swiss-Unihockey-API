import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to determine the current season
function getCurrentSeason() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  
  // If we're in July or later, use the current year, otherwise use previous year
  return currentMonth >= 7 ? currentYear : currentYear - 1;
}

// Helper function to parse date string (DD.MM.YYYY) to Date object
function parseSwissDate(dateStr) {
  const [day, month, year] = dateStr.split('.').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day); // month - 1 because JavaScript months are 0-based
}

// Helper function to get game details including team logos
async function getGameDetails(gameId) {
  try {
    const response = await fetch(`https://api-v2.swissunihockey.ch/api/games/${gameId}`);
    const data = await response.json();
    const cells = data.data.regions[0].rows[0].cells;
    return {
      homeLogo: cells[0].image?.url || '',
      awayLogo: cells[2].image?.url || ''
    };
  } catch (error) {
    console.error(`Error fetching game details for game ${gameId}:`, error);
    return { homeLogo: '', awayLogo: '' };
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Swiss Unihockey API endpoint
app.get('/api/games', async (req, res) => {
  try {
    const season = getCurrentSeason();
    const response = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=club&club_id=447636&season=${season}`);
    const data = await response.json();
    
    // Extract and sort games by date
    const games = data.data.regions[0].rows.map(row => {
      const cells = row.cells;
      const locationCell = cells[1];
      const coordinates = locationCell.link?.type === 'map' ? [locationCell.link.y, locationCell.link.x] : [];
      const locationUrl = coordinates.length === 2 
        ? `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`
        : '';
      
      return {
        gameId: row.link?.ids?.[0],
        date: Array.isArray(cells[0].text) ? cells[0].text[0] : '',
        time: Array.isArray(cells[0].text) ? cells[0].text[1] : '',
        location: Array.isArray(cells[1].text) ? cells[1].text.join(', ') : '',
        locationUrl,
        league: Array.isArray(cells[2].text) ? cells[2].text.join(' - ') : '',
        homeTeam: Array.isArray(cells[3].text) ? cells[3].text[0] : '',
        awayTeam: Array.isArray(cells[4].text) ? cells[4].text[0] : '',
        result: Array.isArray(cells[5].text) ? cells[5].text[0] : '-'
      };
    }).sort((a, b) => {
      const dateA = parseSwissDate(a.date);
      const dateB = parseSwissDate(b.date);
      return dateB - dateA; // Sort descending (newest first)
    }).slice(0, 10); // Only take the top 5 games
    
    // Create modern HTML layout
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Swiss Unihockey Games</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
          
          body {
            background-color: #fff;
            padding: 2rem;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .games-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .game-card {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
          }
          
          .teams {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8rem;
          }
          
          .team {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 0 1 200px;
          }
          
          .team-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 0.5rem;
          }
          
          .team-name {
            font-weight: 600;
            color: #333;
            font-size: 1rem;
          }
          
          .vs-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }
          
          .vs {
            font-size: 1.1rem;
            color: #666;
            font-weight: 600;
          }
          
          .result {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            text-align: center;
          }
          
          .game-info {
            border-top: 1px solid #eee;
            margin-top: 1rem;
            padding-top: 0.75rem;
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            color: #666;
            font-size: 0.9rem;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .info-item i {
            color: #888;
            width: 1rem;
            text-align: center;
          }
          
          .location-link {
            color: inherit;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .location-link:hover {
            color: #0066cc;
          }
          
          .location-link:hover i {
            color: #0066cc;
          }
          
          @media (max-width: 768px) {
            body {
              padding: 0.5rem;
            }
            
            .container {
              padding: 0;
            }
            
            .games-list {
              gap: 0.5rem;
            }
            
            .game-card {
              padding: 0.75rem;
              border-radius: 8px;
            }
            
            .teams {
              gap: 1rem;
            }
            
            .team {
              flex: 0 1 auto;
            }
            
            .team-logo {
              width: 40px;
              height: 40px;
            }
            
            .team-name {
              font-size: 0.8rem;
              max-width: 80px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .vs {
              display: none;
            }
            
            .result {
              font-size: 1.2rem;
            }
            
            .game-info {
              margin-top: 0.75rem;
              padding-top: 0.75rem;
              gap: 0.75rem;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
              grid-gap: 0.5rem;
            }
            
            .info-item {
              font-size: 0.8rem;
              text-align: center;
            }
            
            .info-item i {
              font-size: 0.9rem;
              display: block;
              margin-bottom: 0.2rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="games-list">
    `;
    
    // Add game cards
    for (const game of games) {
      let logos = { homeLogo: '', awayLogo: '' };
      if (game.gameId) {
        logos = await getGameDetails(game.gameId);
      }
      
      html += `
        <div class="game-card">
          <div class="teams">
            <div class="team">
              <img src="${logos.homeLogo}" alt="${game.homeTeam}" class="team-logo">
              <div class="team-name">${game.homeTeam}</div>
            </div>
            <div class="vs-container">
              <div class="vs">VS</div>
              <div class="result">${game.result}</div>
            </div>
            <div class="team">
              <img src="${logos.awayLogo}" alt="${game.awayTeam}" class="team-logo">
              <div class="team-name">${game.awayTeam}</div>
            </div>
          </div>
          <div class="game-info">
            <div class="info-item">
              <i class="far fa-calendar"></i>
              <span>${game.date}</span>
            </div>
            <div class="info-item">
              <i class="far fa-clock"></i>
              <span>${game.time}</span>
            </div>
            <div class="info-item">
              ${game.locationUrl ? `
                <a href="${game.locationUrl}" target="_blank" rel="noopener noreferrer" class="location-link">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${game.location}</span>
                </a>
              ` : `
                <i class="fas fa-map-marker-alt"></i>
                <span>${game.location}</span>
              `}
            </div>
            <div class="info-item">
              <i class="fas fa-trophy"></i>
              <span>${game.league}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching data from Swiss Unihockey API');
  }
});

// Swiss Unihockey API endpoint for team games
app.get('/api/team-games/:teamId', async (req, res) => {
  try {
    const season = getCurrentSeason();
    const teamId = req.params.teamId;
    const response = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=team&team_id=${teamId}&season=${season}`);
    const data = await response.json();
    
    // Extract and sort games by date
    const games = data.data.regions[0].rows.map(row => {
      const cells = row.cells;
      const locationCell = cells[1];
      const coordinates = locationCell.link?.type === 'map' ? [locationCell.link.y, locationCell.link.x] : [];
      const locationUrl = coordinates.length === 2 
        ? `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`
        : '';
      
      return {
        gameId: row.link?.ids?.[0],
        date: Array.isArray(cells[0].text) ? cells[0].text[0] : '',
        time: Array.isArray(cells[0].text) ? cells[0].text[1] : '',
        location: Array.isArray(cells[1].text) ? cells[1].text.join(', ') : '',
        locationUrl,
        homeTeam: Array.isArray(cells[2].text) ? cells[2].text[0] : '', 
        awayTeam: Array.isArray(cells[3].text) ? cells[3].text[0] : '', 
        result: Array.isArray(cells[4].text) ? cells[4].text[0] : '-'   
      };
    }).sort((a, b) => {
      const dateA = parseSwissDate(a.date);
      const dateB = parseSwissDate(b.date);
      return dateB - dateA; // Sort descending (newest first)
    }).slice(0, 5); // Only take the top 5 games
    
    // Create modern HTML layout
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Swiss Unihockey Team Games</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
          
          body {
            background-color: #fff;
            padding: 2rem;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .games-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .game-card {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          
          .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
          }
          
          .teams {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8rem;
          }
          
          .team {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            flex: 0 1 200px;
          }
          
          .team-logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
            margin-bottom: 0.5rem;
          }
          
          .team-name {
            font-weight: 600;
            color: #333;
            font-size: 1rem;
          }
          
          .vs-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
          }
          
          .vs {
            font-size: 1.1rem;
            color: #666;
            font-weight: 600;
          }
          
          .result {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            text-align: center;
          }
          
          .game-info {
            border-top: 1px solid #eee;
            margin-top: 1rem;
            padding-top: 0.75rem;
            display: flex;
            justify-content: center;
            gap: 2rem;
            flex-wrap: wrap;
            color: #666;
            font-size: 0.9rem;
          }
          
          .info-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .info-item i {
            color: #888;
            width: 1rem;
            text-align: center;
          }
          
          .location-link {
            color: inherit;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .location-link:hover {
            color: #0066cc;
          }
          
          .location-link:hover i {
            color: #0066cc;
          }
          
          @media (max-width: 768px) {
            body {
              padding: 0.5rem;
            }
            
            .container {
              padding: 0;
            }
            
            .games-list {
              gap: 0.5rem;
            }
            
            .game-card {
              padding: 0.75rem;
              border-radius: 8px;
            }
            
            .teams {
              gap: 1rem;
            }
            
            .team {
              flex: 0 1 auto;
            }
            
            .team-logo {
              width: 40px;
              height: 40px;
            }
            
            .team-name {
              font-size: 0.8rem;
              max-width: 80px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .vs {
              display: none;
            }
            
            .result {
              font-size: 1.2rem;
            }
            
            .game-info {
              margin-top: 0.75rem;
              padding-top: 0.75rem;
              gap: 0.75rem;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
              grid-gap: 0.5rem;
            }
            
            .info-item {
              font-size: 0.8rem;
              text-align: center;
            }
            
            .info-item i {
              font-size: 0.9rem;
              display: block;
              margin-bottom: 0.2rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="games-list">
    `;
    
    // Add game cards
    for (const game of games) {
      let logos = { homeLogo: '', awayLogo: '' };
      if (game.gameId) {
        logos = await getGameDetails(game.gameId);
      }
      
      html += `
        <div class="game-card">
          <div class="teams">
            <div class="team">
              <img src="${logos.homeLogo}" alt="${game.homeTeam}" class="team-logo">
              <div class="team-name">${game.homeTeam}</div>
            </div>
            <div class="vs-container">
              <div class="vs">VS</div>
              <div class="result">${game.result}</div>
            </div>
            <div class="team">
              <img src="${logos.awayLogo}" alt="${game.awayTeam}" class="team-logo">
              <div class="team-name">${game.awayTeam}</div>
            </div>
          </div>
          <div class="game-info">
            <div class="info-item">
              <i class="far fa-calendar"></i>
              <span>${game.date}</span>
            </div>
            <div class="info-item">
              <i class="far fa-clock"></i>
              <span>${game.time}</span>
            </div>
            <div class="info-item">
              ${game.locationUrl ? `
                <a href="${game.locationUrl}" target="_blank" rel="noopener noreferrer" class="location-link">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>${game.location}</span>
                </a>
              ` : `
                <i class="fas fa-map-marker-alt"></i>
                <span>${game.location}</span>
              `}
            </div>
          </div>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching data from Swiss Unihockey API');
  }
});

// Swiss Unihockey API endpoint for team rankings
app.get('/api/team-rankings/:teamId', async (req, res) => {
  try {
    const season = getCurrentSeason();
    const teamId = req.params.teamId;

    // First, get the team's league information
    const teamResponse = await fetch(`https://api-v2.swissunihockey.ch/api/games?mode=list&team_id=${teamId}&season=${season}`);
    const teamData = await teamResponse.json();
    const context = teamData.data.context;

    // Then get the rankings using the league information
    const rankingResponse = await fetch(`https://api-v2.swissunihockey.ch/api/rankings?tabs=off&locale=de_CH&split=on&season=${season}&league=${context.league}&game_class=${context.game_class}&view=full&group=${encodeURIComponent(context.group)}`);
    const rankingData = await rankingResponse.json();
    
    // Create modern HTML layout
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Swiss Unihockey Rankings</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
          
          body {
            background-color: #fff;
            padding: 2rem;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .rankings-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .rankings-table th,
          .rankings-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          
          .rankings-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
          }
          
          .rankings-table tr:last-child td {
            border-bottom: none;
          }
          
          .rankings-table tr:hover {
            background-color: #f8f9fa;
          }
          
          .team-cell {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .team-logo {
            width: 30px;
            height: 30px;
            object-fit: contain;
          }
          
          .highlight {
            background-color: #e8f4ff !important;
          }
          
          .highlight:hover {
            background-color: #d8ecff !important;
          }
          
          @media (max-width: 768px) {
            body {
              padding: 0.5rem;
            }
            
            .container {
              padding: 0;
            }

            .rankings-table {
              display: block;
              box-shadow: none;
              background: transparent;
            }
            
            .rankings-table thead {
              display: none;
            }
            
            .rankings-table tbody {
              display: block;
            }
            
            .rankings-table tr {
              display: grid;
              grid-template-columns: auto 1fr auto;
              grid-template-areas: 
                "rank team points"
                "stats stats stats";
              gap: 0.5rem;
              margin-bottom: 0.5rem;
              padding: 0.75rem;
              border-radius: 8px;
              background: white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .rankings-table td {
              display: block;
              padding: 0;
              border: none;
            }
            
            .rankings-table td[data-label="Rang"] {
              grid-area: rank;
              font-size: 1.2rem;
              font-weight: bold;
            }
            
            .rankings-table td[data-label="Team"] {
              grid-area: team;
            }
            
            .rankings-table td[data-label="Punkte"] {
              grid-area: points;
              font-size: 1.2rem;
              font-weight: bold;
            }
            
            .rankings-table td[data-label="Spiele"],
            .rankings-table td[data-label="Siege"],
            .rankings-table td[data-label="Unent."],
            .rankings-table td[data-label="Nied."],
            .rankings-table td[data-label="Tore"],
            .rankings-table td[data-label="TD"] {
              grid-area: stats;
              display: inline-flex;
              align-items: center;
              font-size: 0.75rem;
              margin-right: 0.5rem;
              background: #f8f9fa;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              white-space: nowrap;
            }
            
            .rankings-table td[data-label="Spiele"]::before,
            .rankings-table td[data-label="Siege"]::before,
            .rankings-table td[data-label="Unent."]::before,
            .rankings-table td[data-label="Nied."]::before,
            .rankings-table td[data-label="Tore"]::before,
            .rankings-table td[data-label="TD"]::before {
              content: attr(data-label) ": ";
              font-weight: normal;
              color: #666;
              margin-right: 0.25rem;
              font-size: 0.7rem;
            }
            
            .stats-container {
              grid-area: stats;
              display: flex;
              flex-wrap: wrap;
              gap: 0.25rem;
              margin-top: 0.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <table class="rankings-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Team</th>
                <th>Spiele</th>
                <th>S</th>
                <th>U</th>
                <th>N</th>
                <th>Tore</th>
                <th>TD</th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Add ranking rows
    for (const row of rankingData.data.regions[0].rows) {
      const cells = row.cells;
      const isCurrentTeam = row.data.team.id === parseInt(teamId);
      
      html += `
        <tr class="${isCurrentTeam ? 'highlight' : ''}">
          <td data-label="Rang">${cells[0].text[0]}</td>
          <td data-label="Team">
            <div class="team-cell">
              <img src="${cells[1].image?.url || ''}" alt="${cells[2].text[0]}" class="team-logo">
              ${cells[2].text[0]}
            </div>
          </td>
          <td data-label="Punkte">${cells[11].text[0]}</td>
          <div class="stats-container">
            <td data-label="Spiele">${cells[3].text[0]}</td>
            <td data-label="Siege">${cells[5].text[0]}</td>
            <td data-label="Unent.">${cells[6].text[0]}</td>
            <td data-label="Nied.">${cells[7].text[0]}</td>
            <td data-label="Tore">${cells[8].text[0]}</td>
            <td data-label="TD">${cells[9].text[0]}</td>
          </div>
        </tr>
      `;
    }
    
    html += `
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error fetching data from Swiss Unihockey API');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});