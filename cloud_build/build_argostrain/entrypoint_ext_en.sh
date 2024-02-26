#!/usr/bin/env bash

bash -c "\
    source /home/argosopentech/env/bin/activate && \
    cd /home/argosopentech/argos-train && \
    echo \"Training from Extremaduran to Spanish version 1.0\"
    python autorun \"ext\" \"es\" \"Extremaduran\" \"Spanish\" \"1.0\""