variable "projectid" {
  default = "canteaol-estremennu-tf"
}

variable "region" {
  type = string
  default = "europe-west1"
}

variable "zone" {
  type = string
  default = "europe-west1-b"
}

variable "bucketid1" {
  type = string
  default = "estremennu-data-bucket"
}

variable "bucketid2" {
  type = string
  default = "argos-packages-estremennu"
}