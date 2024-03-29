import os
import shutil
import time
import uuid
import subprocess
import bcrypt
from flask import jsonify
from pymysql import NULL
import database
from extract_stats import stats
from utilities import get_session_id
from urllib import request
from datetime import date
from elasticsearch import Elasticsearch
import json
import sys
import requests

es = Elasticsearch([{'host': 'localhost', 'port': 9200}])

# PRINT SPECIFIC ID
# print(es.get(index='structures', id=3))

# PRINT ALL
# print(es.search(index='structures', body={'query': {'match_all' : {}}}))

get_structure_query = ('SELECT Structures.*, Users.firstName, Users.lastName, Users.institution FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.id = %s')
get_private_structure_query = ('SELECT Structures.*, Users.firstName, Users.lastName, Users.institution FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.private_hash = %s')
get_structures_by_user = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName, Structures.private, Structures.private_hash FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Users.id=%s')
insert_structure_query = (
    'REPLACE INTO Structures'
    '(`id`, `userId`, `title`, `type`, `description`, `publishDate`, `citation`, `link`, `licensing`, `structureFiles`, `expProtocolFiles`, `expResultsFiles`, `simProtocolFiles`, `simResultsFiles`, `imageFiles`, `displayImage`, `structureDescriptions`, `expProtocolDescriptions`, `expResultsDescriptions`, `simProtocolDescriptions`, `simResultsDescriptions`, `statsData`, `imageDescriptions`, `private`, `uploadDate`, `oxdnaFiles`, `private_hash`)'
	'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)'
)
modify_structure_query = (
    'UPDATE Structures SET userId = %s, title = %s, type = %s, description = %s, publishDate = %s, citation = %s, link = %s, licensing = %s, structureFiles = %s, expProtocolFiles = %s, expResultsFiles = %s, simProtocolFiles = %s, simResultsFiles = %s, imageFiles = %s, displayImage = %s, structureDescriptions = %s, expProtocolDescriptions = %s, expResultsDescriptions = %s, simProtocolDescriptions = %s, simResultsDescriptions = %s, imageDescriptions = %s, private = %s, uploadDate = %s, oxdnaFiles = %s WHERE id = %s'
)
get_oxdna_files_query = ('SELECT oxdnaFiles FROM Structures WHERE id = %s')
get_private_id = ('SELECT id FROM Structures WHERE private_hash = %s')
insert_max_structure_id = ('INSERT INTO Structures () VALUES ()')
get_max_structure_id = ('SELECT MAX(id) FROM Structures')
recent_structures_query = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.private=0 ORDER BY Structures.uploadDate DESC LIMIT %s')
random_structures_query = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.private=0 ORDER BY RAND() LIMIT %s')
next_structures_query = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.private=0 AND Structures.id < %s ORDER BY Structures.id DESC LIMIT %s')
delete_structure_query = ('DELETE Structures FROM Structures WHERE Structures.id = %s')

toggle_private_query = ('UPDATE Structures SET private = %s WHERE id = %s')
update_hash_query = ('UPDATE Structures SET private_hash = %s WHERE id = %s')
update_date_query = ('UPDATE Structures SET uploadDate = %s WHERE id = %s')

