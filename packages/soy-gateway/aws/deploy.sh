#!/usr/bin/env bash

set -e

DIRNAME="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --template-file ${DIRNAME}/health-check.yaml \
  --stack-name soy-gateway-health-check \
  --parameter-overrides SNSNotificationEmail=${SLACK_ALARM_EMAIL}


aws cloudformation deploy \
  --no-fail-on-empty-changeset \
  --template-file ${DIRNAME}/gateway-packaged.yaml \
  --stack-name soy-gateway-edge \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Route53HostedZoneId=${ROUTE53_HOSTED_ZONE_ID} \
    AcmCertificateArn=${ACM_CERTIFICATE_ARN}
