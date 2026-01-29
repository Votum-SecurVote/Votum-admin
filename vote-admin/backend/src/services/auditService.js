class AuditService {
  constructor() {
    this.logs = [];
  }

  log(action, details, userId = 'admin') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details: typeof details === 'object' ? details : { message: details },
      ip: '127.0.0.1' // In production, get from request
    };

    this.logs.push(logEntry);
    
    // Log to console for development
    console.log(`[AUDIT] ${action}:`, {
      timestamp: logEntry.timestamp,
      user: logEntry.userId,
      details: logEntry.details
    });

    return logEntry;
  }

  getLogs(filter = {}) {
    let filteredLogs = this.logs;
    
    if (filter.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filter.action);
    }
    
    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filter.startDate)
      );
    }
    
    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filter.endDate)
      );
    }

    return filteredLogs;
  }
}

export default new AuditService();