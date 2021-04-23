from flask import session

def get_home_path():
	return '/var/www/nanobase.org/' if is_prod() else '/vagrant/nanobase/'

def get_base_url():
	return 'https://nanobase.org/' if is_prod() else 'http://localhost:5000/'

# Determine if we are in the server or the VM (true = server)
def is_prod():
	prod = True
	try:
		prod = True
		open('/var/www/nanobase.org/nanobase_email/login.txt', 'r')
	except FileNotFoundError:
		prod = False

	return prod
    
def get_session_id():
	try:
		return session['user_id']
	except KeyError:
		return None
