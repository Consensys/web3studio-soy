#!/usr/bin/env bash

DIRNAME="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

sam package --template-file ${DIRNAME}/gateway.yaml \
  --output-template-file ${DIRNAME}/gateway-packaged.yaml \
  --s3-bucket web3studio-lambdas
