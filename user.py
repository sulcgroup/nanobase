import os
import time
import uuid
import subprocess
import bcrypt
# import EmailScript
import database as db

get_user_id_query = ("SELECT id FROM Users WHERE email = %s")

def get_user_id(email):
    connection = db.pool.get_connection()

    result = None
    with connection.cursor() as cursor:
        cursor.execute(get_user_id_query, (email))
        result = cursor.fetchone()
    
    connection.close()
    return result[0] if result else None
    
