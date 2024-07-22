from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.sql import text
from sqlalchemy import engine
import queries_flask as Q

# this variable, db, will be used for all SQLAlchemy commands

db = SQLAlchemy()
# create the app
app = Flask(__name__)
# change string to the name of your database; add path if necessary

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///query_db2.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

# initialize the app with Flask-SQLAlchemy
db.init_app(app)

class Query(db.Model):
    __tablename__ = 'queries'
    id = db.Column(db.Integer, primary_key=True)
    query = db.Column(db.String(100), nullable=False)
    runtime = db.Column(db.String(100), nullable=True)
    write_query = db.Column(db.Integer)

class QueryExecution(db.Model):
    __tablename__ = 'query_execution'
    db_query_id = db.Column(db.Integer, primary_key=True)
    db_transaction_id = db.Column(db.Integer, primary_key=True)
    server = db.Column(db.String(200), primary_key=True)
    query_id = db.Column(db.Integer)
    database = db.Column(db.String(100))
    db_id = db.Column(db.String(20))
    authenticatedUser = db.Column(db.String(100))
    executedUser = db.Column(db.String(100))
    elapsedTimeMs = db.Column(db.Integer)
    pageFaults = db.Column(db.Integer)
    pageHits = db.Column(db.Integer)
    planning = db.Column(db.Integer)
    waiting = db.Column(db.Integer)
    start_timeStamp = db.Column(db.Integer)
    end_timeStamp = db.Column(db.Integer)
    allocatedBytes = db.Column(db.Integer)
    client = db.Column(db.String(200))
    failed = db.Column(db.Integer)
    stacktrace = db.Column(db.String(4000))
    lang_driver = db.Column(db.String(100))
    driver_version = db.Column(db.String(100))
    query_type = db.Column(db.Integer)


# NOTHING BELOW THIS LINE NEEDS TO CHANGE
# this route will test the database connection - and nothing more
@app.route('/testconnect')
def testconnect():
    try:
        db.session.query(text('1')).from_statement(text('SELECT 1')).all()
        return '<h1>It works.</h1>'
    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text

@app.route('/read-sqlite/getquerytext/<query_id>')
def get_query_text(query_id):
    db_file_name = get_db_name_from_request()
    if not db_file_name:
        msg = 'db_file_name "{db_file_name}" is invalid'
        print(msg)
        return jsonify({"error": msg}), 404
    print(f"Executing 'getquerytext' query...")
    result = db.session.execute(
        text(Q.ENDPOINT_QUERY_DICT["getquerytext"]),
        {"query_id": query_id},
    )
    return jsonify({"data": dict(zip(result.keys(), result.first()))})
    

@app.route('/read-sqlite/<endpoint>')
def read_queries(endpoint):
    if endpoint not in Q.ENDPOINT_QUERY_DICT:
        msg = f'The requested endpoint "{endpoint}" is not handled'
        print(msg)
        return jsonify({"error": msg}), 404
    query = Q.ENDPOINT_QUERY_DICT[endpoint]
    params = {}

    try:
        a = db.session.execute(db.select(Query).filter_by(id=2)).first()
        b = [x for x in db.session.execute(db.select(QueryExecution).filter_by(db_query_id=441525)).first()]
        c = [x for x in QueryExecution.query.limit(10).all()]
        print(f"Executing '{endpoint}' query...")
        result = db.session.execute(text(query))
    
        # Map the results to column names
        rows = []
        for row in result:
            row_dict = dict(zip(result.keys(), row))
            rows.append(row_dict)
        print(f'{len(rows)} rows')
        return "whatever"
        # rows = QueryExecution.query.limit(10).all()
        # result = []
        # for row in rows:
        #     result.append({
        #         'db_query_id': row.db_query_id,
        #         'db_transaction_id': row.db_transaction_id,
        #         'server': row.server,
        #         'query_id': row.query_id,
        #         'database': row.database,
        #         'db_id': row.db_id,
        #         'authenticatedUser': row.authenticatedUser,
        #         'executedUser': row.executedUser,
        #         'elapsedTimeMs': row.elapsedTimeMs,
        #         'pageFaults': row.pageFaults,
        #         'pageHits': row.pageHits,
        #         'planning': row.planning,
        #         'waiting': row.waiting,
        #         'start_timeStamp': row.start_timeStamp,
        #         'end_timeStamp': row.end_timeStamp,
        #         'allocatedBytes': row.allocatedBytes,
        #         'client': row.client,
        #         'server_hostname': row.server_hostname,
        #         'failed': row.failed,
        #         'stacktrace': row.stacktrace,
        #         'lang_driver': row.lang_driver,
        #         'driver_version': row.driver_version,
        #         'query_type': row.query_type
        #     })
        # return jsonify(result)
    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text

