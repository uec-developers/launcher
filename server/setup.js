// Interactive setup script for UEC Launcher
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function main() {
  console.log('UEC Launcher Setup Wizard');
  // Mail system and domain setup
  const domain = await ask('What domain will you use for the frontend (e.g. example.com)? ');
  const smtpHost = await ask('SMTP host (default: localhost): ') || 'localhost';
  const smtpPort = await ask('SMTP port (default: 25): ') || '25';
  const smtpUser = await ask('SMTP username (leave blank if none): ');
  const smtpPass = await ask('SMTP password (leave blank if none): ');
  const smtpFrom = await ask('Sender email (SMTP_FROM_EMAIL): ');
  const redisUrl = await ask('Redis URL (default: redis://localhost:6379): ') || 'redis://localhost:6379';
  const jwtSecret = await ask('JWT secret (random string): ');
  // Admin account
  const adminUser = await ask('Admin username: ');
  const adminEmail = await ask('Admin email: ');
  const adminPass = await ask('Admin password: ');

  // Write .env
  const envContent = `JWT_SECRET=${jwtSecret}
DATABASE_URL=./data/database.sqlite
PORT=3001
FRONTEND_URL=https://${domain}
REDIS_URL=${redisUrl}
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
${smtpUser ? `SMTP_USER=${smtpUser}\n` : ''}${smtpPass ? `SMTP_PASS=${smtpPass}\n` : ''}SMTP_FROM_EMAIL=${smtpFrom}
`;
  fs.writeFileSync(path.join(__dirname, '../.env'), envContent);
  console.log('.env file created!');

  // Create admin user in DB
  const dbPath = path.join(__dirname, '../data/database.sqlite');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new sqlite3.Database(dbPath);
  const bcrypt = require('bcrypt');
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      is_online INTEGER DEFAULT 0,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    const hash = bcrypt.hashSync(adminPass, 10);
    db.run('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [adminUser, adminEmail, hash, 'admin'],
      function(err) {
        if (err) {
          console.log('Admin user already exists or error:', err.message);
        } else {
          console.log('Admin user created!');
        }
        db.close();
        rl.close();
      }
    );
  });
}

main();
