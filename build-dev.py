# Unmodified version https://github.com/dmoutray/angular-flask/blob/master/build-dev.py

import os
import subprocess
from time import sleep

WATCH_INTERVAL = 5.0
CURRENT_DIRECTORY = os.getcwd()
directories = os.listdir(CURRENT_DIRECTORY)
# NON_ANGULAR_DIRS = ['static', 'templates', '__pycache__']
ANGULAR_DIR = 'ng'

for directory in directories:
    if "." not in directory and directory == ANGULAR_DIR:
        ANGULAR_PROJECT_PATH = os.path.join(CURRENT_DIRECTORY, directory)
        DIST_PATH = os.path.join(ANGULAR_PROJECT_PATH, 'dist', directory)

FLASK_STATIC_PATH = os.path.join(CURRENT_DIRECTORY, 'static')
FLASK_TEMPLATES_PATH = os.path.join(CURRENT_DIRECTORY, 'templates')

subprocess.call(('cd ' + ANGULAR_PROJECT_PATH + ' && ng build --watch --base-href /static/ &'), shell=True)

dir_exists = True

print('Watching for changes...')

while dir_exists:
    try:
        try:
            files = os.listdir(DIST_PATH)
        except FileNotFoundError:
            files = []
        if files:
            static_files = ""
            html_files = ""
            for file in files:
                if '.js' in file or '.js.map' in file or '.ico' in file:
                    static_files += (file + ' ')
                if '.html' in file:
                    html_files += (file + ' ')
            if len(static_files) > 0:
                subprocess.call(('cd ' + DIST_PATH + ' &&' + ' mv ' + static_files + FLASK_STATIC_PATH), shell=True)
            if len(html_files) > 0:
                subprocess.call(('cd ' + DIST_PATH + ' &&' + ' mv ' + html_files + FLASK_TEMPLATES_PATH), shell=True)
    except Exception as e:
        print('BUILD DEV FAILURE')
        dir_exists = False
        print(e.with_traceback)
    sleep(WATCH_INTERVAL)
