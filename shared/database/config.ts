export interface DatabaseConfig {
  type: 'sqlite' | 'mysql' | 'postgresql';
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  filePath?: string; // For SQLite
}

export const defaultDatabaseConfig: DatabaseConfig = {
  type: 'sqlite',
  database: 'domainhub',
  filePath: './data/domainhub.db'
};

// Browser-compatible configuration
export const getDatabaseConfig = (): DatabaseConfig => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  if (isBrowser) {
    // Use default SQLite configuration for browser (simulated)
    return {
      type: 'sqlite',
      database: 'domainhub',
      filePath: './data/domainhub.db'
    };
  }

  // Server environment configuration (if process is available)
  try {
    const process = globalThis.process || (globalThis as any).process;
    if (!process || !process.env) {
      return defaultDatabaseConfig;
    }

    const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseConfig['type'];

    switch (dbType) {
      case 'postgresql':
        return {
          type: 'postgresql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'domainhub',
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          ssl: process.env.DB_SSL === 'true'
        };

      case 'mysql':
        return {
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          database: process.env.DB_NAME || 'domainhub',
          username: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          ssl: process.env.DB_SSL === 'true'
        };

      default: // sqlite
        return {
          type: 'sqlite',
          database: process.env.DB_NAME || 'domainhub',
          filePath: process.env.DB_FILE_PATH || './data/domainhub.db'
        };
    }
  } catch (error) {
    // Fallback to default config if there's any error accessing process
    return defaultDatabaseConfig;
  }
};

export const connectionString = (config: DatabaseConfig): string => {
  switch (config.type) {
    case 'postgresql':
      return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    
    case 'mysql':
      return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    
    case 'sqlite':
      return `sqlite:${config.filePath}`;
    
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
};
