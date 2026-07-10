#!/bin/sh
set -eu

exec supervisord -c /etc/supervisord.conf
