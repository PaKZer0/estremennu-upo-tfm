#!/usr/bin/env bash

bash -c "\
    source /home/argosopentech/env/bin/activate && \
    cd /home/argosopentech/argos-train && \
    echo \"Training from Extremaduran to English version 1.0\"
    python autorun \"ext\" \"en\" \"Extremaduran\" \"English\" \"1.0\""