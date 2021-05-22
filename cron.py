import database
from datetime import date

private_query = ('UPDATE Structures SET private=0 WHERE private=1 AND uploadDate <= (SELECT CURDATE())')

def update_privacy():
    connection = database.pool.get_connection()
    with connection.cursor() as cursor:
        cursor.execute(private_query)
    connection.close()

update_privacy()