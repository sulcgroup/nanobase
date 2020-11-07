import os
import time
import uuid
import subprocess
import bcrypt
import database as db

get_user_id_query = ('SELECT id FROM Users WHERE email = %s')
get_verify_code_query = ("SELECT verifycode FROM Users WHERE id = %s")
verify_user = ("UPDATE Users SET verified = 1 WHERE id = %s")

def get_user_id(email):
    connection = db.pool.get_connection()

    result = None
    with connection.cursor() as cursor:
        cursor.execute(get_user_id_query, (email))
        result = cursor.fetchone()

    connection.close()
    return result[0] if result else None

def verify(user_id, verify_code):
	connection = db.pool.get_connection()

	code = None
	with connection.cursor() as cursor:
		cursor.execute(get_verify_code_query, (user_id))
		code = cursor.fetchone()

	if code and code[0] == verify_code:
		with connection.cursor() as cursor:
			cursor.execute(verify_user, (user_id))
        connection.close()
        return True
        
	connection.close()
	return False
