import os
import time
import uuid
import subprocess
import bcrypt
from flask import jsonify
import database
from urllib import request
from datetime import date
from elasticsearch import Elasticsearch
import json
import requests

es = Elasticsearch([{'host': 'localhost', 'port': 9200}])


# PRINT SPECIFIC ID
# print(es.get(index='structures', id=3))

# PRINT ALL
# print(es.search(index='structures', body={'query': {'match_all' : {}}}))

get_structure_query = ('SELECT Structures.*, Users.firstName, Users.lastName, Users.institution FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.id = %s')
insert_structure_query = (
    'REPLACE INTO Structures'
    '(`id`, `userId`, `title`, `type`, `description`, `publishDate`, `citation`, `link`, `licensing`, `structureFiles`, `expProtocolFiles`, `expResultsFiles`, `simProtocolFiles`, `simResultsFiles`, `imageFiles`, `displayImage`, `structureDescriptions`, `expProtocolDescriptions`, `expResultsDescriptions`, `simProtocolDescriptions`, `simResultsDescriptions`, `imageDescriptions`, `private`, `uploadDate`)'
	'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
)
insert_max_structure_id = ('INSERT INTO Structures () VALUES ()')
get_max_structure_id = ('SELECT MAX(id) FROM Structures')
recent_structures_query = (
    'SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id ORDER BY Structures.uploadDate DESC LIMIT 10'
)
get_last_id = ('SELECT LAST_INSERT_ID()')
get_user_name = ('SELECT firstName, lastName FROM Users WHERE id = %s')
get_by_id = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.id IN %(ids)s LIMIT 10')

get_app_id = ('SELECT id FROM Applications WHERE application = %s')
insert_app = ('INSERT INTO Applications (application) VALUES (%s)')
insert_app_join = ('INSERT INTO ApplicationsJoin (structureId, applicationId) VALUES (%s, %s)')

get_mod_id = ('SELECT id FROM Modifications WHERE modification = %s')
insert_mod = ('INSERT INTO Modifications (modification) VALUES (%s)')
insert_mod_join = ('INSERT INTO ModificationsJoin (structureId, modificationId) VALUES (%s, %s)')

get_keyword_id = ('SELECT id FROM Keywords WHERE keyword = %s')
insert_keyword = ('INSERT INTO Keywords (keyword) VALUES (%s)')
insert_keyword_join = ('INSERT INTO KeywordsJoin (structureId, keywordId) VALUES (%s, %s)')

get_author_id = ('SELECT id FROM Authors WHERE author = %s')
insert_author = ('INSERT INTO Authors (author) VALUES (%s)')
insert_author_join = ('INSERT INTO AuthorsJoin (structureId, authorId) VALUES (%s, %s)')

get_applications_query = ('SELECT application FROM Applications WHERE id IN (SELECT applicationId FROM ApplicationsJoin WHERE structureId = %s)')
get_modifications_query = ('SELECT modification FROM Modifications WHERE id IN (SELECT modificationId FROM ModificationsJoin WHERE structureId = %s)')
get_keywords_query = ('SELECT keyword FROM Keywords WHERE id IN (SELECT keywordId FROM KeywordsJoin WHERE structureId = %s)')
get_authors_query = ('SELECT author FROM Authors WHERE id IN (SELECT authorId FROM AuthorsJoin WHERE structureId = %s)')

