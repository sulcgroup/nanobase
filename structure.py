import os
import time
import uuid
import subprocess
import bcrypt
from database import pool
from urllib import request
from datetime import date

insert_published_structure = (
    'REPLACE INTO Structures'
    '(`id`, `userId`, `title`, `type`, `description`, `publishDate`, `citation`, `link`, `licensing`, `structureFiles`, `expProtocolFiles`, `expResultsFiles`, `simProtocolFiles`, `simResultsFiles`, `imageFiles`, `displayImage`, `private`, `uploadDate`)'
	'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
)
insert_structure = (
	'REPLACE INTO Structures'
    '(`id`, `userId`, `title`, `type`, `description`, `structureFiles`, `expProtocolFiles`, `expResultsFiles`, `simProtocolFiles`, `simResultsFiles`, `imageFiles`, `displayImage`, `private`, `uploadDate`)'
	'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
)
insert_max_structure_id = ('INSERT INTO Structures () VALUES ()')
get_max_structure_id = ('SELECT MAX(id) FROM Structures')

def upload_structure(structure, user_id):
    # Get structure id
    connection = pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(insert_max_structure_id)
        cursor.execute(get_max_structure_id)
        id = cursor.fetchone()[0]
        print(id)
    
    struct_path = 'structures/' + str(id)
    if not os.path.exists(struct_path):
        os.mkdir(struct_path)
    else:
        connection.close()
        return "Error: Structure folder " + str(id) + " already exists"
    
    # Upload sturcture into filesystem
    file_types = ['structure', 'expProtocol', 'expResults', 'simProtocol', 'simResults', 'images']
    file_names = [''] * len(file_types)
    for i, file_type in enumerate(file_types):
        file_dir = os.path.join(struct_path, file_type)
        if structure[file_type][0]['file']:
            os.mkdir(file_dir)

        for f in structure[file_type]:
            try:
                file_name = f['file']['_fileNames']
                file_names[i] += file_name + ','
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
        
    # Insert structure into database
    is_published = True if structure['authors'][0]['value'] else False
    
    if is_published:
        structure_data = (
            id,
            int(user_id),
            structure['name'],
            structure['type'],
            structure['description'],
            structure['publishDate'],
            structure['citation'],
            structure['link'],
            structure['licensing'],
            file_names[0][:-1], file_names[1][:-1], file_names[2][:-1], file_names[3][:-1], file_names[4][:-1], file_names[5][:-1],
            structure['displayImage'],
            1 if structure['isPrivate'] == 'true' else 0,
            structure['uploadDate'] if structure['uploadDate'] else date.today().strftime("%Y-%m-%d"),
        )
        with connection.cursor() as cursor:
            cursor.execute(insert_published_structure, (structure_data))
    else:
        structure_data = (
            id,
            int(user_id),
            structure['name'],
            structure['type'],
            structure['description'],
            file_names[0][:-1], file_names[1][:-1], file_names[2][:-1], file_names[3][:-1], file_names[4][:-1], file_names[5][:-1],
            structure['displayImage'],
            1 if structure['isPrivate'] == 'true' else 0,
            structure['uploadDate'] if structure['uploadDate'] else date.today().strftime("%Y-%m-%d"),
        )
        with connection.cursor() as cursor:
            cursor.execute(insert_structure, (structure_data))
        
    connection.close()

    return structure


def is_image_file(file):
    img_formats = ['jpg', 'png', 'tiff']
    return file.split('.')[-1] in img_formats
