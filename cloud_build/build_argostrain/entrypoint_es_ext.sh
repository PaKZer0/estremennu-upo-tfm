#!/usr/bin/env bash

bash -c "\
    source /home/argosopentech/env/bin/activate && \
    cd /home/argosopentech/argos-train && \
    echo \"Training from Spanish to Extremaduran version 1.0\"
    python autorun \"es\" \"ext\" \"Spanish\" \"Extremaduran\" \"1.0\""