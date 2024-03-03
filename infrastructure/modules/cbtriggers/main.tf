# Connect github repository
resource "google_secret_manager_secret" "github-token-secret" {
  secret_id = "github-token-secret"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "github-token-secret-version" {
  secret = google_secret_manager_secret.github-token-secret.id
  secret_data = file("modules/cbtriggers/github-token.txt")
}

data "google_iam_policy" "p4sa-secretAccessor" {
  binding {
    role = "roles/secretmanager.secretAccessor"
    members = ["serviceAccount:service-${var.projectnum}@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
  }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  secret_id = google_secret_manager_secret.github-token-secret.secret_id
  policy_data = data.google_iam_policy.p4sa-secretAccessor.policy_data
}

resource "google_cloudbuildv2_connection" "my-connection" {
  location = var.region
  name = var.connection_name

  github_config {
    app_installation_id = var.app_installation_id
    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github-token-secret-version.id
    }
  }
}

resource "google_cloudbuildv2_repository" "my-repository" {
  location = var.region
  name = var.repo_name
  parent_connection = google_cloudbuildv2_connection.my-connection.name
  remote_uri = var.repo_url
}

# Triggers
resource "google_cloudbuild_trigger" "clone-and-translate" {
  name = "01-clone-and-translate"
  location = var.region
  description = "Gathers bilingual texts and translates them to english"

  substitutions  = {
    "_BUCKET_NAME" = var.bucketid1
  }

  git_file_source {
    path       = "cloud_build/clone_repo/clone_repo.yaml"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    revision   = "refs/heads/main"
    repo_type  = "GITHUB"
  }

  source_to_build {
    ref        = "refs/heads/main"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    repo_type  = "GITHUB"
  }
}

resource "google_cloudbuild_trigger" "package-creator" {
  name = "02-package-creator"
  location = var.region
  description = "Gathers trilingual texts and packages them into argosdata packages"

  substitutions  = {
    "_DATA_BUCKET" = var.bucketid1
    "_PACKAGE_BUCKET" = var.bucketid2
  }

  git_file_source {
    path       = "cloud_build/bundle_packages/bundle_packages.yaml"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    revision   = "refs/heads/main"
    repo_type  = "GITHUB"
  }

  source_to_build {
    ref        = "refs/heads/main"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    repo_type  = "GITHUB"
  }
}

resource "google_cloudbuild_trigger" "build-trainer-image" {
  name = "03-build-trainer-image"
  location = var.region
  description = "Builds the image used for Vertex AI model training using the previously generated packages"

  substitutions  = {
    "_ARTIFACT_REPOSITORY" = var.artifact_repository_name
  }

  git_file_source {
    path       = "cloud_build/build_argostrain/build_image.yaml"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    revision   = "refs/heads/main"
    repo_type  = "GITHUB"
  }

  source_to_build {
    ref        = "refs/heads/main"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    repo_type  = "GITHUB"
  }
}

resource "google_cloudbuild_trigger" "deploy-libre-cloudrun" {
  name = "04-deploy-libre-cloudrun"
  location = var.region
  description = "Deploys a LibreTranslate instance into Cloud Run"

  substitutions  = {
    "_ARTIFACT_REPOSITORY" = var.artifact_repository_name
    "_PACKAGE_BUCKET"      = var.bucketid2
  }

  git_file_source {
    path       = "cloud_build/deploy_libretranslate/deploy_libretranslate.yaml"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    revision   = "refs/heads/main"
    repo_type  = "GITHUB"
  }

  source_to_build {
    ref        = "refs/heads/main"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    repo_type  = "GITHUB"
  }
}

resource "google_cloudbuild_trigger" "deploy-fulfillment" {
  name = "05-deploy-fulfillment"
  location = var.region
  description = "Deploys the Cloud Function Fulfillment for Dialogflow"

  git_file_source {
    path       = "cloud_functions/fulfillment/cloudbuild.yaml"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    revision   = "refs/heads/main"
    repo_type  = "GITHUB"
  }

  source_to_build {
    ref        = "refs/heads/main"
    repository = "${google_cloudbuildv2_connection.my-connection.id}/repositories/${var.repo_name}"
    repo_type  = "GITHUB"
  }
}