recent_titles_query = ('SELECT DISTINCT title FROM Structures ORDER BY uploadDate DESC LIMIT %s')
recent_username_query = ('SELECT DISTINCT Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id ORDER BY Structures.uploadDate DESC LIMIT %s')
recent_applications_query = ('SELECT DISTINCT Applications.application FROM Applications INNER JOIN ApplicationsJoin ON Applications.id = ApplicationsJoin.applicationId INNER JOIN Structures ON Structures.id = ApplicationsJoin.structureId ORDER BY Structures.uploadDate DESC LIMIT %s')
recent_modifications_query = ('SELECT DISTINCT Modifications.modification FROM Modifications INNER JOIN ModificationsJoin ON Modifications.id = ModificationsJoin.modificationId INNER JOIN Structures ON Structures.id = ModificationsJoin.structureId ORDER BY Structures.uploadDate DESC LIMIT %s')
recent_keywords_query = ('SELECT DISTINCT Keywords.keyword FROM Keywords INNER JOIN KeywordsJoin ON Keywords.id = KeywordsJoin.keywordId INNER JOIN Structures ON Structures.id = KeywordsJoin.structureId ORDER BY Structures.uploadDate DESC LIMIT %s')
recent_authors_query = ('SELECT DISTINCT Authors.author FROM Authors INNER JOIN AuthorsJoin ON Authors.id = AuthorsJoin.authorId INNER JOIN Structures ON Structures.id = AuthorsJoin.structureId ORDER BY Structures.uploadDate DESC LIMIT %s')

get_applications_query = ('SELECT application FROM Applications WHERE id IN (SELECT applicationId FROM ApplicationsJoin WHERE structureId = %s)')
get_modifications_query = ('SELECT modification FROM Modifications WHERE id IN (SELECT modificationId FROM ModificationsJoin WHERE structureId = %s)')
get_keywords_query = ('SELECT keyword FROM Keywords WHERE id IN (SELECT keywordId FROM KeywordsJoin WHERE structureId = %s)')
get_authors_query = ('SELECT author FROM Authors WHERE id IN (SELECT authorId FROM AuthorsJoin WHERE structureId = %s)')
get_last_author = ('SELECT author FROM (SELECT author FROM Authors WHERE id IN (SELECT authorId FROM AuthorsJoin WHERE structureId = %s)) as T, (SELECT @s:= 0) AS s ORDER BY @s:=@s+1 DESC LIMIT 1')

get_last_id = ('SELECT LAST_INSERT_ID()')
get_user_name = ('SELECT firstName, lastName FROM Users WHERE id = %s')
get_by_id = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.id IN %(ids)s LIMIT 10')
get_by_id_single = ('SELECT Structures.title, Structures.uploadDate, Structures.description, Structures.displayImage, Structures.id, Users.firstName, Users.lastName FROM Structures INNER JOIN Users ON Structures.userId=Users.id WHERE Structures.id = %s')

get_app_id = ('SELECT id FROM Applications WHERE application = %s')
insert_app = ('INSERT INTO Applications (application) VALUES (%s)')
insert_app_join = ('INSERT INTO ApplicationsJoin (structureId, applicationId) VALUES (%s, %s)')
delete_app = ('DELETE Applications, ApplicationsJoin FROM Applications INNER JOIN ApplicationsJoin on Applications.id = ApplicationsJoin.applicationId WHERE Applications.application = %s')
delete_app_by_id = ('DELETE ApplicationsJoin FROM Applications INNER JOIN ApplicationsJoin on Applications.id = ApplicationsJoin.applicationId WHERE ApplicationsJoin.structureId = %s')

get_mod_id = ('SELECT id FROM Modifications WHERE modification = %s')
insert_mod = ('INSERT INTO Modifications (modification) VALUES (%s)')
insert_mod_join = ('INSERT INTO ModificationsJoin (structureId, modificationId) VALUES (%s, %s)')
delete_mod = ('DELETE Modifications, ModificationsJoin FROM Modifications INNER JOIN ModificationsJoin on Modifications.id = ModificationsJoin.modificationId WHERE Modifications.modification = %s')
delete_mod_by_id = ('DELETE ModificationsJoin FROM Modifications INNER JOIN ModificationsJoin on Modifications.id = ModificationsJoin.modificationId WHERE ModificationsJoin.structureId = %s')

