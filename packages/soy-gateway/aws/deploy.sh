#!/usr/bin/env bash

set -e

DIRNAME="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

aws cloudformation deploy \
  --template-file ${DIRNAME}/health-check.yaml \
  --stack-name soy-gateway-health-check \
  --parameter-overrides SNSNotificationEmail=${SLACK_ALARM_EMAIL}

sam deploy \
  --template-file ${DIRNAME}/gateway-packaged.yaml \
  --stack-name soy-gateway-edge \
  --capabilities CAPABILITY_IAM
