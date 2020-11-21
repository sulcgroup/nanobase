
import os
import time
import uuid
import subprocess
import bcrypt
from database import pool
from urllib import request

def upload_structure(structure):
    sid = 'TEST'
    struct_path = 'structures/' + sid
    if not os.path.exists(struct_path):
        os.mkdir(struct_path)
    else:
        return 'Error creating structure folder'
    
    print(structure)
    file_types = ['structure', 'expProtocol', 'expResults', 'simProtocol', 'simResults', 'images']
    for file_type in file_types:
        file_dir = os.path.join(struct_path, file_type)
        os.mkdir(file_dir)

        for f in structure[file_type]:
            try:
                file_name = f['file']['_fileNames']
                file_path = os.path.join(file_dir, file_name)
            except TypeError:
                continue
            if is_image_file(file_name):
                file = open(file_path, "wb")
                data_uri = f['contents']
                data = request.urlopen(data_uri).read()
                file.write(data)
            else:
                file = open(file_path, "w")
                file.write(f['contents'])
            file.close()
    
    return structure


def is_image_file(file):
    img_formats = ['jpg', 'png', 'tiff']
    return file.split('.')[-1] in img_formats