get_keyword_id = ('SELECT id FROM Keywords WHERE keyword = %s')
insert_keyword = ('INSERT INTO Keywords (keyword) VALUES (%s)')
insert_keyword_join = ('INSERT INTO KeywordsJoin (structureId, keywordId) VALUES (%s, %s)')
delete_keyword = ('DELETE Keywords, KeywordsJoin FROM Keywords INNER JOIN KeywordsJoin on Keywords.id = KeywordsJoin.keywordId WHERE Keywords.keyword = %s')
delete_keyword_by_id = ('DELETE KeywordsJoin FROM Keywords INNER JOIN KeywordsJoin on Keywords.id = KeywordsJoin.keywordId WHERE KeywordsJoin.structureId = %s')

get_author_id = ('SELECT id FROM Authors WHERE author = %s')
insert_author = ('INSERT INTO Authors (author) VALUES (%s)')
insert_author_join = ('INSERT INTO AuthorsJoin (structureId, authorId) VALUES (%s, %s)')
delete_author = ('DELETE Authors, AuthorsJoin FROM Authors INNER JOIN AuthorsJoin on Authors.id = AuthorsJoin.authorId WHERE Authors.author = %s')
delete_author_by_id = ('DELETE AuthorsJoin FROM Authors INNER JOIN AuthorsJoin on Authors.id = AuthorsJoin.authorId WHERE AuthorsJoin.structureId = %s')

def delete_structure(struct_id):
    # es.delete(index = 'structures', id = struct_id)
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(delete_structure_query, (struct_id))
        cursor.execute(delete_app_by_id, (struct_id))
        cursor.execute(delete_mod_by_id, (struct_id))
        cursor.execute(delete_keyword_by_id, (struct_id))
        cursor.execute(delete_author_by_id, (struct_id))
    connection.close()
    path = os.path.join('structures', struct_id)
    shutil.rmtree(path)

    return 'OK'

def get_oxdna_files(id):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(get_oxdna_files_query, (id))
        oxdna_files = cursor.fetchone()[0][:-1]
    connection.close()
    return oxdna_files

def get_structure(id):
    connection = database.pool.get_connection()

    with connection.cursor() as cursor:
        cursor.execute(get_private_structure_query, (id))
        s = cursor.fetchone()
        if s:
            s = list(s)
            id = str(s[0])
        else:
            cursor.execute(get_structure_query, (id))
            s = list(cursor.fetchone())
            #print(s, file=sys.stderr)
            if s[24] > 0:
                connection.close()
                return 'Structure is private'
    
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
    # print(s[25], file=sys.stderr)
    oxdna_files = s[26][:-1].split('|') if s[26] else []
    files = []
    if oxdna_files and (len(oxdna_files) > 1 or oxdna_files[0] != ''):
        path = os.path.join('structures', id, 'structure/')
        for file_name in oxdna_files:
            file = open(path + file_name, 'r')
            files.append({
                'name': file_name,
                'contents': file.read()
            })
    else:
        oxdna_files = []

    structure = {
        'id': id,
        'description': s[4],
        'title': s[2],
        'type': s[3],
        'size': s[5],
        'private': s[24],
        'uploadDate': s[25],
        'user': { 'id': s[1], 'firstName': s[28], 'lastName': s[29], 'institution': s[30] },
        'files': { 'displayImage': s[16], 'oxdnaFiles': oxdna_files },
        'publication': { 'publishDate': s[6], 'citation': s[7], 'link': s[8], 'licensing': s[9], 'authors': authors },
        'tags': { 'applications': applications, 'modifications': modifications, 'keywords': keywords },
        'files_contents': files
    }

    structure_files = s[10].split('|')
    expProtocolFiles = s[11].split('|')
    expResultsFiles = s[12].split('|')
    simProtocolFiles = s[13].split('|')
    simResultsFiles = s[14].split('|')
    imageFiles = s[15].split('|')

    structure['files']['structure'] = [{
        'name': structure_files[i],
        'description': s[17].split('|')[i]}
        for i in range(len(structure_files))
    ] if structure_files[0] != '' else []
    structure['files']['expProtocol'] = [{
        'name': expProtocolFiles[i],
        'description': s[18].split('|')[i]}
        for i in range(len(expProtocolFiles))
    ] if expProtocolFiles[0] != '' else []
    structure['files']['expResults'] = [{
        'name': expResultsFiles[i],
        'description': s[19].split('|')[i]}
        for i in range(len(expResultsFiles))
    ] if expResultsFiles[0] != '' else []
    structure['files']['simProtocol'] = [{
        'name': simProtocolFiles[i],
        'description': s[20].split('|')[i]}
        for i in range(len(simProtocolFiles))
    ] if simProtocolFiles[0] != '' else []
    structure['files']['simResults'] = [{
        'name': simResultsFiles[i],
        'description': s[21].split('|')[i]}
        for i in range(len(simResultsFiles))
    ] if simResultsFiles[0] != '' else []
    structure['files']['images'] = [{
        'name': imageFiles[i],
        'description': s[23].split('|')[i]}
        for i in range(len(imageFiles))
    ] if imageFiles[0] != '' else []

    structure['stats'] = s[22]
    
    return structure

