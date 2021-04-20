from flask import session


def get_home_path():
    return '/var/www/nanobase/nanobase/' if is_prod() else '/vagrant/nanobase/'

def get_base_url():
    return 'https://oxdna.org/' if is_prod() else 'http://localhost:8000/'

# Determine if we are in the server or the VM (true = server)
def is_prod():
    try:
    	open('/var/www/nanobase/nanobase/nanobase_email/login.txt', 'r')
    	return True
    except FileNotFoundError:
    	return False
    
def get_session_id():
    try:
        return session['user_id']
    except KeyError:
        return None
