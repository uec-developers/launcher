// Mail worker: pulls queued emails from Redis and sends via SMTP
const redis = require('redis');
const nodemailer = require('nodemailer');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 25,
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

async function processQueue() {
  await redisClient.connect();
  while (true) {
    const data = await redisClient.blPop('mailQueue', 0);
    if (data && data.element) {
      const mail = JSON.parse(data.element);
      try {
        await transporter.sendMail(mail);
        console.log('Mail sent:', mail);
      } catch (err) {
        console.error('Mail send error:', err);
      }
    }
  }
}

processQueue();