def get_recent_structures(count):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(recent_structures_query, (count))
        results = cursor.fetchall()
        last_authors = []
        for result in results:
            cursor.execute(get_last_author, (result[4]))
            last_authors.append(cursor.fetchone())
    connection.close()

    structs = []
    for i in range(len(results)):
        structs.append(results[i] + (last_authors[i] if last_authors[i] else ('',)))

    keys = ['title', 'uploadDate', 'description', 'displayImage', 'id', 'firstName', 'lastName', 'lastAuthor']
    structures = [dict(zip(keys, structure)) for structure in structs]

    return jsonify(structures)

def get_next_structures(id, count):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(next_structures_query, (id, count))
        results = cursor.fetchall()
        last_authors = []
        for result in results:
            cursor.execute(get_last_author, (result[4]))
            last_authors.append(cursor.fetchone())
    connection.close()

    structs = []
    for i in range(len(results)):
        structs.append(results[i] + (last_authors[i] if last_authors[i] else ('',)))

    keys = ['title', 'uploadDate', 'description', 'displayImage', 'id', 'firstName', 'lastName', 'lastAuthor']
    structures = [dict(zip(keys, structure)) for structure in structs]

    return jsonify(structures)

def get_random_structures(count):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(random_structures_query, (count))
        results = cursor.fetchall()
    connection.close()

    keys = ['title', 'uploadDate', 'description', 'displayImage', 'id', 'firstName', 'lastName']
    structures = [dict(zip(keys, structure)) for structure in results]

    return jsonify(structures)

def get_recent_tags(count):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(recent_applications_query, (count))
        applications = [app[0] for app in cursor.fetchall()]
        cursor.execute(recent_modifications_query, (count))
        modifications = [mod[0] for mod in cursor.fetchall()]
        cursor.execute(recent_keywords_query, (count))
        keywords = [key[0] for key in cursor.fetchall()]
    connection.close()

    return {'applications': applications, 'modifications': modifications, 'keywords': keywords}

def get_autofill(count):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(recent_applications_query, (count))
        applications = [app[0] for app in cursor.fetchall()]
        cursor.execute(recent_modifications_query, (count))
        modifications = [mod[0] for mod in cursor.fetchall()]
        cursor.execute(recent_keywords_query, (count))
        keywords = [key[0] for key in cursor.fetchall()]
        cursor.execute(recent_authors_query, (count))
        authors = [author[0] for author in cursor.fetchall()]
        cursor.execute(recent_titles_query, (count))
        titles = [title[0] for title in cursor.fetchall() if title[0] != '' and title[0] != None]
        cursor.execute(recent_username_query, (count))
        names = [names[0] for names in cursor.fetchall()]
    connection.close()

    return {
        'title': titles,
        'user_name': names,
        'applications': applications,
        'modifications': modifications,
        'keywords': keywords,
        'authors': authors
    }

