#!/bin/bash

# this returns the s3 bucket name for a git branch
get_s3_bucket() {
  local S3_BUCKET="mapboard"
  # if this isn't a tag build and the branch is something other than master...
  # (tag builds always get pushed to master, and non-master branches get pushed
  # to their own bucket)
  if [ -z "$TRAVIS_TAG" ] && [ $TRAVIS_BRANCH != "master" ]; then
    S3_BUCKET+="-$TRAVIS_BRANCH"
  fi
  echo $S3_BUCKET
  return 0
}
