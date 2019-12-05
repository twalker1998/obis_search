#!/bin/bash

cd /var/www/html/obis_search
sudo rm -rf *
cd /home/twalker/staging/obis_search
sudo cp -r * /var/www/html/obis_search
rm -rf *
