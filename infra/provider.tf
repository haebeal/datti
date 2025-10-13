terraform {
  backend "gcs" {
    bucket = var.bucket_name
  }

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

variable "bucket_name" {
  description = "Google Cloud Storage Bucket"
}

