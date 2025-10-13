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
  project = var.project_id
  region  = "asia-northeast1"
}

variable "project_id" {
  description = "Google Cloud Project ID"
}

