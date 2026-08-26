# Basalt API — Elysia on Bun, fronted by the mvp-vm Traefik (Nomad provider).
# Routes: Host(`basalt.stargate.expw.net`) && PathPrefix(`/api`) on entrypoint web.
#
# Secrets (required before `nomad job run`):
#   nomad var put nomad/jobs/basalt \
#     DATABASE_URL=postgres://basalt:<pg-password>@10.50.0.30:5432/basalt \
#     BETTER_AUTH_URL=https://basalt.stargate.expw.net \
#     BETTER_AUTH_SECRET=<at-least-32-chars> \
#     BETTER_AUTH_TRUSTED_ORIGINS=https://basalt.stargate.expw.net \
#     GOOGLE_CLIENT_ID= GOOGLE_CLIENT_SECRET=
#
# The image is built on the host (see deploy/ansible/deploy.yml), hence
# force_pull = false. The tag must NOT be `latest`: the docker driver pulls
# unconditionally for latest/untagged images, and this image is local-only.
job "basalt-api" {
  datacenters = ["mvp"]
  type        = "service"

  update {
    max_parallel      = 1
    min_healthy_time  = "10s"
    healthy_deadline  = "3m"
    progress_deadline = "5m"
    auto_revert       = true
  }

  group "api" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        to = 3001
      }
    }

    # Apply Drizzle migrations before every (re)start of the API task.
    task "migrate" {
      driver = "docker"

      lifecycle {
        hook    = "prestart"
        sidecar = false
      }

      config {
        image      = "basalt-api:mvp"
        force_pull = false
        # The image entrypoint is `bun` — these become its arguments.
        command = "run"
        args    = ["--cwd", "apps/api", "db:migrate"]
      }

      template {
        destination = "secrets/api.env"
        env         = true
        change_mode = "restart"
        perms       = "0400"
        data        = <<-EOT
          {{ with nomadVar "nomad/jobs/basalt" }}
          DATABASE_URL={{ .DATABASE_URL }}
          {{ end }}
        EOT
      }

      resources {
        cpu    = 100
        memory = 192
      }
    }

    task "api" {
      driver = "docker"

      config {
        image      = "basalt-api:mvp"
        force_pull = false
        ports      = ["http"]
      }

      env {
        NODE_ENV = "production"
        PORT     = "3001"
      }

      template {
        destination = "secrets/api.env"
        env         = true
        change_mode = "restart"
        perms       = "0400"
        data        = <<-EOT
          {{ with nomadVar "nomad/jobs/basalt" }}
          DATABASE_URL={{ .DATABASE_URL }}
          BETTER_AUTH_URL={{ .BETTER_AUTH_URL }}
          BETTER_AUTH_SECRET={{ .BETTER_AUTH_SECRET }}
          BETTER_AUTH_TRUSTED_ORIGINS={{ .BETTER_AUTH_TRUSTED_ORIGINS }}
          GOOGLE_CLIENT_ID={{ .GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET={{ .GOOGLE_CLIENT_SECRET }}
          {{ end }}
        EOT
      }

      resources {
        cpu    = 300
        memory = 384
      }

      service {
        name     = "basalt-api"
        port     = "http"
        # mvp-vm has no Consul agent; use Nomad-native service discovery.
        provider = "nomad"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.basalt-api.rule=Host(`basalt.stargate.expw.net`) && PathPrefix(`/api`)",
          "traefik.http.routers.basalt-api.entrypoints=web",
        ]

        check {
          name     = "health"
          type     = "http"
          path     = "/health"
          interval = "15s"
          timeout  = "3s"
        }
      }
    }
  }
}
