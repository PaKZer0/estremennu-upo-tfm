variable "projectid" {
  type = string
}

variable "projectnum" {
  type = string
}

variable "region" {
  type = string
}

variable "zone" {
  type = string
}

variable "bucketid1" {
  type = string
  default = "estremennu-data-bucket"
}

variable "bucketid2" {
  type = string
  default = "argos-packages-estremennu"
}