@app.route('/list_tables')
def list_tables():
    # Use SQLAlchemy's inspector to get a list of table names
    inspector = db.inspect(db.engine)
    tables = inspector.get_table_names()
    return f'Tables in the database: {tables}'

def get_db_name_from_request():
    try:
        return request.args.get("dbname")
    except:
        return ""



# class ReadSQLiteView(APIView):
#     def get(self, request, endpoint, optional_param=None):
#         # logger.debug(request)
#         if endpoint not in Q.ENDPOINT_QUERY_DICT:
#             msg = f'The requested endpoint "{endpoint}" is not handled'
#             print(msg)
#             return Response({"error": msg}, status=status.HTTP_404_NOT_FOUND)
#         query = Q.ENDPOINT_QUERY_DICT[endpoint]
#         params = {}
#         if endpoint == "getquerytext":
#             params["query_id"] = optional_param

#         #
#         # URL PARAMETERS
#         #

#         try:
#             db_file_name = request.GET.get("dbname")
#         except:
#             db_file_name = None
#         if db_file_name is None:
#             msg = 'db_file_name "{db_file_name}" is invalid'
#             print(msg)
#             return Response({"error": msg}, status=status.HTTP_404_NOT_FOUND)

#         try:
#             limit = request.GET.get("limit")
#         except:
#             limit = 10
#         if limit is None:
#             limit = 10
#         query = query.replace("%LIMIT%", str(limit))

#         #
#         # db paths
#         #
#         fp = os.path.join(DATABASE_DIRPATH, db_file_name)
#         if not os.path.isfile(fp):
#             print(f'The specified database path "{fp}" does not exist.')
#             return Response(
#                 {"error": f"{fp} not found"}, status=status.HTTP_404_NOT_FOUND
#             )

#         #
#         # QUERY DATABASE
#         #
#         try:
#             conn = sqlite3.connect(fp)
#             cursor = conn.cursor()

#             for pragma_qry, targ_val in [
#                 ("PRAGMA cache_size", CACHE_SIZE),
#                 ("PRAGMA page_size", PAGE_SIZE),
#                 ("PRAGMA journal_mode", JOURNAL_MODE),
#             ]:
#                 execute_query(cursor, pragma_qry)
#                 curr = cursor.fetchall()[0][0]
#                 if curr != targ_val:
#                     execute_query(cursor, f"{pragma_qry} = {targ_val}")

#             start = time.time()
#             execute_query(cursor, query, params)
#             logger.debug(f"...took {time.time() - start:.3f}")

#             headers = [x[0] for x in cursor.description]
#             start = time.time()
#             rows = cursor.fetchall()
#             logger.debug(f"fetchall took {time.time() - start:.3f}")

#             data = {"headers": headers, "rows": rows}
#             start = time.time()
#             logger.debug("Creating Response object...")
#             ret = Response({"data": data}, status=status.HTTP_200_OK)
#             logger.debug(f"...took {time.time() - start:.3f}")
#             return ret
#         except sqlite3.Error as e:
#             errorMsg = str(e)
#             logger.error(f"sqlite3.Error: {errorMsg}")
#             traceback.format_exc()
#             return Response({"error": errorMsg}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             errorMsg = str(e)
#             e.with_traceback()
#             logger.error(f"Exception: {errorMsg}")
#             traceback.format_exc()
#             return Response(
#                 {"error": errorMsg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

    

if __name__ == '__main__':
    app.run(debug=True)