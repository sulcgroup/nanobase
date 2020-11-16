from __future__ import print_function
from flask import Flask, make_response, render_template, request, session
from datetime import date, datetime, timedelta
from time import time
import bcrypt
import os
import binascii
import random
from nanobase_email.email_script import send_email
from user import get_user_id
from database import pool

get_verify_code_query = ("SELECT verifycode FROM Users WHERE id = %s")
verify_user = ("UPDATE Users SET verified = 1 WHERE id = %s")
get_user_query = ("SELECT id, firstName, lastName, institution, password, verified FROM Users WHERE email = %s")
insert_user = (
	'INSERT INTO Users'
	'(`firstName`, `lastName`, `email`, `institution`, `password`, `creationDate`, `verifycode`)'
	'VALUES (%s, %s, %s, %s, %s, %s, %s)'
)


def verify(user_id, verify_code):
	connection = pool.get_connection()

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

def register_user(user):
	connection = pool.get_connection()

	errors = validate(user)
	if len(errors) > 0:
		connection.close()
		return errors
	
	firstName = user['firstName']
	lastName = user['lastName']
	email = user['email']
	institution = user['institution']
	password = bcrypt.hashpw(user['password'].encode('utf-8'),bcrypt.gensalt())
	creationDate = int(time())
	verifycode = binascii.b2a_hex(os.urandom(15)).decode('utf-8')

	user_data = (firstName, lastName, email, institution, password, creationDate, verifycode)

	with connection.cursor() as cursor:
		cursor.execute(insert_user, user_data)

	user_id = get_user_id(email)

	verifylink = request.url_root + 'auth/verify?id={}&verify={}'.format(user_id, verifycode)
	send_email('-t 0 -n {} -u {} -d {}'.format(firstName, verifylink, email).split(' '))

	connection.close()
	return errors

def validate(user):
	errors = {}

	if 'firstName' not in user:
		errors['firstName'] = 'firstName empty'
	if 'lastName' not in user:
		errors['lastName'] = 'lastName empty'
	if 'institution' not in user:
		errors['institution'] = 'institution empty'
	if 'email' not in user:
		errors['email'] = 'email empty'
	else:
		if '@' not in user['email']:
			errors['email'] = 'email invalid'
		elif get_user_id(user['email']):
			errors['email'] = 'email already registered'
	if 'password' not in user or len(user['password']) < 8:
		errors['password'] = 'password too short'

	return errors

def login(credentials):
	email = credentials['email']
	password = credentials['password']

	if not (email and password):
		return 'Invalid username or password'

	connection = pool.get_connection()

	with connection.cursor() as cursor:
		cursor.execute(get_user_query, (email))
		user_data = cursor.fetchone()
	
	connection.close()

	if user_data:
		user_id, firstName, lastName, institution, password_hash, verified = user_data
	if not (user_data and user_id and password_hash):
		return 'Invalid username or password'

	if bcrypt.checkpw(password.encode("utf8"), password_hash.encode("utf8")):
		if verified:
			user = {
				'firstName': firstName,
				'lastName': lastName,
				'institution': institution,
				'email': email
			}
			session["user_id"] = user_id
			return user
		else:
			return 'Please check your email to verify your account'

	return 'Invalid username or password'


