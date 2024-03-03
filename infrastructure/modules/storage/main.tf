resource "google_storage_bucket" "bucket1" {
  name          = var.bucketid1
  location      = var.region
  uniform_bucket_level_access = true
  public_access_prevention = "enforced"
  force_destroy = false
  storage_class = "STANDARD"
}

resource "google_storage_bucket" "bucket2" {
  name          = var.bucketid2
  location      = var.region
  uniform_bucket_level_access = true
  force_destroy = true
  storage_class = "STANDARD"
}

resource "google_storage_bucket_iam_binding" "public_binding" {
  bucket = var.bucketid2
  role   = "roles/storage.objectViewer"
  
  members = [
    "allUsers",
  ]
}