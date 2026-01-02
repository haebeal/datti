#######################################
# Secret Manager - フロントエンド環境変数
#######################################
resource "google_secret_manager_secret" "frontend_google_client_id" {
  secret_id = "frontend-google-client-id"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "frontend_google_client_secret" {
  secret_id = "frontend-google-client-secret"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "frontend_firebase_api_key" {
  secret_id = "frontend-firebase-api-key"

  replication {
    auto {}
  }
}

#######################################
# Service Account - フロントエンド
#######################################
resource "google_service_account" "cloudrun_frontend" {
  account_id   = "cloudrun-frontend"
  display_name = "フロントエンドCloud Runのサービスアカウント"
}

# Secret Manager へのアクセス権限
resource "google_secret_manager_secret_iam_member" "frontend_google_client_id" {
  secret_id  = google_secret_manager_secret.frontend_google_client_id.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
  depends_on = [google_secret_manager_secret.frontend_google_client_id]
}

resource "google_secret_manager_secret_iam_member" "frontend_google_client_secret" {
  secret_id  = google_secret_manager_secret.frontend_google_client_secret.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
  depends_on = [google_secret_manager_secret.frontend_google_client_secret]
}

resource "google_secret_manager_secret_iam_member" "frontend_firebase_api_key" {
  secret_id  = google_secret_manager_secret.frontend_firebase_api_key.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
  depends_on = [google_secret_manager_secret.frontend_firebase_api_key]
}

#######################################
# Cloud Run - フロントエンド
#######################################
resource "google_cloud_run_v2_service" "frontend" {
  name     = "frontend"
  location = "asia-northeast1"
  ingress  = "INGRESS_TRAFFIC_ALL"

  deletion_protection = false

  template {
    service_account = google_service_account.cloudrun_frontend.email

    containers {
      image = "${google_artifact_registry_repository.app.registry_uri}/frontend:latest"

      # 環境変数 - Secret Manager から注入
      env {
        name = "GOOGLE_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.frontend_google_client_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.frontend_google_client_secret.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "FIREBASE_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.frontend_firebase_api_key.secret_id
            version = "latest"
          }
        }
      }

      # 環境変数 - 直接設定
      env {
        name  = "APP_URL"
        value = google_cloud_run_v2_service.frontend.uri
      }

      env {
        name  = "API_URL"
        value = google_cloud_run_v2_service.backend.uri
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
