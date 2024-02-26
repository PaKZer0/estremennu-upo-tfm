resource "google_artifact_registry_repository" "my-repo" {
  location      = var.region
  repository_id = var.name
  description   = "Repository to store ArgosTrain and LibreTranslate images"
  format        = "DOCKER"
}