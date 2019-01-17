#!/usr/bin/env bash

export IPFS_PATH=$(mktemp -d)

cleanup() {
  rm -rf ${IPFS_PATH}
}

trap cleanup EXIT

jsipfs init && jsipfs daemon
