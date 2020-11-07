# Determine if we are in the server or the VM
def get_home_path():
    try:
    	open('/var/www/nanobase/nanobase/nanobase_email/login.txt', 'r')
    	path = '/var/www/nanobase/nanobase/'
    except FileNotFoundError:
    	path = '/vagrant/nanobase/'
    return path
    