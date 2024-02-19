from argosopentech/argostrain

WORKDIR /home/argosopentech
USER argosopentech

# Prepare execution environment
RUN bash -c "\
    source argos-train-init && \
    rm /home/argosopentech/argos-train/data-index.json && \
    curl -o data-index.json https://storage.googleapis.com/estremennu-argos-packages/data_index_skeleton.json"

# Load environment variables
ADD .env /home/argosopentech/.env

# Add google storage capabilities
ADD custom_train.py /home/argosopentech/argos-train/argostrain/custom_train.py
ADD gsc_save.py /home/argosopentech/argos-train/argostrain/gsc_save.py

# Add run script
ADD autorun /home/argosopentech/argos-train/autorun
ADD auto-train /home/argosopentech/env/bin/argos-train

RUN bash -c "\
    source env/bin/activate && \
    /home/argosopentech/env/bin/pip install google-cloud-storage && \
    rm /home/argosopentech/argos-train/argostrain/train.py && \
    mv /home/argosopentech/argos-train/argostrain/custom_train.py /home/argosopentech/argos-train/argostrain/train.py && \
    sudo chmod +x /home/argosopentech/argos-train/argostrain/train.py"

# Now the training can be called without user intervention like this
# > python autorun es ext Spanish Extremaduran 1.0

WORKDIR /home/argosopentech/argos-train
ADD entrypoint.sh entrypoint.sh

ENTRYPOINT ./entrypoint.sh

#ENTRYPOINT \
#    cd /home/argosopentech/argos-train && \
#    export $(cat /home/argosopentech/.env | xargs) && \
#    echo 'Building Spanish to Extremaduran' && \
#    /home/argosopentech/env/bin/python autorun es ext Spanish Extremaduran 1.0