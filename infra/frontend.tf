#######################################
# Secret Manager - Google OAuth認証情報
#######################################
resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "google-client-id"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "google-client-secret"

  replication {
    auto {}
  }
}

# Secret Manager から値を取得
data "google_secret_manager_secret_version" "google_client_id" {
  secret = google_secret_manager_secret.google_client_id.id
}

data "google_secret_manager_secret_version" "google_client_secret" {
  secret = google_secret_manager_secret.google_client_secret.id
}

#######################################
# Identity Platform 設定
#######################################
resource "google_identity_platform_config" "default" {
  project = var.project_id

  depends_on = [google_project_service.identity_platform]
}

# Identity Platform 用 API Key
resource "google_apikeys_key" "identity_platform" {
  name         = "identity-platform-key"
  display_name = "Identity Platform API Key"
  project      = var.project_id

  restrictions {
    api_targets {
      service = "identitytoolkit.googleapis.com"
    }
  }
}

# Google認証プロバイダーを有効化
resource "google_identity_platform_default_supported_idp_config" "google" {
  project       = var.project_id
  enabled       = true
  idp_id        = "google.com"
  client_id     = data.google_secret_manager_secret_version.google_client_id.secret_data
  client_secret = data.google_secret_manager_secret_version.google_client_secret.secret_data

  depends_on = [google_identity_platform_config.default]
}

#######################################
# Service Account - フロントエンド
#######################################
resource "google_service_account" "cloudrun_frontend" {
  account_id   = "cloudrun-frontend"
  display_name = "フロントエンドCloud Runのサービスアカウント"
}

# Secret Manager へのアクセス権限
resource "google_secret_manager_secret_iam_member" "google_client_id" {
  secret_id  = google_secret_manager_secret.google_client_id.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
  depends_on = [google_secret_manager_secret.google_client_id]
}

resource "google_secret_manager_secret_iam_member" "google_client_secret" {
  secret_id  = google_secret_manager_secret.google_client_secret.id
  role       = "roles/secretmanager.secretAccessor"
  member     = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
  depends_on = [google_secret_manager_secret.google_client_secret]
}

# バックエンド呼び出し権限
resource "google_cloud_run_v2_service_iam_member" "backend_invoker" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.cloudrun_frontend.email}"
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
            secret  = google_secret_manager_secret.google_client_id.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.google_client_secret.secret_id
            version = "latest"
          }
        }
      }

      # Identity Platform 用 API Key
      env {
        name  = "FIREBASE_API_KEY"
        value = google_apikeys_key.identity_platform.key_string
      }

      env {
        name  = "API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }

      env {
        name  = "APP_URL"
        value = var.app_url
      }

      ports {
        container_port = 3000
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

  depends_on = [google_identity_platform_default_supported_idp_config.google]
}

# フロントエンドへの未認証アクセスを許可
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
