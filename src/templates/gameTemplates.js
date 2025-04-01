export function generateGameCard(game, logos) {
  return `
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
        ${game.league ? `
          <div class="info-item">
            <i class="fas fa-trophy"></i>
            <span>${game.league}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export function generateGamesHtml(games, styles) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Swiss Unihockey Games</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>${styles}</style>
    </head>
    <body>
      <div class="container">
        <div class="games-list">
          ${games.map(game => generateGameCard(game)).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateRankingsHtml(rankingData, teamId, styles) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Swiss Unihockey Rankings</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      <style>${styles}</style>
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
            ${rankingData.data.regions[0].rows.map(row => {
              const cells = row.cells;
              const isCurrentTeam = row.data.team.id === parseInt(teamId);
              
              return `
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
            }).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}
