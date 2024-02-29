resource "google_firestore_database" "database" {
  project     = var.projectid
  name        = var.name
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}