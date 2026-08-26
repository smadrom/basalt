# Basalt PostgreSQL — single-node database for the basalt app on mvp-vm.
#
# Secrets (required before `nomad job run`):
#   nomad var put nomad/jobs/basalt-pg \
#     POSTGRES_USER=basalt POSTGRES_PASSWORD=<strong> POSTGRES_DB=basalt
#
# Data lives in a bind mount at /opt/mvp/data/basalt-pg (provisioned by
# deploy/ansible/deploy.yml) — the same pattern as the other mvp-vm stateful
# jobs; the mvp-vm Nomad client registers no host volumes.
job "basalt-pg" {
  datacenters = ["mvp"]
  type        = "service"

  group "pg" {
    count = 1

    network {
      mode = "bridge"
      # Bound to the private host IP only (10.50.0.30) — never published on a
      # public interface. The API reaches it at 10.50.0.30:5432.
      port "db" {
        static       = 5432
        host_network = "private"
      }
    }

    task "postgres" {
      driver = "docker"

      config {
        image   = "postgres:17-alpine"
        ports   = ["db"]
        volumes = ["/opt/mvp/data/basalt-pg:/var/lib/postgresql/data"]
      }

      template {
        destination = "secrets/pg.env"
        env         = true
        change_mode = "restart"
        perms       = "0400"
        data        = <<-EOT
          {{ with nomadVar "nomad/jobs/basalt-pg" }}
          POSTGRES_USER={{ .POSTGRES_USER }}
          POSTGRES_PASSWORD={{ .POSTGRES_PASSWORD }}
          POSTGRES_DB={{ .POSTGRES_DB }}
          {{ end }}
        EOT
      }

      resources {
        cpu    = 200
        memory = 256
      }

      service {
        name     = "basalt-pg"
        port     = "db"
        # mvp-vm has no Consul agent; use Nomad-native service discovery.
        provider = "nomad"

        check {
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