def upload_structure(structure, user_id):
    # print('Uploading: ', structure)
    # Convert dicts to arrays
    structure['applications'] = [tag['value'] for tag in structure['applications'] if tag['value'] != '']
    structure['modifications'] = [tag['value'] for tag in structure['modifications'] if tag['value'] != '']
    structure['keywords'] = [tag['value'] for tag in structure['keywords'] if tag['value'] != '']
    structure['authors'] = [tag['value'] for tag in structure['authors'] if tag['value'] != '']

    # Get structure id and user name
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(insert_max_structure_id)
        cursor.execute(get_max_structure_id)
        id = cursor.fetchone()[0]
        cursor.execute(get_user_name, (user_id))
        first_name, last_name = cursor.fetchall()[0]
            
    file_names, file_descriptions, oxdna_files = upload_files(id, structure)
    isPrivate, private_hash = insert_structure(id, structure, user_id, file_names, oxdna_files, file_descriptions, connection)
    connection.close()

    index_structure(id, structure, first_name, last_name)

    return private_hash if isPrivate else id

# Write all files into filesystem
def upload_files(id, structure):
    struct_path = 'structures/' + str(id)
    os.mkdir(struct_path)

    file_types = ['structure', 'expProtocol', 'expResults', 'simProtocol', 'simResults', 'images']
    file_names = [''] * len(file_types)
    file_descriptions = [''] * len(file_types)
    for i, file_type in enumerate(file_types):
        file_dir = os.path.join(struct_path, file_type)
        os.mkdir(file_dir)

        for f in structure[file_type]:
            try:
                file_name = f['file']['_fileNames']
                file_path = os.path.join(file_dir, file_name)
                file_names[i] += file_name + '|'
                file_descriptions[i] += f['description'] + '|'
            except TypeError:
                continue
            write_file(file_name, f['contents'], file_path)
    
    oxdna_files = ''
    if len(structure['oxdna']) > 1 or structure['oxdna'][0]['file'] != '':
        file_dir = os.path.join(struct_path, 'structure')
        for f in structure['oxdna']:
            file_name = f['file']['_fileNames']
            file_path = os.path.join(file_dir, file_name)
            file_names[0] += file_name + '|'
            oxdna_files += file_name + '|'
            file_descriptions[0] += f['description'] + '|'
            write_file(file_name, f['contents'], file_path)

    return file_names, file_descriptions, oxdna_files

# Add structure to MySQL database
def insert_structure(id, structure, user_id, file_names, oxdna_files, file_descriptions, connection):
    upload_date = ''
    if structure['uploadDate']:
        if (len(structure['uploadDate']) == 2 and structure['uploadDate'][0] == ''):
            upload_date = date.today().strftime('%Y-%m-%d')
        else:
            upload_date = structure['uploadDate']
    else:
        if structure['isPrivate'] == True:
            upload_date = '2099-01-01'
        else:
            upload_date = date.today().strftime('%Y-%m-%d')
    
    private = 0
    private_hash = ''
    if structure['isPrivate'] == True:
        private_hash = uuid.uuid4().hex[:8]
        if upload_date == date.today().strftime('%Y-%m-%d') or upload_date == '2099-01-01':
            private = 2
        else:
            private = 1

    #extract structure stats from the oxDNA topology file, if exists
    try:
        top_file = [f for f in file_names[0][:-1].split('|') if '.top' in f][0]
        top_path = 'structures/'+str(id)+'/structure/'+top_file
        stats_data = stats(top_path)
    except Exception as e:
        print('No/bad top file for structure', id, file=sys.stderr)
        stats_data = 'NULL'
    

    structure_data = (
        id,
        int(user_id),
        structure['name'],
        structure['type'],
        structure['description'],
        structure['publishDate'] if structure['publishDate'] else 'NULL',
        structure['citation'],
        structure['link'] ,
        structure['licensing'],
        file_names[0][:-1], file_names[1][:-1], file_names[2][:-1], file_names[3][:-1], file_names[4][:-1], file_names[5][:-1],
        structure['displayImage'],
        file_descriptions[0][:-1], file_descriptions[1][:-1], file_descriptions[2][:-1], file_descriptions[3][:-1], file_descriptions[4][:-1], stats_data, file_descriptions[5][:-1],
        private,
        upload_date,
        oxdna_files,
        private_hash
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
    return structure['isPrivate'] == True, private_hash

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
        'private': 1 if structure['isPrivate'] == True else 0
    })

