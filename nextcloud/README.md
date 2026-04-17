# TC_01 + TC_05 - Nextcloud Resurrection and Monitoring Stack

This folder gives you a deployable Nextcloud stack with:

- Deployment: Nextcloud + MariaDB + Redis + cron jobs.
- Customization: scripted extension/app installation.
- Automation: user/group provisioning for the next 25 batches.
- Monitoring: Prometheus + Alertmanager + Grafana + node-exporter + cAdvisor + HTTP health probe.

## 1) Prerequisites

- Docker Engine + Docker Compose plugin
- A server with ports available: `8081`, `3000`, `9090`, `9093`, `9100`, `9115`

## 2) Bootstrap

```bash
cd nextcloud
cp .env.example .env
# edit .env with secure credentials and trusted domains
docker compose up -d
```

Open:

- Nextcloud: `http://<server-ip>:8081`
- Grafana: `http://<server-ip>:3000`
- Prometheus: `http://<server-ip>:9090`
- Alertmanager: `http://<server-ip>:9093`

## 3) Install Extensions

```bash
cd nextcloud
chmod +x scripts/*.sh
./scripts/install_extensions.sh
```

Apps attempted:

- `calendar`, `contacts`, `tasks`, `notes`, `deck`, `bookmarks`, `groupfolders`, `richdocuments`, `twofactor_totp`

## 4) Automate Account Creation

### Option A: CSV-driven provisioning

1. Copy template and fill users:

```bash
cp users/batches.csv.example users/batches.csv
```

2. Provision from CSV:

```bash
./scripts/provision_users_from_csv.sh users/batches.csv
```

If any row has an empty password, the script generates one and writes it to `users/batches.generated-passwords.csv`.

### Option B: Auto-create groups for next 25 batches

Creates `batch-01` to `batch-25` groups.

```bash
./scripts/provision_next_25_batches.sh
```

To also create N users per batch automatically:

```bash
USERS_PER_BATCH=30 PREFIX=batch ./scripts/provision_next_25_batches.sh
```

Generated credentials go to `users/generated-batch-credentials.csv`.

## 5) Monitoring

Prometheus scrapes:

- Host metrics from `node-exporter`
- Container metrics from `cAdvisor`
- Nextcloud HTTP health via `blackbox-exporter` (`/status.php`)
- Monitoring services (`prometheus`, `alertmanager`) for stack visibility

Grafana is auto-provisioned with:

- Prometheus datasource
- `Nextcloud Overview` dashboard from repository

### Alerts

Alert rules are in `prometheus/alerts.yml` and include:

- `NextcloudDown`
- `NextcloudProbeSlow`
- `NodeExporterDown`
- `CadvisorDown`
- `HighCPUUsage`
- `HighMemoryUsage`
- `DiskSpaceLow`

### Discord and Telegram notifications (bonus)

Set these in `.env`:

- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Notification flow:

1. Prometheus evaluates rules.
2. Alerts are sent to Alertmanager.
3. Alertmanager sends to Discord webhook and Telegram bot.

You can leave one of the channels blank if you only need the other.

### Manual Grafana setup (optional)

If you want extra dashboards in addition to the bundled one:

1. Login with `.env` admin credentials.
2. Import common dashboards:
   - Node Exporter Full (ID `1860`)
   - cAdvisor metrics dashboard (search by name in Grafana marketplace)
3. Add alert panels as needed.

## 6) Suggested Hardening

- Put this behind reverse proxy + TLS (Caddy/Nginx).
- Use real DNS in `NEXTCLOUD_TRUSTED_DOMAINS`.
- Rotate credentials every batch cycle.
- Configure SMTP and backups.
