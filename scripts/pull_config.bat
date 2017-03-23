echo off

rem     Pull the config.js file from an S3 bucket. Takes an argument for which
rem     bucket to use (dev or prod). Requires the AWS CLI to be installed.
rem     Usage: push_config [dev|prod]

set env=%1

IF "%env%"=="prod" (
  set bucket=mapboard
) ELSE (
  set bucket=mapboard-%env%
)
echo Pulling from %env%...
aws s3 cp s3://%bucket%/src/config.js ..\src\config.js
