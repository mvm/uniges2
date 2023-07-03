#!/bin/sh

mkdir -p /var/www/html/uniges2
cp -rf * /var/www/html/uniges2/

chown -R www-data /var/www/html/uniges2/*

