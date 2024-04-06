import { winstonLogger } from "@walidhousni/jobseeker-shared";
import { Logger } from "winston";
import { config } from "@auth/config";
import { Sequelize } from "sequelize";

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const sequelize: Sequelize = new Sequelize(process.env.MYSQL_DB!, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        multipleStatements: true
    }
});

export async function databaseConnection(): Promise<void> {
   try {
      await sequelize.authenticate();
      log.info('AuthService MySQL database connection has been established');
   } catch (error) {
    log.error('Auth Service - Unable to connect to the database');
    log.log('error', 'AuthService databaseConnection () methid error: ', error)
   }
}