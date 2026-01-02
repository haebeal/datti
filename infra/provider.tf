terraform {
  backend "gcs" {}

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0.0"
    }
  }
}

provider "google" {
  project               = var.project_id
  region                = "asia-northeast1"
  user_project_override = true
}

variable "project_id" {
  description = "Google Cloud Project ID"
}

variable "app_url" {
  description = "Frontend application URL for OAuth redirect"
}

