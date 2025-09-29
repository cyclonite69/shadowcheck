const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:server": "tsx watch server/index.ts",
  "dev:client": "cd client && npm run dev",
  "build": "npm run build:client",
  "build:client": "cd client && npm run build",
  "start": "npm run start:server",
  "start:server": "tsx server/index.ts",
  "docker:build": "docker-compose build",
  "docker:up": "docker-compose up -d",
  "docker:down": "docker-compose down",
  "docker:logs": "docker-compose logs -f",
  "docker:restart": "docker-compose restart",
  "docker:reset": "docker-compose down -v && docker-compose up -d"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
