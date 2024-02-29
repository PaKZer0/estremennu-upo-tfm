# Cloud Build SA IAM roles
resource "google_project_iam_binding" "cloud_run_admin" {
  project = var.projectid
  role    = "roles/run.admin"

  members = [
    "serviceAccount:${var.projectnum}@cloudbuild.gserviceaccount.com",
  ]
}

resource "google_project_iam_binding" "artifact_registry_writer" {
  project = var.projectid
  role    = "roles/artifactregistry.writer"

  members = [
    "serviceAccount:${var.projectnum}@cloudbuild.gserviceaccount.com",
  ]
}

resource "google_project_iam_binding" "cloud_functions_admin" {
  project = var.projectid
  role    = "roles/cloudfunctions.admin"

  members = [
    "serviceAccount:${var.projectnum}@cloudbuild.gserviceaccount.com",
  ]
}

resource "google_project_iam_binding" "secret_accesor" {
  project = var.projectid
  role    = "roles/secretmanager.secretAccessor"

  members = [
    "serviceAccount:${var.projectnum}@cloudbuild.gserviceaccount.com",
  ]
}

# Cloud Functions SA IAM roles
resource "google_project_iam_binding" "big_query_editor" {
  project = var.projectid
  role    = "roles/bigquery.dataEditor"

  members = [
    "serviceAccount:${var.projectid}@appspot.gserviceaccount.com",
  ]
}

resource "google_project_iam_binding" "datastore_owner" {
  project = var.projectid
  role    = "roles/datastore.owner"

  members = [
    "serviceAccount:${var.projectid}@appspot.gserviceaccount.com",
  ]
}