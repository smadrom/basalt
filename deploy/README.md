# Deploying basalt

Basalt deploys to **mvp-vm** (CargoTech single-node Nomad, datacenter `mvp`)
as three Nomad jobs: `basalt-pg` (PostgreSQL 17), `basalt-api` (Elysia on Bun)
and `basalt-web` (nginx serving the Vite build). The mvp-vm Traefik routes
`https://basalt.stargate.expw.net` — `/api/*` to the API, everything else to
the SPA.

```text
Internet → edge 95.216.186.254 (Traefik, TLS) → WG → server7-pve DNAT
        → mvp-vm Traefik (Nomad provider) → basalt-web / basalt-api
```

## Layout

| Path | Purpose |
| --- | --- |
| `docker/Dockerfile.api` | API image (Bun; also runs migrations) |
| `docker/Dockerfile.web` | Web image (Vite build → nginx) |
| `docker/nginx/spa.conf` | nginx config used on Nomad (Traefik routes /api) |
| `docker/nginx/spa-api-proxy.conf` | nginx config with /api proxy (compose only) |
| `docker/docker-compose.prod.yml` | Production-like local stack |
| `deploy/nomad/*.nomad.hcl` | Nomad job specs (datacenter `mvp`) |
| `deploy/ansible/deploy.yml` | Idempotent deploy playbook for mvp-vm |

## Local production-like run

```bash
cp .env.example .env   # set a real BETTER_AUTH_SECRET
docker compose -f docker/docker-compose.prod.yml up --build
# web: http://localhost:8080  (API is same-origin under /api/*)
```

## Deploy to mvp-vm

SSH goes through the server7-pve jump host (operator alias: `ssh mvp-vm`).
The Nomad API is not exposed; use `sudo env NOMAD_ADDR=http://10.50.0.30:4646`
on the host, or `ssh -N -L 4646:10.50.0.30:4646 mvp-vm` for the UI.

1. **Create the Nomad Variables** (once, secrets never live in job specs):

   ```bash
   ssh mvp-vm
   sudo env NOMAD_ADDR=http://10.50.0.30:4646 nomad var put nomad/jobs/basalt-pg \
     POSTGRES_USER=basalt POSTGRES_PASSWORD='<strong-password>' POSTGRES_DB=basalt

   sudo env NOMAD_ADDR=http://10.50.0.30:4646 nomad var put nomad/jobs/basalt \
     DATABASE_URL='postgres://basalt:<strong-password>@10.50.0.30:5432/basalt' \
     BETTER_AUTH_URL='https://basalt.stargate.expw.net' \
     BETTER_AUTH_SECRET='<at-least-32-chars>' \
     BETTER_AUTH_TRUSTED_ORIGINS='https://basalt.stargate.expw.net' \
     GOOGLE_CLIENT_ID='' GOOGLE_CLIENT_SECRET=''
   ```

2. **Run the playbook** from the operator machine (uses the core inventory):

   ```bash
   ansible-playbook -i ../core/ansible/inventory.yml deploy/ansible/deploy.yml
   ```

   It syncs the repo to `/opt/mvp/src/basalt`, builds `basalt-api:latest` and
   `basalt-web:latest` on the host, provisions the PostgreSQL data directory
   (`/opt/mvp/data/basalt-pg`, bind-mounted into the container), copies the
   job specs to `/opt/mvp/jobs/` and runs them.

3. **Public ingress**: the edge Traefik (`95.216.186.254`) terminates TLS for
   `basalt.stargate.expw.net` and forwards plain HTTP through the existing
   WG → DNAT chain to mvp-vm:80 (same pattern as Opustune). The file router on
   the edge lives in `/etc/traefik/dynamic.yml` — back it up before editing.

## Operations

```bash
# job status / logs
sudo env NOMAD_ADDR=http://10.50.0.30:4646 nomad job status basalt-api
sudo env NOMAD_ADDR=http://10.50.0.30:4646 nomad alloc logs <alloc> api

# redeploy after pushing new code: re-run the playbook
# database access: psql postgres://basalt:<pw>@10.50.0.30:5432/basalt (from the VM)
```