def edit_structure(new_struct):
    # if new_struct['private'] :
    #     connection = database.pool.get_connection()
    #     with connection.cursor() as cursor:
    #         cursor.execute(get_private_id, (new_struct['id']))
    #         new_struct['id'] = cursor.fetchone()[0]
    id = new_struct['id']
    displayImage = new_struct['files'].pop('displayImage', None)
    file_names = []
    file_descriptions = []
    for file_type in new_struct['files']:
        if file_type != 'oxdnaFiles':
            file_names.append('|'.join([file['name'] for file in new_struct['files'][file_type]]))
            file_descriptions.append('|'.join([file['description'] for file in new_struct['files'][file_type]]))
            if file_type == 'structure':
                new_struct['files']['oxdnaFiles'] = [file for file in new_struct['files']['oxdnaFiles'] if file in file_names[5]]
        
    
    structure_data = (
        int(new_struct['user']['id']),
        new_struct['title'],
        new_struct['type'],
        new_struct['description'],
        '-'.join(new_struct['publication']['publishDate']),
        new_struct['publication']['citation'],
        new_struct['publication']['link'] ,
        new_struct['publication']['licensing'],
        file_names[5], file_names[0], file_names[1], file_names[3], file_names[4], file_names[2],
        displayImage,
        file_descriptions[5], file_descriptions[0], file_descriptions[1], file_descriptions[3], file_descriptions[4], file_descriptions[2],
        new_struct['private'],
        new_struct['uploadDate'],
        '|'.join(new_struct['files']['oxdnaFiles']) + '|',
        id
    )
        
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(modify_structure_query, (structure_data))
    
    edit_files(new_struct['files'], str(id))

    new_applicactions = new_struct['tags']['applications']
    new_modifications = new_struct['tags']['modifications']
    new_keywords = new_struct['tags']['keywords']
    new_authors = new_struct['publication']['authors']

    with connection.cursor() as cursor:
        cursor.execute(get_applications_query, (id))
        applications = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_modifications_query, (id))
        modifications = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_keywords_query, (id))
        keywords = [x[0] for x in cursor.fetchall()]
        cursor.execute(get_authors_query, (id))
        authors = [x[0] for x in cursor.fetchall()]
    
        for application in applications:
            if application not in new_applicactions:
                cursor.execute(delete_app, (application))
        for application in new_applicactions:
            if application not in applications:
                cursor.execute(get_app_id, (application))
                tag_id = cursor.fetchone()
                if not tag_id:
                    cursor.execute(insert_app, (application))
                    cursor.execute(get_last_id)
                    tag_id = cursor.fetchone()
                cursor.execute(insert_app_join, (id, tag_id))
        
        for modification in modifications:
            if modification not in new_modifications:
                cursor.execute(delete_mod, (modification))
        for modification in new_modifications:
            if modification not in modifications:
                cursor.execute(get_mod_id, (modification))
                tag_id = cursor.fetchone()
                if not tag_id:
                    cursor.execute(insert_mod, (modification))
                    cursor.execute(get_last_id)
                    tag_id = cursor.fetchone()
                cursor.execute(insert_mod_join, (id, tag_id))
        
        for keyword in keywords:
            if keyword not in new_keywords:
                cursor.execute(delete_keyword, (keyword))
        for keyword in new_keywords:
            if keyword not in keywords:
                cursor.execute(get_keyword_id, (keyword))
                tag_id = cursor.fetchone()
                if not tag_id:
                    cursor.execute(insert_keyword, (keyword))
                    cursor.execute(get_last_id)
                    tag_id = cursor.fetchone()
                cursor.execute(insert_keyword_join, (id, tag_id))
        
        for author in authors:
            if author not in new_authors:
                cursor.execute(delete_author, (author))
        for author in new_authors:
            if author not in authors:
                cursor.execute(get_author_id, (author))
                tag_id = cursor.fetchone()
                if not tag_id:
                    cursor.execute(insert_author, (author))
                    cursor.execute(get_last_id)
                    tag_id = cursor.fetchone()
                cursor.execute(insert_author_join, (id, tag_id))
    connection.close()

    es.update(index = 'structures', id = id,
    body = {
        'doc': {
            'title': new_struct['title'],
            'applications': new_applicactions,
            'modifications': new_modifications,
            'keywords': new_keywords,
            'authors': new_authors,
        }
    })

    return 'OK'

