#!/bin/sh
set -eu

CORESCOPE_CONFIG_DIR=${CORESCOPE_CONFIG_DIR:-/app/corescope}
CORESCOPE_DB_PATH=${CORESCOPE_DB_PATH:-/app/corescope/data/meshcore.db}
CORESCOPE_PUBLIC_DIR=${CORESCOPE_PUBLIC_DIR:-/app/corescope/public}
CORESCOPE_ENABLE_INGESTOR=${CORESCOPE_ENABLE_INGESTOR:-auto}

mkdir -p "$CORESCOPE_CONFIG_DIR" "$(dirname "$CORESCOPE_DB_PATH")" "$CORESCOPE_PUBLIC_DIR"

/usr/local/bin/render-corescope-config.mjs "$CORESCOPE_CONFIG_DIR/config.json"

sqlite3 "$CORESCOPE_DB_PATH" <<'SQL'
CREATE TABLE IF NOT EXISTS nodes (
  public_key TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  lat REAL,
  lon REAL,
  last_seen TEXT,
  first_seen TEXT,
  advert_count INTEGER DEFAULT 0,
  battery_mv INTEGER,
  temperature_c REAL,
  foreign_advert INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS observers (
  id TEXT PRIMARY KEY,
  name TEXT,
  iata TEXT,
  last_seen TEXT,
  first_seen TEXT,
  packet_count INTEGER DEFAULT 0,
  model TEXT,
  firmware TEXT,
  client_version TEXT,
  radio TEXT,
  battery_mv INTEGER,
  uptime_secs INTEGER,
  noise_floor REAL,
  inactive INTEGER DEFAULT 0,
  last_packet_at TEXT DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS inactive_nodes (
  public_key TEXT PRIMARY KEY,
  name TEXT,
  role TEXT,
  lat REAL,
  lon REAL,
  last_seen TEXT,
  first_seen TEXT,
  advert_count INTEGER DEFAULT 0,
  battery_mv INTEGER,
  temperature_c REAL,
  foreign_advert INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS transmissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_hex TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  first_seen TEXT NOT NULL,
  route_type INTEGER,
  payload_type INTEGER,
  payload_version INTEGER,
  decoded_json TEXT,
  from_pubkey TEXT,
  channel_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transmission_id INTEGER NOT NULL REFERENCES transmissions(id),
  observer_idx INTEGER,
  direction TEXT,
  snr REAL,
  rssi REAL,
  score INTEGER,
  path_json TEXT,
  timestamp INTEGER NOT NULL,
  raw_hex TEXT
);
CREATE TABLE IF NOT EXISTS observer_metrics (
  observer_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  noise_floor REAL,
  tx_air_secs INTEGER,
  rx_air_secs INTEGER,
  recv_errors INTEGER,
  battery_mv INTEGER,
  packets_sent INTEGER,
  packets_recv INTEGER,
  PRIMARY KEY (observer_id, timestamp)
);
CREATE TABLE IF NOT EXISTS dropped_packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT,
  raw_hex TEXT,
  reason TEXT NOT NULL,
  observer_id TEXT,
  observer_name TEXT,
  node_pubkey TEXT,
  node_name TEXT,
  dropped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);
CREATE INDEX IF NOT EXISTS idx_nodes_last_seen ON nodes(last_seen);
CREATE INDEX IF NOT EXISTS idx_observers_last_seen ON observers(last_seen);
CREATE INDEX IF NOT EXISTS idx_inactive_nodes_last_seen ON inactive_nodes(last_seen);
CREATE INDEX IF NOT EXISTS idx_transmissions_hash ON transmissions(hash);
CREATE INDEX IF NOT EXISTS idx_transmissions_first_seen ON transmissions(first_seen);
CREATE INDEX IF NOT EXISTS idx_transmissions_payload_type ON transmissions(payload_type);
CREATE INDEX IF NOT EXISTS idx_transmissions_from_pubkey ON transmissions(from_pubkey);
CREATE INDEX IF NOT EXISTS idx_tx_channel_hash ON transmissions(channel_hash) WHERE payload_type = 5;
CREATE INDEX IF NOT EXISTS idx_observations_transmission_id ON observations(transmission_id);
CREATE INDEX IF NOT EXISTS idx_observations_observer_idx ON observations(observer_idx);
CREATE INDEX IF NOT EXISTS idx_observations_timestamp ON observations(timestamp);
CREATE UNIQUE INDEX IF NOT EXISTS idx_observations_dedup ON observations(transmission_id, observer_idx, COALESCE(path_json, ''));
CREATE INDEX IF NOT EXISTS idx_observer_metrics_timestamp ON observer_metrics(timestamp);
DROP VIEW IF EXISTS packets_v;
CREATE VIEW packets_v AS
  SELECT o.id, COALESCE(o.raw_hex, t.raw_hex) AS raw_hex,
         datetime(o.timestamp, 'unixepoch') AS timestamp,
         obs.id AS observer_id, obs.name AS observer_name,
         o.direction, o.snr, o.rssi, o.score, t.hash, t.route_type,
         t.payload_type, t.payload_version, o.path_json, t.decoded_json,
         t.created_at
    FROM observations o
    JOIN transmissions t ON t.id = o.transmission_id
    LEFT JOIN observers obs ON obs.rowid = o.observer_idx AND (obs.inactive IS NULL OR obs.inactive = 0);
SQL

/usr/local/bin/bootstrap-corescope-nodes.mjs
/usr/local/bin/prune-corescope-retention.mjs

chown -R nextjs:nodejs "$CORESCOPE_CONFIG_DIR"

CORESCOPE_MQTT_READY=$(node -e "const fs=require('fs'); const cfg=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); const sources=Array.isArray(cfg.mqttSources) ? cfg.mqttSources : []; const ready=sources.some((source)=>source && source.broker && (!source.username || source.password)); console.log(ready ? 'true' : 'false')" "$CORESCOPE_CONFIG_DIR/config.json")

if [ "$CORESCOPE_ENABLE_INGESTOR" = "true" ] || { [ "$CORESCOPE_ENABLE_INGESTOR" = "auto" ] && [ "$CORESCOPE_MQTT_READY" = "true" ]; }; then
  if [ "$CORESCOPE_MQTT_READY" = "true" ]; then
    sed '/\[program:corescope-ingestor\]/,$ s/autostart=false/autostart=true/' /etc/supervisord.conf > /tmp/supervisord.conf
    exec supervisord -c /tmp/supervisord.conf
  fi
  echo "CoreScope ingestor requested but no usable MQTT credentials are configured; leaving it disabled."
fi

exec supervisord -c /etc/supervisord.conf
