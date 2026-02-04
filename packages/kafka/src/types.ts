export interface DatabaseEvent<T> {
  before: T | null;
  after: T;
  source: {
    version: string;
    connector: string;
    name: string;
    ts_ms: number;
    snapshot: string;
    db: string;
    sequence: string;
    ts_us: number;
    ts_ns: number;
    schema: string;
    table: string;
    txId: number;
    lsn: number;
    xmin: number | null;
  };
  transaction: null;
  op: "c" | "r" | "u" | "d";
  ts_ms: number;
  ts_us: number;
  ts_ns: number;
}
