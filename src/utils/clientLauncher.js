//  Client launcher utilities
export const clientLauncher = {
  // Launch client with configuration
  launchClient: (clientName, config = {}) => {
    const clientConfigs = {
      'Resent': {
        name: 'Resent Client',
        url: '/clients/resent/index.html',
        description: 'Enhanced performance and UI',
        features: ['OptiFine', 'Shaders', 'Performance']
      },
      'Shadow': {
        name: 'Shadow Client',
        url: '/clients/shadow/index.html',
        description: 'Try the new beta features!',
        features: ['Beta Features', 'Advanced PVP', 'Custom UI']
      },
      'Astra': {
        name: 'Astra Client',
        url: '/clients/astra/index.html',
        description: 'Lightweight and fast',
        features: ['Lightweight', 'Fast Loading', 'Clean UI']
      },
      'Star-like': {
        name: 'Star-like Client',
        url: '/clients/starlike/index.html',
        description: 'Premium features included',
        features: ['Premium Features', 'Custom Mods', 'Enhanced Graphics']
      },
      'eagly-mc': {
        name: 'Eagly-MC Client',
        url: '/clients/eaglymc/index.html',
        description: 'Classic Eaglercraft experience',
        features: ['Classic Experience', 'Stable', 'Compatible']
      }
    }

    const client = clientConfigs[clientName]
    if (!client) {
      console.error(`Client ${clientName} not found`)
      return false
    }

    // Build URL with configuration parameters
    const params = new URLSearchParams(config)
    const launchUrl = `${client.url}${params.toString() ? '?' + params.toString() : ''}`
    
    // Launch in new window/tab
    window.open(launchUrl, '_blank')
    
    // Log launch event
    console.log(`Launched ${client.name} with config:`, config)
    
    return true
  },

  // Get client information
  getClientInfo: (clientName) => {
    const clientConfigs = {
      'Resent': {
        name: 'Resent Client',
        url: '/clients/resent/index.html',
        description: 'Enhanced performance and UI',
        features: ['OptiFine', 'Shaders', 'Performance']
      },
      'Shadow': {
        name: 'Shadow Client',
        url: '/clients/shadow/index.html',
        description: 'Try the new beta features!',
        features: ['Beta Features', 'Advanced PVP', 'Custom UI']
      },
      'Astra': {
        name: 'Astra Client',
        url: '/clients/astra/index.html',
        description: 'Lightweight and fast',
        features: ['Lightweight', 'Fast Loading', 'Clean UI']
      },
      'Star-like': {
        name: 'Star-like Client',
        url: '/clients/starlike/index.html',
        description: 'Premium features included',
        features: ['Premium Features', 'Custom Mods', 'Enhanced Graphics']
      },
      'eagly-mc': {
        name: 'Eagly-MC Client',
        url: '/clients/eaglymc/index.html',
        description: 'Classic Eaglercraft experience',
        features: ['Classic Experience', 'Stable', 'Compatible']
      }
    }

    return clientConfigs[clientName] || null
  },

  // Get all available clients
  getAllClients: () => {
    return ['Resent', 'Shadow', 'Astra', 'Star-like', 'eagly-mc']
  }
}
 