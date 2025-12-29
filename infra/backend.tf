#######################################
# Identity Platform API
#######################################
resource "google_project_service" "identity_platform" {
  service            = "identitytoolkit.googleapis.com"
  disable_on_destroy = false
}

#######################################
# Artifact Registry
#######################################
resource "google_artifact_registry_repository" "app" {
  location      = "asia-northeast1"
  repository_id = "app"
  format        = "DOCKER"
}


#######################################
# Secret Manager
#######################################
resource "google_secret_manager_secret" "dsn" {
  secret_id = "dsn"

  replication {
    auto {}
  }
}

#######################################
# Service Account
#######################################
resource "google_service_account" "cloudrun-backend" {
  account_id   = "cloudrun-backend"
  display_name = "バックエンドCloud Runのサービスアカウント"
}

resource "google_secret_manager_secret_iam_member" "cloudrun-backend" {
  secret_id  = google_secret_manager_secret.dsn.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun-backend.email}"
  depends_on = [google_secret_manager_secret.dsn]
}

resource "google_project_iam_member" "cloudrun-backend-trace-agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.cloudrun-backend.email}"
}

resource "google_project_iam_member" "cloudrun-backend-firebase-auth" {
  project = var.project_id
  role    = "roles/firebaseauth.viewer"
  member  = "serviceAccount:${google_service_account.cloudrun-backend.email}"
}

#######################################
# Cloud Run
#######################################
resource "google_cloud_run_v2_service" "backend" {
  name     = "backend"
  location = "asia-northeast1"
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    service_account = google_service_account.cloudrun-backend.email
    containers {
      image = "${google_artifact_registry_repository.app.registry_uri}/backend:latest"

      env {
        name  = "APP_ENV"
        value = "production"
      }
      env {
        name = "DSN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.dsn.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }
  }
}
