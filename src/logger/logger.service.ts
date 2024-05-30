import { Injectable, ConsoleLogger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createLogger, transports, format } from "winston";

const logLevels = {
    levels: {
        fatal: 0,
        warn: 1,
        error: 2,
        info: 3,
        verbose: 4,
        debug: 5
    },
    colors: {
        fatal: 'white',
        warn: 'yellow',
        error: 'red',
        info: 'green',
        verbose: 'cyan',
        debug: 'magenta'
    }
}

const colorizer = format.colorize()

const myFormat = format.printf(({ level, stack, message }) => {
    return `${level}${stack ? colorizer.colorize('warn', ` [${stack}]`) : ''} ${message}`
})

const logger = createLogger({
    levels: logLevels.levels,
    format: format.combine(
        format(info => {
            if (info.level === 'info') {
                info.level = 'LOG'
                return info;
            }

            info.level = info.level.toUpperCase()
            return info;
        })(),
        format.colorize({
            all: true,
            colors: logLevels.colors
        }),
        myFormat
    ),
    transports: [
        new transports.Console()
    ]
})

@Injectable()
export class Logger extends ConsoleLogger {

    private readonly configService = new ConfigService()
    private readonly RAILWAY_ENV = this.configService.get('RAILWAY_ENVIRONMENT_NAME')

    getMessage(message: unknown) {
        if (message instanceof Error) {
            return String(message)
        } else if (typeof message === 'object') {
            return JSON.stringify(message, null, 4)
        } else {
            return String(message)
        }
    }

    fatal(message: unknown, context?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'fatal',
                stack: context,
                message: m
            })
        } else {
            super.fatal(m, context, ...rest)
        }
    }

    warn(message: unknown, context?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'warn',
                stack: context,
                message: m
            })
        } else {
            super.warn(m, context, ...rest)
        }
    }

    error(message: unknown, stack?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'error',
                stack,
                message: m
            })
        } else {
            super.error(m, stack, ...rest)
        }
    }

    log(message: unknown, context?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'info',
                stack: context,
                message: m
            })
        } else {
            super.log(m, context, ...rest)
        }
    }

    verbose(message: unknown, context?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'verbose',
                stack: context,
                message: m
            })
        } else {
            super.verbose(m, context, ...rest)
        }
    }

    debug(message: unknown, context?: unknown, ...rest: unknown[]): void {
        const m = this.getMessage(message)

        if (this.RAILWAY_ENV) {
            logger.log({
                level: 'debug',
                stack: context,
                message: m
            })
        } else {
            super.debug(m, context, ...rest)
        }
    }
}