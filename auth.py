from __future__ import print_function
from datetime import date, datetime, timedelta
from flask import Flask, make_response, render_template, request
from time import time
from user import get_user_id
# import Login
import bcrypt
import os
import binascii
# import EmailScript
import random
import database as db


add_user_query = (
"INSERT INTO Users"
"(`firstName`, `lastName`, `email`, `institution`, `password`, `creationDate`, `verifycode`)"
"VALUES (%s, %s, %s, %s, %s, %s, %s)"
)


def register_user(user):
	connection = db.pool.get_connection()

	print('user', user)

	errors = validate(user)
	print(errors)
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
		cursor.execute(add_user_query, user_data)

	# user_id = Account.getUserId(email)

	# verifylink = request.url_root + 'verify?id={userId}&verify={verifycode}'.format(userId = user_id, verifycode = verifycode)
	# EmailScript.SendEmail('-t 0 -n {username} -u {verifylink} -d {email}'.format(username = firstName, verifylink = verifylink, email = email).split(' '))

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

