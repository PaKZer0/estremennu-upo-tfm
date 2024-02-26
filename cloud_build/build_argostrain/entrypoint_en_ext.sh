#!/usr/bin/env bash

bash -c "\
    source /home/argosopentech/env/bin/activate && \
    cd /home/argosopentech/argos-train && \
    echo \"Training from English to Extremaduran version 1.0\"
    python autorun \"en\" \"ext\" \"English\" \"Extremaduran\" \"1.0\""