resource "google_bigquery_dataset" "dataset" {
  dataset_id                  = var.name
  friendly_name               = "Translate analytics"
  description                 = "Store data analytics from the translation service"
  location                    = var.region
}

resource "google_bigquery_table" "default" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = "kpis"

  schema = <<EOF
[
  {
    "name": "sessionid",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "The SessionId from the fulfillment, used to detect different sessions",
    "maxLength": "36"
  },
  {
    "name": "from",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Language where the translation was made from",
    "maxLength": "3"
  },
  {
    "name": "to",
    "type": "STRING",
    "mode": "REQUIRED",
    "description": "Language where the translation was made for",
    "maxLength": "3"
  },
  {
    "name": "when",
    "type": "DATETIME",
    "mode": "REQUIRED",
    "description": "Date and time for the translation to be performed"
  }
]
EOF

}