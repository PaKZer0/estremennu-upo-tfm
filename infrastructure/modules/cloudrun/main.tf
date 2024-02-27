resource "google_cloud_run_service" "default" {
  name     = var.cloud_run_service
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  metadata {
    annotations = {
      #    This sets the service to only allow all traffic
      "run.googleapis.com/ingress" = "internal-and-cloud-load-balancing"
    }
  }
}

data "google_iam_policy" "admin" {
  binding {
    role = "roles/run.admin"
    members = ["serviceAccount:${var.projectnum}@cloudbuild.gserviceaccount.com"]
  }
}

resource "google_cloud_run_service_iam_policy" "policy" {
  location = var.region
  project = var.projectid
  service = google_cloud_run_service.default.name
  policy_data = data.google_iam_policy.admin.policy_data
}