#!/bin/bash

# this returns the s3 bucket name for a git branch
get_s3_bucket() {
  local S3_BUCKET="mapboard"
  if [ $TRAVIS_BRANCH != "master" ]; then
    S3_BUCKET+="-$TRAVIS_BRANCH"
  fi
  echo $S3_BUCKET
  return 0
}
