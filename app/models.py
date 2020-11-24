from datetime import datetime

from sqlalchemy.orm import relationship

from app import db


class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(255), nullable=False)
    structure_id = db.Column(db.Integer, db.ForeignKey('structures.id'))

    def __repr__(self):
        return '<Application {}/{}>'.format(self.id, self.type)


class Modification(db.Model):
    __tablename__ = 'modifications'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)
    structure_id = db.Column(db.Integer, db.ForeignKey('structures.id'))

    def __repr__(self):
        return '<Modification {}/{}>'.format(self.id, self.type)


class Structure(db.Model):
    __tablename__ = 'structures'
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


