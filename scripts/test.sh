#!/bin/bash
set -e

export APP_NAME="Test App"

$(npm bin)/jest "$@"