def get_structure(id):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(get_structure_query, (id))
        s = list(cursor.fetchone())
    
    if not s:
        connection.close()
        return 'Not found'
    
    # Get data from join tables
    with connection.cursor() as cursor:
        cursor.execute(get_applications_query, (id))
        applications = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_modifications_query, (id))
        modifications = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_keywords_query, (id))
        keywords = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_authors_query, (id))
        authors = [x[0] for x in cursor.fetchall()]

    connection.close()

    # Get file contents
    files = []
    structure_files = s[10].split('|')
    path = os.path.join('structures', id, 'structure/')
    for file_name in structure_files:
        file = open(path + file_name, 'r')
        files.append({
            'name': file_name,
            'contents': file.read()
        })

    # structure = {
    #     'id': id,
    #     'title': s[2],
    #     'type': s[3],
    #     'size': s[5],
    #     'private': s[23],
    #     'uploadDate': s[24],
    #     'user': { 'id': s[1], 'firstName': s[25], 'lastName': s[26], 'institution': s[26] },
    #     'files': { 'structureFiles': s[10], 'expProtocolFiles': s[11], 'expResultsFiles': s[12], 'simProtocolFiles': s[13], 'simResultsFiles': s[14], 'imageFiles': s[15], 'displayImage': s[16] },
    #     'descriptions': { 'description': s[4], 'structureDescriptions': s[17], 'expProtocolDescriptions': s[18], 'expResultsDescriptions': s[19], 'simProtocolDescriptions': s[20], 'simResultsDescriptions': s[21], 'imageDescriptions': s[22] },
    #     'publication': { 'publishDate': s[6], 'citation': s[7], 'link': s[8], 'licensing': s[9], 'authors': authors },
    #     'tags': { 'applications': applications, 'modifications': modifications, 'keywords': keywords },
    #     'files_contents': files
    # }

    structure = {
        'id': id,
        'description': s[4],
        'title': s[2],
        'type': s[3],
        'size': s[5],
        'private': s[23],
        'uploadDate': s[24],
        'user': { 'id': s[1], 'firstName': s[25], 'lastName': s[26], 'institution': s[26] },
        'files': { 'displayImage': s[16] },
        'publication': { 'publishDate': s[6], 'citation': s[7], 'link': s[8], 'licensing': s[9], 'authors': authors },
        'tags': { 'applications': applications, 'modifications': modifications, 'keywords': keywords },
        'files_contents': files
    }

    expProtocolFiles = s[11].split('|')
    expResultsFiles = s[12].split('|')
    simProtocolFiles = s[13].split('|')
    simResultsFiles = s[14].split('|')
    imageFiles = s[15].split('|')

    structure['files']['structure'] = [{
        'name': structure_files[i],
        'description': s[17].split('|')[i]}
        for i in range(len(structure_files))
    ]
    structure['files']['expProtocol'] = [{
        'name': expProtocolFiles[i],
        'description': s[18].split('|')[i]}
        for i in range(len(expProtocolFiles))
    ]
    structure['files']['expResults'] = [{
        'name': expResultsFiles[i],
        'description': s[19].split('|')[i]}
        for i in range(len(expResultsFiles))
    ]
    structure['files']['simProtocol'] = [{
        'name': simProtocolFiles[i],
        'description': s[20].split('|')[i]}
        for i in range(len(simProtocolFiles))
    ]
    structure['files']['simResults'] = [{
        'name': simResultsFiles[i],
        'description': s[21].split('|')[i]}
        for i in range(len(simResultsFiles))
    ]
    structure['files']['images'] = [{
        'name': imageFiles[i],
        'description': s[22].split('|')[i]}
        for i in range(len(imageFiles))
    ]
    
    return structure

def get_recent_structures():
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(recent_structures_query)
        results = cursor.fetchall()
    connection.close()

    keys = ['title', 'uploadDate', 'description', 'displayImage', 'id', 'firstName', 'lastName']
    structures = [dict(zip(keys, structure)) for structure in results]

    return jsonify(structures)

def upload_structure(structure, user_id):
    print('Uploading: ', structure)
    # Convert dicts to arrays
    applications, modifications, keywords, authors = [], [], [], []
    structure['applications'] = [d['value'] for d in structure['applications'] if d['value'] != '']
    structure['modifications'] = [d['value'] for d in structure['modifications'] if d['value'] != '']
    structure['keywords'] = [d['value'] for d in structure['keywords'] if d['value'] != '']
    structure['authors'] = [d['value'] for d in structure['authors'] if d['value'] != '']

    # Get structure id and user name
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(insert_max_structure_id)
        cursor.execute(get_max_structure_id)
        id = cursor.fetchone()[0]
        cursor.execute(get_user_name, (user_id))
        first_name, last_name = cursor.fetchall()[0]
        

    file_names, file_descriptions = upload_files(id, structure)
    insert_structure(id, structure, user_id, file_names, file_descriptions, connection)
    connection.close()

    index_structure(id, structure, first_name, last_name)
    print(es.search(index='structures', body={'query': {'match_all' : {}}}))
    return structure

