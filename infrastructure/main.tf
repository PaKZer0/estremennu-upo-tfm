#module "vpc" {
#  source = "./modules/vpc"
#  projectid = var.projectid
#  region = var.region
#  zone = var.zone
#}

module "storage" {
  source = "./modules/storage"
  projectid = var.projectid
  region = var.region
  zone = var.zone
}