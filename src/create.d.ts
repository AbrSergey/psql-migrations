import { Config, CreateDBConfig } from "./types";
export declare function createDb(dbName: string, dbConfig: CreateDBConfig, config?: Config): Promise<void>;
