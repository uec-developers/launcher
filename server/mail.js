const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Sends mail and BCCs all to ueclauncher@gmail.com, always includes sender
async function sendMail({ to, subject, text, from }) {
  const msg = {
    to,
    from: from || process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    bcc: 'ueclauncher@gmail.com',
    replyTo: from || process.env.SENDGRID_FROM_EMAIL
  }
  try {
    await sgMail.send(msg)
    return true
  } catch (err) {
    console.error('SendGrid error:', err)
    return false
  }
}

module.exports = { sendMail }
