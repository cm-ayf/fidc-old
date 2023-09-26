export interface WranglerToml {
  d1_databases: D1Database[];
}

interface D1Database {
  database_name: string;
  binding: string;
  database_id: string;
  migrations_dir: string;
}
