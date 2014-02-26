#! /bin/bash

aws --profile mastodonc-eu s3 sync . s3://www.retrofitanalysis.org/ --acl public-read --exclude '.git*' --exclude '*.DS_Store' --exclude '*~' --exclude pushit.sh --delete
