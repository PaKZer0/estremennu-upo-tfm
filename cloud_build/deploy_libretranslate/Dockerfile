from libretranslate/libretranslate

#RUN rm /home/libretranslate/.local/cache/argos-translate/index.json
#ADD index.json /home/argosopentech/argos-train/autorun

WORKDIR /app
EXPOSE 5000
ENTRYPOINT [ "./venv/bin/libretranslate", "--host", "0.0.0.0" ]