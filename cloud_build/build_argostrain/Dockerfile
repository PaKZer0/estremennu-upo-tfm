from argosopentech/argostrain

WORKDIR /home/argosopentech
USER argosopentech

# Prepare execution environment
RUN bash -c "\
    source argos-train-init && \
    rm /home/argosopentech/argos-train/data-index.json && \
    curl -o data-index.json https://storage.googleapis.com/estremennu-argos-packages/data_index_skeleton.json && \
    sed -i "s/--vocab_size=50000/--vocab_size=14640/g" /home/argosopentech/argos-train/argostrain/train.py"

# Add run script
ADD autorun /home/argosopentech/argos-train/autorun
ADD auto-train /home/argosopentech/env/bin/argos-train

# Now the training can be called without user intervention like this
# > python autorun es ext Spanish Extremaduran 1.0

WORKDIR /home/argosopentech/argos-train

ENTRYPOINT python autorun es ext Spanish Extremaduran 1.0