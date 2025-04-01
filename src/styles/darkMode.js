export function createDarkModeStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    body {
      background-color: rgb(25, 25, 25);
      color: #fff;
      padding: 1rem;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .games-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .game-card {
      background: rgb(35, 35, 35);
      border-radius: 8px;
      padding: 0.75rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    
    .teams {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    
    .team {
      display: flex;
      align-items: center;
      flex-direction: column;
      text-align: center;
      flex: 1;
    }
    
    .team-logo {
      width: 45px;
      height: 45px;
      object-fit: contain;
      margin-bottom: 0.5rem;
      filter: brightness(0.9);
    }
    
    .team-name {
      font-size: 0.9rem;
      color: #fff;
    }
    
    .vs {
      font-size: 0.8rem;
      color: #666;
    }
    
    .result {
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }
    
    .game-info {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #999;
      font-size: 0.85rem;
    }
    
    .info-item i {
      color: #666;
    }
    
    .info-item a {
      color: #999;
      text-decoration: none;
    }
    
    .info-item a:hover {
      color: #fff;
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
      }
      
      .team-logo {
        width: 35px;
        height: 35px;
      }
      
      .team-name {
        font-size: 0.8rem;
      }
      
      .game-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        gap: 0.5rem;
        font-size: 0.75rem;
      }
      
      .info-item {
        justify-content: center;
        text-align: center;
      }
      
      .info-item i {
        font-size: 0.9rem;
      }
    }
  `;
}

export function createDarkModeRankingStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    body {
      background-color: rgb(25, 25, 25);
      color: #fff;
      padding: 1rem;
    }
    
    .container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .rankings-table {
      width: 100%;
      border-collapse: collapse;
      background: rgb(35, 35, 35);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    }
    
    .rankings-table th,
    .rankings-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .rankings-table th {
      background-color: rgb(45, 45, 45);
      font-weight: 500;
      color: #999;
      font-size: 0.85rem;
    }
    
    .rankings-table tr:last-child td {
      border-bottom: none;
    }
    
    .rankings-table tr:hover {
      background-color: rgb(40, 40, 40);
    }
    
    .team-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .team-logo {
      width: 25px;
      height: 25px;
      object-fit: contain;
      filter: brightness(0.9);
    }
    
    .highlight {
      background-color: rgba(255, 255, 255, 0.05) !important;
    }
    
    .highlight:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
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
        background: rgb(35, 35, 35);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .rankings-table td {
        display: block;
        padding: 0;
        border: none;
        color: #fff;
      }
      
      .rankings-table td[data-label="Rang"] {
        grid-area: rank;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .rankings-table td[data-label="Team"] {
        grid-area: team;
      }
      
      .rankings-table td[data-label="Punkte"] {
        grid-area: points;
        font-size: 1.1rem;
        font-weight: 600;
      }
      
      .stats-container {
        grid-area: stats;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        margin-top: 0.5rem;
      }
      
      .rankings-table td[data-label="Spiele"],
      .rankings-table td[data-label="Siege"],
      .rankings-table td[data-label="Unent."],
      .rankings-table td[data-label="Nied."],
      .rankings-table td[data-label="Tore"],
      .rankings-table td[data-label="TD"] {
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: rgb(45, 45, 45);
        color: #999;
      }
      
      .rankings-table td[data-label="Spiele"]::before,
      .rankings-table td[data-label="Siege"]::before,
      .rankings-table td[data-label="Unent."]::before,
      .rankings-table td[data-label="Nied."]::before,
      .rankings-table td[data-label="Tore"]::before,
      .rankings-table td[data-label="TD"]::before {
        content: attr(data-label) ": ";
        color: #666;
        margin-right: 0.25rem;
        font-size: 0.7rem;
      }
    }
  `;
}
