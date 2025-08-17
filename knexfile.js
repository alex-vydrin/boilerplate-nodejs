"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./src/config/env");
const knexConfig = {
    development: {
        client: 'postgresql',
        connection: env_1.config.DATABASE_URL || {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'password',
            database: 'print_dev'
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: './src/database/knex-migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/database/seeds',
            extension: 'ts'
        }
    },
    production: {
        client: 'postgresql',
        connection: env_1.config.DATABASE_URL,
        pool: {
            min: 2,
            max: 20
        },
        migrations: {
            directory: './src/database/knex-migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/database/seeds',
            extension: 'ts'
        },
        ssl: { rejectUnauthorized: false }
    },
    test: {
        client: 'postgresql',
        connection: env_1.config.DATABASE_URL || {
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: 'password',
            database: 'print_test'
        },
        pool: {
            min: 1,
            max: 5
        },
        migrations: {
            directory: './src/database/knex-migrations',
            extension: 'ts'
        },
        seeds: {
            directory: './src/database/seeds',
            extension: 'ts'
        }
    }
};
exports.default = knexConfig;
//# sourceMappingURL=knexfile.js.map