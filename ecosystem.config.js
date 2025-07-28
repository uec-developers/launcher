module.exports  = {
  apps: [{
    name: 'uec-client',
    script: 'server/index.js',
    instances: 1,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
 