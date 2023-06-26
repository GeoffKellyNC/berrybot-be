const ai_base_config = {
    active: true,
    thresholds: {
      sexual: 0.94,
      hate: 0.95,
      violence: 0.99,
      'self-harm': 0.95,
      'sexual/minors': 0.90,
      'hate/threatening': 0.97,
      'violence/graphic': 0.95,
      harassment: 0.97,
      'harassment/threatening': 0.96,
      'self-harm/intent': 0.93,
      'self-harm/instruction': 0.95,
    },
    punishments: {
      sexual: {
        action: 'timeout',
        duration: 3600,
        enabled: true
      },
      hate: {
        action: 'ban',
        duration: 0,
        enabled: true
      },
      violence: {
        action: 'timeout',
        duration: 3600,
        enabled: true
      },
      'self-harm': {
        action: 'ban',
        duration: 0,
        enabled: true
      },
      'sexual/minors': {
        action: 'ban',
        duration: 0,
        enabled: true
      },
      'hate/threatening': {
        action: 'timeout',
        duration: 3600,
        enabled: true
      },
      'violence/graphic': {
        action: 'timeout',
        duration: 3600,
        enabled: true
      },
      harassment: {
        action: 'timeout',
        duration: 3600,
        enabled: false
    },
      'harassment/threatening': {
        action: 'timeout',
        duration: 3600,
        enabled: false
      },
      'self-harm/intent': {
        action: 'ban',
        duration: 0,
        enabled: false
      },
      'self-harm/instruction': {
        action: 'ban',
        duration: 0,
        enabled: false
      }
    }
}

module.exports = { ai_base_config }