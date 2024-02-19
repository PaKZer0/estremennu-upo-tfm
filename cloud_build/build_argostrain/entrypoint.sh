bash -c "\
    source /home/argosopentech/env/bin/activate && \
    which python && \
    cd /home/argosopentech/argos-train && \
    pwd && \
    export $(cat /home/argosopentech/.env | xargs) && \

    echo \"Project ID is $PROJECT_ID\" && \
    echo 'Building Spanish to Extremaduran' && \
    python autorun es ext Spanish Extremaduran 1.0"