# Write all files into filesystem
def upload_files(id, structure):
    struct_path = 'structures/' + str(id)
    os.mkdir(struct_path)
    
    file_types = ['structure', 'expProtocol', 'expResults', 'simProtocol', 'simResults', 'images']
    file_names = [''] * len(file_types)
    file_descriptions = [''] * len(file_types)
    for i, file_type in enumerate(file_types):
        file_dir = os.path.join(struct_path, file_type)
        if structure[file_type][0]['file']:
            os.mkdir(file_dir)

        for f in structure[file_type]:
            try:
                file_name = f['file']['_fileNames']
                file_path = os.path.join(file_dir, file_name)
                file_names[i] += file_name + '|'
                file_descriptions[i] += f['description'] + '|'
            except TypeError:
                continue
            # Determine if it's not a text format
            if is_data_url(file_name):
                file = open(file_path, 'wb')
                data_uri = f['contents']
                print('FILE WRITING: ', file_name, data_uri[:15])
                data = request.urlopen(data_uri).read()
                file.write(data)
            else:
                file = open(file_path, 'w')
                file.write(f['contents'])
            file.close()
    
    return file_names, file_descriptions

# Add structure to MySQL database
def insert_structure(id, structure, user_id, file_names, file_descriptions, connection):    
    structure_data = (
        id,
        int(user_id),
        structure['name'],
        structure['type'],
        structure['description'],
        structure['publishDate'] if structure['publishDate'] else '0000-0-0',
        structure['citation'],
        structure['link'] ,
        structure['licensing'],
        file_names[0][:-1], file_names[1][:-1], file_names[2][:-1], file_names[3][:-1], file_names[4][:-1], file_names[5][:-1],
        structure['displayImage'],
        file_descriptions[0][:-1], file_descriptions[1][:-1], file_descriptions[2][:-1], file_descriptions[3][:-1], file_descriptions[4][:-1], file_descriptions[5][:-1],
        1 if structure['isPrivate'] == 'true' else 0,
        structure['uploadDate'] if structure['uploadDate'] else date.today().strftime('%Y-%m-%d'),
    )
    
    with connection.cursor() as cursor:
        cursor.execute(insert_structure_query, (structure_data))
        # Using this repetitive structure because table names cannot be parameterized :/
        for application in structure['applications']:
            cursor.execute(get_app_id, (application))
            tag_id = cursor.fetchone()
            if not tag_id:
                cursor.execute(insert_app, (application))
                cursor.execute(get_last_id)
                tag_id = cursor.fetchone()
            cursor.execute(insert_app_join, (id, tag_id))

        for modification in structure['modifications']:
            cursor.execute(get_mod_id, (modification))
            tag_id = cursor.fetchone()
            if not tag_id:
                cursor.execute(insert_mod, (modification))
                cursor.execute(get_last_id)
                tag_id = cursor.fetchone()
            cursor.execute(insert_mod_join, (id, tag_id))

        for keyword in structure['keywords']:
            cursor.execute(get_keyword_id, (keyword))
            tag_id = cursor.fetchone()
            if not tag_id:
                cursor.execute(insert_keyword, (keyword))
                cursor.execute(get_last_id)
                tag_id = cursor.fetchone()
            cursor.execute(insert_keyword_join, (id, tag_id))
        
        for authors in structure['authors']:
            cursor.execute(get_author_id, (authors))
            tag_id = cursor.fetchone()
            if not tag_id:
                cursor.execute(insert_author, (authors))
                cursor.execute(get_last_id)
                tag_id = cursor.fetchone()
            cursor.execute(insert_author_join, (id, tag_id))

# Store structure in ES
def index_structure(id, structure, first_name, last_name):
    es.index(index = 'structures', id = id,
    body = {
        'title': structure['name'],
        'user_name': first_name + ' ' + last_name,
        'applications': structure['applications'],
        'modifications': structure['modifications'],
        'keywords': structure['keywords'],
        'authors': structure['authors'],
    })

def search(input, category):
    print('categoryyyy', category)
    query = {
        'query': {
            'match': {
                category: {
                    'query': input,
                    'fuzziness': 'AUTO'
                }
            }
        }
    }

    hits = es.search(index='structures', body=query)['hits']['hits']
    ids = [hit['_id'] for hit in hits]

    if not ids:
        return {}

    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(get_by_id, ({'ids':tuple(ids)}))
        structures = cursor.fetchall()
    connection.close()

    response = []

    for structure in structures:
        response.append({
            'title': structure[0],
            'uploadDate': structure[1],
            'description': structure[2],
            'displayImage': structure[3],
            'id': structure[4],
            'firstName': structure[5],
            'lastName': structure[6]
        })
    
    print(response)
    
    return jsonify(response)

def is_data_url(file):
    formats = ['jpg', 'png', 'tiff', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    return file.split('.')[-1] in formats
