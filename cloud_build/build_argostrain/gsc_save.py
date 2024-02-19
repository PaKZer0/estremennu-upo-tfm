import os
from google.cloud import storage

def save_model(model_filename):
    GCS_CLIENT = storage.Client(project=os.getenv('PROJECT_ID'))
    GCS_BUCKET = os.getenv('GCS_BUCKET')
    GCS_PATH = os.getenv('GCS_PATH')

    blob = storage.blob.Blob.from_string(os.path.join(GCS_PATH, model_filename), client=GCS_CLIENT)
    blob.upload_from_filename(model_filename)