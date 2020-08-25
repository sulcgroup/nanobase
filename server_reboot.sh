#!/bin/bash 
/etc/init.d/apache2 stop
service nginx restart
/usr/bin/nvidia-smi -c EXCLUSIVE_PROCESS
su capstonegroup
./RestartPython.sh
