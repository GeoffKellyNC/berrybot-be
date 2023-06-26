const ai_base_config = {
    active: true,
    thresholds: {
      sexual: 0.94,
      hate: 0.95,
      violence: 0.97,
      'self-harm': 0.92,
      'sexual/minors': 0.90,
      'hate/threatening': 0.95,
      'violence/graphic': 0.95,
      harassment: 0.95,
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
        enabled: true
    },
      'harassment/threatening': {
        action: 'timeout',
        duration: 3600,
        enabled: true
      },
      'self-harm/intent': {
        action: 'ban',
        duration: 0,
        enabled: true
      },
      'self-harm/instruction': {
        action: 'ban',
        duration: 0,
        enabled: true
      }
    }
}

module.exports = { ai_base_config }