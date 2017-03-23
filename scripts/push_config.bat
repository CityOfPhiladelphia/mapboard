echo off

rem     Push the js/config.js file to an S3 bucket. Takes an argument for which
rem     bucket to use (dev or prod). Requires the AWS CLI to be installed.
rem     Usage: push_config [dev|prod]

set env=%1

IF "%env%"=="prod" (
  set bucket=mapboard
) ELSE (
  set bucket=mapboard-%env%
)
echo Pushing to %env%...
aws s3 cp ..\src\config.js s3://%bucket%/src/config.js
