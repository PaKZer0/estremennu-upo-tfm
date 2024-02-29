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
}

variable "bucketid2" {
  type = string
}

variable "connection_name" {
  default = "estremennu-connection"
}

variable "repo_name" {
  default = "estremennu-repo"
}

variable "repo_url" {
  default = "https://github.com/PaKZer0/estremennu-upo-tfm.git"
}

# Replace with github's cloud build id found here https://github.com/settings/installations/
variable "app_installation_id" {
  default = "39251048"
}