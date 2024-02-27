resource "google_project_service" "a1_service_usage" {
  service = "serviceusage.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "compute_engine" {
  service = "compute.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "artifact_registry" {
  service = "artifactregistry.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "firestore" {
  service = "firestore.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "cloud_build" {
  service = "cloudbuild.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "big_query" {
  service = "bigquery.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "secret_manager" {
  service = "secretmanager.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "cloud_run" {
  service = "run.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "cloud_resource_manager" {
  service = "cloudresourcemanager.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "cloud_functions" {
  service = "cloudfunctions.googleapis.com"
  disable_dependent_services = true
}