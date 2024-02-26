bash -c "\
    source /home/argosopentech/env/bin/activate && \
    cd /home/argosopentech/argos-train && \
    echo \"Training from $from_name to $to_name version $version\"
    python autorun \"$from\" \"$to\" \"$from_name\" \"$to_name\" \"$version\""