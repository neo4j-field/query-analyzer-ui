import os
import time
import traceback

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from sqlalchemy import Engine, create_engine

import queries_flask as Q
from util import format_seconds

from dotenv import load_dotenv

load_dotenv()

DB_EXTENSION_WHITELIST = {".db", ".sqlite", ".sqlite3"}

CACHE_SIZE = 10000
PAGE_SIZE = 4096
JOURNAL_MODE = "wal"

DATABASE_DIRNAME = (
    os.environ["DATABASE_DIRNAME"] if "DATABASE_DIRNAME" in os.environ else "databases"
)
DATABASE_DIRPATH = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    "..",
    DATABASE_DIRNAME,
)
if not os.path.isdir(DATABASE_DIRPATH):
    exit(f"{DATABASE_DIRPATH} does not exist")

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy()
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
for fn in next(os.walk(DATABASE_DIRPATH))[2]:
    if os.path.splitext(fn)[1].lower() not in DB_EXTENSION_WHITELIST:
        continue
    if "SQLALCHEMY_BINDS" not in app.config:
        app.config["SQLALCHEMY_BINDS"] = {}
    app.config["SQLALCHEMY_BINDS"][fn] = "sqlite:///" + os.path.join(
        DATABASE_DIRPATH, fn
    )

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
db.init_app(app)


@app.route("/apimetadata/dblist")
def get_db_list():
    return jsonify(
        {
            "data": {
                "dbDirectory": os.path.abspath(DATABASE_DIRPATH),
                "dbList": [
                    x
                    for x in next(os.walk(DATABASE_DIRPATH))[2]
                    if x != ".DS_Store"
                    and os.path.splitext(x)[1] in DB_EXTENSION_WHITELIST
                ],
            }
        }
    )


@app.route("/read-sqlite/getquerytext/<query_id>")
def get_query_text(query_id):
    db_file_name = get_db_name_from_request()
    if not db_file_name:
        msg = 'db_file_name "{db_file_name}" is invalid'
        print(msg)
        return jsonify({"error": msg}), 404

    engine = get_db_engine(db_file_name, db, app)
    print(f"Executing 'getquerytext' query...")
    headers, rows = execute_query(
        engine, Q.ENDPOINT_QUERY_DICT["getquerytext"], {"query_id": query_id}
    )
    return jsonify({"data": {"headers": headers, "rows": rows}})


@app.route("/read-sqlite/<endpoint>")
def read_queries(endpoint):
    if endpoint not in Q.ENDPOINT_QUERY_DICT:
        msg = f'The requested endpoint "{endpoint}" is not handled'
        print(msg)
        return jsonify({"error": msg}), 404
    db_file_name = get_db_name_from_request()
    if not db_file_name:
        msg = 'db_file_name "{db_file_name}" is invalid'
        print(msg)
        return jsonify({"error": msg}), 404

    engine = get_db_engine(db_file_name, db, app)
    query = Q.ENDPOINT_QUERY_DICT[endpoint]
    params = {}

    limit = request.args.get("limit", default="")
    if limit:
        query = query.replace("%LIMIT%", str(limit))

    try:
        for pragma_qry, targ_val in [
            ("PRAGMA cache_size", CACHE_SIZE),
            ("PRAGMA page_size", PAGE_SIZE),
            ("PRAGMA journal_mode", JOURNAL_MODE),
        ]:
            _, rows = execute_query(engine, pragma_qry)
            curr = rows[0][0]
            if curr != targ_val:
                print(f"Executing {pragma_qry} = {targ_val}")
                execute_query(engine, f"{pragma_qry} = {targ_val}")

        print(f"Executing '{endpoint}' query...")
        start = time.time()
        headers, rows = execute_query(engine, query, params)
        print(
            f"...'{endpoint}' took {format_seconds(time.time() - start)}s, {len(rows)} rows"
        )
        return jsonify({"data": {"headers": headers, "rows": rows}})
    except Exception as e:
        print(f"Error for endpoint={endpoint}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


def execute_query(engine: Engine, query, params=None):
    """
    Returns: Tuple of (headers: List[str], rows: any[][])
    """
    with engine.connect() as conn:
        if params is not None:
            result = conn.execute(text(query), params)
        else:
            result = conn.execute(text(query))

        # try catch if result ends up being closed
        try:
            headers = [x for x in result.keys()]
        except:
            headers = []
        try:
            rows = [[y for y in x] for x in result.fetchall()]
        except:
            rows = []
        return headers, rows


def get_db_engine(dbname: str, db_: SQLAlchemy, app_: Flask):
    if dbname not in db_.engines:
        print(f"Adding new db '{dbname}' to engines and conf")
        conn_str = "sqlite:///" + os.path.join(DATABASE_DIRPATH, dbname)
        db_.engines[dbname] = create_engine(conn_str)  # type: ignore
        app_.config["SQLALCHEMY_BINDS"][dbname] = conn_str
    return db_.engines[dbname]


def get_db_name_from_request():
    try:
        return request.args.get("dbname")
    except:
        return ""


if __name__ == "__main__":
    app.run(debug=True)
