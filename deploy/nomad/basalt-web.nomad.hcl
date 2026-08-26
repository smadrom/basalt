# Basalt web — static SPA (nginx), fronted by the mvp-vm Traefik.
# Route: Host(`basalt.stargate.expw.net`) on entrypoint web; /api/* is claimed
# by the basalt-api router (longer rule wins in Traefik).
#
# The image is built on the host with VITE_API_URL pointing at the public
# origin (see deploy/ansible/deploy.yml), hence force_pull = false.
job "basalt-web" {
  datacenters = ["mvp"]
  type        = "service"

  update {
    max_parallel      = 1
    min_healthy_time  = "10s"
    healthy_deadline  = "3m"
    progress_deadline = "5m"
    auto_revert       = true
  }

  group "web" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        to = 80
      }
    }

    task "web" {
      driver = "docker"

      config {
        image      = "basalt-web:latest"
        force_pull = false
        ports      = ["http"]
      }

      resources {
        cpu    = 100
        memory = 128
      }

      service {
        name = "basalt-web"
        port = "http"

        tags = [
          "traefik.enable=true",
          "traefik.http.routers.basalt-web.rule=Host(`basalt.stargate.expw.net`)",
          "traefik.http.routers.basalt-web.entrypoints=web",
        ]

        check {
          name     = "http"
          type     = "http"
          path     = "/"
          interval = "15s"
          timeout  = "3s"
        }
      }
    }
  }
}
