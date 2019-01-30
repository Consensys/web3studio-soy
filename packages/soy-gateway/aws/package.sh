#!/usr/bin/env bash

DIRNAME="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
S3_LAMBDA_BUCKET="${S3_LAMBDA_BUCKET:-web3studio-lambdas}"

sam package --template-file ${DIRNAME}/gateway.yaml \
  --output-template-file ${DIRNAME}/gateway-packaged.yaml \
  --s3-bucket ${S3_LAMBDA_BUCKET}
