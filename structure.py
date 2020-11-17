from app import db
from dataclasses import dataclass
from typing import List
from werkzeug.exceptions import BadRequest
from app.models import Structure, Application

FILE_LIKE_TYPES = ["images", "expResults", "expProtocol", "simProtocol", "simResults", "structureFiles"]


@dataclass
class FileLike:
    type: str
    file: str
    description: str


@dataclass
class StructureDto:
    id: int
    name: str
    type: str
    creation_date: str
    description: str
    display_image: str
    applications: List[str]
    keywords: List[str]
    modifications: List[str]
    is_delayed: bool
    is_private: bool
    files: List[FileLike]


def from_json(payload):
    try:
        sn = payload['structure']
        file_likes = []

        for fl in FILE_LIKE_TYPES:
            for file_like in sn.get(fl, []):  # each of the file-like entries is a list of file/description
                if file_like.get('file', None):
                    file_likes.append(FileLike(fl, file_like['file'], file_like['description']))

        return StructureDto(sn.get('id', None),
                            sn['name'],
                            sn['type'],
                            sn.get('date', None),
                            sn.get('description', None),
                            sn.get('displayImage', None),
                            list(map(lambda d: d['value'], sn.get('applications', []))),
                            list(map(lambda d: d['value'], sn.get('keywords', []))),
                            list(map(lambda d: d['value'], sn.get('modifications', []))),
                            sn.get('isDelayed', None),
                            sn.get('isPrivate', None),
                            file_likes)

    except KeyError as key_error:
        raise BadRequest(key_error.__str__() + ' property missing')


def to_dto(s):
    return StructureDto(s.id,
                        s.name,
                        s.type,
                        s.creation_date,
                        s.description,
                        s.display_image,
                        list(map(lambda a: a.type, s.applications)),
                        [],  # TODO: Add the keywords to the response
                        [],  # TODO: Add the modifications
                        s.is_private,
                        s.is_delayed,
                        [])  # TODO: add the file-likes


def add(structure_dto):
    s = Structure(name=structure_dto.name,
                  type=structure_dto.type,
                  description=structure_dto.description,
                  applications=list(map(lambda a: Application(type=a), structure_dto.applications)),
                  # TODO: add the keywords and modifications
                  is_private=structure_dto.is_private,
                  is_delayed=structure_dto.is_delayed)
    db.session.add(s)
    db.session.commit()
    return s


def find(structure_id):
    return Structure.query.get(structure_id)


def get_all():
    return Structure.query.all()
