import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              "mysql+mysqlconnector://root@localhost:3600/nanobase"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