def edit_files(new_files, id):
    for file_type in new_files:
        if file_type != 'oxdnaFiles':
            # Remove deleted files
            path = 'structures/' + id + '/' + file_type
            old_files = os.listdir(path)
            for file in old_files:
                if file not in [new_file['name'] for new_file in new_files[file_type]]:
                    os.remove(path + '/' + file)

            # Write new filse
            for file in new_files[file_type]:
                if 'contents' in file:
                    write_file(file['name'], file['contents'], path + '/' + file['name'])

def write_file(name, contents, path):
    if is_data_url(name):
        file = open(path, 'wb')
        data_uri = contents
        data = request.urlopen(data_uri).read()
        file.write(data)
    else:
        file = open(path, 'w')
        file.write(contents)
    file.close()

def toggle_private(structure):
    id = structure['id']
    new_privacy = 0 if structure['private'] else 1
    if new_privacy:
        new_hash = uuid.uuid4().hex[:8]
        upload_date = '2099-01-01'
    else:
        upload_date = date.today().strftime('%Y-%m-%d')

    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(toggle_private_query, (new_privacy, id))
        cursor.execute(update_date_query, (upload_date, id))
        if new_privacy:
            cursor.execute(update_hash_query, (new_hash, id))
    connection.close()

    if new_privacy:
        es.update(index = 'structures', id = id,
        body = {
            'doc': {
                'private': 1
            }
        })
    else:
        es.update(index = 'structures', id = id,
        body = {
            'doc': {
                'private': 0
            }
        })
    return new_hash if new_privacy else id

def search_by_user(user_id):
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(get_structures_by_user, (user_id))
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
        if get_session_id() == int(user_id):
            response[-1]['private'] = structure[7]
            response[-1]['privateHash'] = structure[8]
    
    return jsonify(response)

# Query elasticsearch for matching structures
def search(input, category):
    if category == 'user_id':
        return search_by_user(input)

    query = {
        'query': {
            'bool': {
                'must': [
                    {'match': {
                        'private': 0
                    }},
                    {'match': {
                        category: {
                            'query': input,
                            'fuzziness': 'AUTO'
                        }
                    }}
                ],
            },
        }
    }

    # Find structures that match the query
    hits = es.search(index='structures', body=query)['hits']['hits']
    ids = [hit['_id'] for hit in hits]
    if not ids:
        return {}
    
    structures = []
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        for id in ids:
            cursor.execute(get_by_id_single, id)
            structures.append(cursor.fetchone())
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
    
    return jsonify(response)

def is_data_url(file):
    formats = ['jpg', 'png', 'tiff', 'pdf', 'doc', 'docx', 'xls', 'xlsx']
    return file.split('.')[-1] in formats