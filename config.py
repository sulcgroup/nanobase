import os

basedir = os.path.abspath(os.path.dirname(__file__))

DB_NAME = 'nanobase'
DB_USER_NAME = 'root'
DB_PWD = 'Very_secret_pwd01'
DB_HOST = 'localhost'


class Config(object):
    """Base config, uses staging database server."""
    DEBUG = False
    TESTING = False
    DB_SERVER = 'localhost'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{}@{}/{}'.format(DB_USER_NAME, DB_HOST, DB_NAME)

    # @property
    # def SQLALCHEMY_DATABASE_URI(self):
    #     # return 'mysql+pymysql://{}@{}/{}'.format(DB_USER_NAME, DB_HOST, DB_NAME)
    #     return 'mysql+pymysql://root@localhost/nanobase'
