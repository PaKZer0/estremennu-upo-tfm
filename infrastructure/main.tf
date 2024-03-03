module "storage" {
  source = "./modules/storage"
  projectid = var.projectid
  projectnum = var.projectnum
  region = var.region
  zone = var.zone
}

module "artifact" {
  source = "./modules/artifact"
  projectid = var.projectid
  region = var.region
  zone = var.zone
  name = var.artifact_repository_name
}

module "firestore" {
  source = "./modules/firestore"
  projectid = var.projectid
  region = var.region
  zone = var.zone
}

module "bigquery" {
  source = "./modules/bigquery"
  projectid = var.projectid
  region = var.region
  zone = var.zone
}

module "cbtriggers" {
  source = "./modules/cbtriggers"
  region = var.region
  zone = var.zone
  projectnum = var.projectnum
  bucketid1 = var.bucketid1
  bucketid2 = var.bucketid2
  artifact_repository_name = var.artifact_repository_name
}

module "iam" {
  source = "./modules/iam"
  projectid = var.projectid
  projectnum = var.projectnum
}

module "cloudrun" {
  source = "./modules/cloudrun"
  projectid = var.projectid
  projectnum = var.projectnum
  region = var.region
  zone = var.zone
  cloud_run_service = var.cloud_run_service
  container_image = var.container_image
}

module "loadbalancer" {
  source = "./modules/loadbalancer"
  projectid = var.projectid
  region = var.region
  cloud_run_service = var.cloud_run_service
}