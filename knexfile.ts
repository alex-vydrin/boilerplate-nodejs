import { Knex } from "knex";
import { config } from "./src/config/env";

const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        client: "postgresql",
        connection: config.DATABASE_URL || {
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "password",
            database: "print_dev",
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            directory: "./src/database/knex-migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/database/seeds",
            extension: "ts",
        },
    },

    production: {
        client: "postgresql",
        connection: config.DATABASE_URL,
        pool: {
            min: 2,
            max: 20,
        },
        migrations: {
            directory: "./src/database/knex-migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/database/seeds",
            extension: "ts",
        },
    },

    test: {
        client: "postgresql",
        connection: config.DATABASE_URL || {
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "password",
            database: "print_test",
        },
        pool: {
            min: 1,
            max: 5,
        },
        migrations: {
            directory: "./src/database/knex-migrations",
            extension: "ts",
        },
        seeds: {
            directory: "./src/database/seeds",
            extension: "ts",
        },
    },
};

export default knexConfig;
