import os
import time
import uuid
import subprocess
import bcrypt
from database import pool

get_user_id_query = ('SELECT id FROM Users WHERE email = %s')
get_user_query = ('SELECT firstName, lastName, institution, email FROM Users WHERE id = %s')
get_password_query = ('SELECT password FROM Users WHERE id = %s')
set_password = ("UPDATE Users SET password = %s WHERE id = %s")

def get_user_id(email):
    connection = pool.get_connection()

    result = None
    with connection.cursor() as cursor:
        cursor.execute(get_user_id_query, (email))
        result = cursor.fetchone()

    connection.close()
    return result[0] if result else None

def get_user(user_id):
    connection = pool.get_connection()

    result = None
    with connection.cursor() as cursor:
        cursor.execute(get_user_query, (user_id))
        result = cursor.fetchone()
    connection.close()

    return None if not result else {
        'firstName': result[0],
        'lastName': result[1],
        'institution': result[2],
        'email': result[3]
    }

def setPassword(user_id, new_pass, old_pass):
    if not user_id:
        return 'You are not logged in'
    
    connection = pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(get_password_query, (user_id))
        password_hash = cursor.fetchone()[0]

    if not bcrypt.checkpw(old_pass.encode('utf8'), password_hash.encode('utf8')):
        connection.close()
        return 'Incorrect password'
    if len(new_pass) < 8:
        connection.close()
        return 'Password too short'
    
    new_pass_hash = bcrypt.hashpw(new_pass.encode("utf-8"), bcrypt.gensalt())
    with connection.cursor() as cursor:
        cursor.execute(set_password, (new_pass_hash, user_id))
    connection.close()
    return 'Your password has been updated'
