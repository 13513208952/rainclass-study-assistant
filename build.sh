#!/bin/sh
set -eu
output=${1:-rainclass-study-assistant.zip}
case "$output" in /*) ;; *) output="$PWD/$output" ;; esac
if [ -e "$output" ]; then
  printf 'Output already exists: %s\n' "$output" >&2
  exit 1
fi
cd "$(dirname "$0")"
zip -q "$output" manifest.json playback.js ds-*.js options.html options.css options.js \
  vendor/katex.min.js vendor/markdown-it.min.js vendor/KATEX-LICENSE vendor/MARKDOWN-IT-LICENSE LICENSE
