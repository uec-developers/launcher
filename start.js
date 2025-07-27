const  { spawn } = require('child_process')

// Start the server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
})

server.on('error', (err) => {
  console.error('Server error:', err)
})

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`)
})

console.log('Server started on port 3001')
 