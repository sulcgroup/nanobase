from dataclasses import dataclass

from werkzeug.exceptions import BadRequest

from app import db
from app.models import Application


@dataclass
class ApplicationDto:
  id: int
  type: str


def dto_from_json(payload):
  try:
    app_node = payload['application']

    return ApplicationDto(app_node.get("id", None), app_node['type'])

  except KeyError as key_error:
    raise BadRequest(key_error.__str__() + ' property missing')


def to_dto(a):
  return ApplicationDto(a.id, a.type)  # TODO: add the file-likes


def add(application_dto):
  a = Application(type=application_dto.type)
  db.session.add(a)
  db.session.commit()
  return a


def get(application_id):
  return Application.query.get(application_id)


def get_all():
  return Application.query.all()
