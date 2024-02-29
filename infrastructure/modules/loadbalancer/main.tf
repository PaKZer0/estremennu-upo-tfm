locals {
  domain = "canteaol.elbastondelavieja.com"
}

resource "google_compute_global_address" "service-lb-ip" {
  name = "${var.cloud_run_service}-lb-ip"
}

resource "google_compute_region_network_endpoint_group" "serverless-neg" {
  name                  = "${var.cloud_run_service}-serverless-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = var.cloud_run_service
  }
}

resource "google_compute_security_policy" "security-policy" {
  name = "${var.cloud_run_service}-security"

  rule {
    action   = "throttle"
    priority = "2147483646"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "prevent api abuse"
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count = "500"
        interval_sec = "60"
      }
    }
  }

  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "default rule"
  }
}

module "service-loadbalancer" {
  source  = "GoogleCloudPlatform/lb-http/google//modules/serverless_negs"
  version = "~> 6.0"
  name    = "${var.cloud_run_service}-service"
  project = var.projectid

  address        = google_compute_global_address.service-lb-ip.address
  create_address = false

  ssl = false
  managed_ssl_certificate_domains = [local.domain]
  https_redirect                  = false

  backends = {
    default = {
      description = null
      groups = [
        {
          group = google_compute_region_network_endpoint_group.serverless-neg.id
        }
      ]
      enable_cdn              = false
      security_policy         = null
      custom_request_headers  = null
      custom_response_headers = null

      iap_config = {
        enable               = false
        oauth2_client_id     = ""
        oauth2_client_secret = ""
      }
      log_config = {
        enable      = false
        sample_rate = null
      }
    }
  }
}
  
output "cloud-run-load-balancer-ip" {
  value = google_compute_global_address.service-lb-ip.address
}