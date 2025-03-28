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
    }).slice(0, 5); // Only take the top 5 games
    
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
          
          h1 {
            color: #333;
            margin-bottom: 2rem;
            text-align: center;
            font-size: 2.5rem;
          }
          
          .season-info {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
            font-size: 1.2rem;
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
            gap: 3rem;
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
              padding: 1rem;
            }
            
            .teams {
              gap: 1.5rem;
            }
            
            .team-logo {
              width: 60px;
              height: 60px;
            }
            
            .team-name {
              font-size: 0.9rem;
            }
            
            .game-info {
              gap: 1rem;
              font-size: 0.85rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Spielübersicht</h1>
          <div class="season-info">Season ${season}/${season + 1}</div>
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

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});