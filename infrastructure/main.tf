module "storage" {
  source = "./modules/storage"
  projectid = var.projectid
  region = var.region
  zone = var.zone
}

module "artifact" {
  source = "./modules/artifact"
  projectid = var.projectid
  region = var.region
  zone = var.zone
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
}

module "iam" {
  source = "./modules/iam"
  projectid = var.projectid
}

/*
module "cloudrun" {
  source = "./modules/cloudrun"
  region = var.region
  zone = var.zone
  projectid = var.projectid
  container_image = var.container_image
}
*/