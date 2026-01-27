/**
 * ReelForge Logger Utility
 * Provides structured logging for debugging and monitoring
 */

export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

interface LogEntry {
    timestamp: string;
    level: LogLevelType;
    component: string;
    action: string;
    message: string;
    data?: Record<string, unknown>;
    error?: Error;
}

interface LoggerConfig {
    minLevel: LogLevelType;
    enableConsole: boolean;
    enableRemote: boolean;
    remoteEndpoint?: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevelType, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
};

const LOG_LEVEL_STYLES: Record<LogLevelType, string> = {
    [LogLevel.DEBUG]: 'color: #888; font-weight: normal',
    [LogLevel.INFO]: 'color: #007acc; font-weight: normal',
    [LogLevel.WARN]: 'color: #dcdcaa; font-weight: bold',
    [LogLevel.ERROR]: 'color: #f14c4c; font-weight: bold',
};

class Logger {
    private config: LoggerConfig;
    private logs: LogEntry[] = [];
    private maxLogSize = 1000;

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            minLevel: LogLevel.DEBUG,
            enableConsole: true,
            enableRemote: false,
            ...config,
        };
    }

    private shouldLog(level: LogLevelType): boolean {
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
    }

    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private createEntry(
        level: LogLevelType,
        component: string,
        action: string,
        message: string,
        data?: Record<string, unknown>,
        error?: Error
    ): LogEntry {
        return {
            timestamp: this.formatTimestamp(),
            level,
            component,
            action,
            message,
            data,
            error,
        };
    }

    private log(entry: LogEntry): void {
        if (!this.shouldLog(entry.level)) return;

        // Store in memory
        this.logs.push(entry);
        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }

        // Console output
        if (this.config.enableConsole) {
            const prefix = `[${entry.timestamp}] [${entry.level}] [${entry.component}]`;
            const style = LOG_LEVEL_STYLES[entry.level];

            console.groupCollapsed(`%c${prefix} ${entry.action}: ${entry.message}`, style);
            if (entry.data) {
                console.log('Data:', entry.data);
            }
            if (entry.error) {
                console.error('Error:', entry.error);
            }
            console.groupEnd();
        }

        // Remote logging (if enabled)
        if (this.config.enableRemote && this.config.remoteEndpoint) {
            this.sendToRemote(entry);
        }
    }

    private async sendToRemote(entry: LogEntry): Promise<void> {
        try {
            await fetch(this.config.remoteEndpoint!, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
        } catch {
            // Silent fail for remote logging
        }
    }

    debug(component: string, action: string, message: string, data?: Record<string, unknown>): void {
        this.log(this.createEntry(LogLevel.DEBUG, component, action, message, data));
    }

    info(component: string, action: string, message: string, data?: Record<string, unknown>): void {
        this.log(this.createEntry(LogLevel.INFO, component, action, message, data));
    }

    warn(component: string, action: string, message: string, data?: Record<string, unknown>): void {
        this.log(this.createEntry(LogLevel.WARN, component, action, message, data));
    }

    error(component: string, action: string, message: string, error?: Error, data?: Record<string, unknown>): void {
        this.log(this.createEntry(LogLevel.ERROR, component, action, message, data, error));
    }

    // API call logging helpers
    apiRequest(component: string, method: string, url: string, data?: Record<string, unknown>): void {
        this.info(component, 'API_REQUEST', `${method} ${url}`, data);
    }

    apiResponse(component: string, method: string, url: string, status: number, data?: Record<string, unknown>): void {
        const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
        this.log(this.createEntry(level, component, 'API_RESPONSE', `${method} ${url} -> ${status}`, data));
    }

    apiError(component: string, method: string, url: string, error: Error): void {
        this.error(component, 'API_ERROR', `${method} ${url} failed`, error);
    }

    // User action logging
    userAction(component: string, action: string, details?: Record<string, unknown>): void {
        this.info(component, `USER_${action.toUpperCase()}`, `User performed: ${action}`, details);
    }

    // Navigation logging
    navigate(from: string, to: string): void {
        this.info('Router', 'NAVIGATE', `${from} -> ${to}`);
    }

    // Get all logs (for debugging)
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    // Clear logs
    clearLogs(): void {
        this.logs = [];
    }

    // Export logs as JSON
    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Singleton instance
export const logger = new Logger({
    minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
    enableConsole: true,
    enableRemote: false,
});

export default logger;
