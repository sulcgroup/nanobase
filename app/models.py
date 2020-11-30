from datetime import datetime

from sqlalchemy.orm import relationship

from app import db


class Application(db.Model):
    __tablename__ = 'Applications'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(255), nullable=False)
    structure_id = db.Column(db.Integer, db.ForeignKey('Structures.id'))

    def __repr__(self):
        return '<Application {}/{}>'.format(self.id, self.type)


class Modification(db.Model):
    __tablename__ = 'Modifications'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    structure_id = db.Column(db.Integer, db.ForeignKey('Structures.id'))

    def __repr__(self):
        return '<Modification {}/{}>'.format(self.id, self.type)


class Structure(db.Model):
    __tablename__ = 'Structures'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    applications = relationship(Application)
    modifications = relationship(Modification)
    is_private = db.Column(db.Boolean)
    is_delayed = db.Column(db.Boolean)
    creation_date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    last_update_date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    display_image = db.Column(db.String(255))

    def __repr__(self):
        return '<Structure {}/{} {}>'.format(self.id, self.type, self.name)


class User(db.Model):
    __tablename__ = 'Users'
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(32), nullable=False)
    lastName = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    institution = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(64), nullable=False)
    creation_date = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    administrator = db.Column(db.Boolean)
    privileged = db.Column(db.Boolean)
    verified = db.Column(db.Boolean)
    verify_code = db.Column(db.String(32), nullable=False)
    reset_token = db.Column(db.String(64), default=None)
    reset_token_expiration = db.Column(db.SmallInteger, nullable=False, default=0)

    def __repr__(self):
        return '<User {}/{} {} @{}>'.format(self.id, self.firstName, self.lastName, self.institution)



