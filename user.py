import os
import time
import uuid
import subprocess
import bcrypt
from database import pool

get_user_id_query = ("SELECT id FROM Users WHERE email = %s")
get_user_query = ("SELECT firstName, lastName, institution, email FROM Users WHERE id = %s")

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

    if not result:
        return None

    user = {
        'firstName': result[0],
        'lastName': result[1],
        'institution': result[2],
        'email': result[3]
    }

    return user
