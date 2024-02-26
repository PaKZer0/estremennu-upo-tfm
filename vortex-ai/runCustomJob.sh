gcloud ai custom-jobs create \
  --project=test-cf-411521 \
  --region=europe-west1 \
  --display-name="ArgosTrain for Spanish to Extremaduran" \
  --config=ext_es_config.yaml \
  --command="./entrypoint_es_ext.sh"