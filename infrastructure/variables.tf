variable "projectid" {
  type = string
  default = "canteaol-estremennu-tf"
}

variable "projectnum" {
  type = string
  default = "530352023622"
}

variable "region" {
  type = string
  default = "europe-west1"
}

variable "zone" {
  type = string
  default = "europe-west1-b"
}

variable "cloud_run_service" {
  type = string
  default = "libre-translate"
}

variable "container_image" {
  type = string
  default = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "bucketid1" {
  type = string
  default = "estremennu-data-bucket"
}

variable "bucketid2" {
  type = string
  default = "argos-packages-estremennu"
}