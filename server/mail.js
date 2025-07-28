
const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect once at startup
let redisReady = false;
async function ensureRedisConnected() {
  if (!redisReady) {
    await redisClient.connect();
    redisReady = true;
  }
}

// Graceful shutdown
process.on('exit', async () => {
  if (redisReady) await redisClient.disconnect();
});
process.on('SIGINT', async () => {
  if (redisReady) await redisClient.disconnect();
  process.exit();
});
process.on('SIGTERM', async () => {
  if (redisReady) await redisClient.disconnect();
  process.exit();
});


async function sendMail({ to, subject, text, from }) {
  const mail = {
    to,
    from: from || process.env.SMTP_FROM_EMAIL || 'noreply@uec.com',
    subject,
    text,
    bcc: 'ueclauncher@gmail.com',
    replyTo: from || process.env.SMTP_FROM_EMAIL || 'noreply@uec.com'
  };
  try {
    await ensureRedisConnected();
    await redisClient.rPush('mailQueue', JSON.stringify(mail));
    return true;
  } catch (err) {
    console.error('Mail queue error:', err);
    return false;
  }
}

module.exports = { sendMail };
