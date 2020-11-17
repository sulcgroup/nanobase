from flask import session

# Determine if we are in the server or the VM
def get_home_path():
    try:
    	open('/var/www/nanobase/nanobase/nanobase_email/login.txt', 'r')
    	path = '/var/www/nanobase/nanobase/'
    except FileNotFoundError:
    	path = '/vagrant/nanobase/'
    return path
    
def get_session_id():
    try:
        return session['user_id']
    except KeyError:
        return None
