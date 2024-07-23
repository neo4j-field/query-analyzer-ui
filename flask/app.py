import traceback

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text

import queries_flask as Q


CACHE_SIZE = 10000
PAGE_SIZE = 4096
JOURNAL_MODE = "wal"

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy()
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///query_db2.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
db.init_app(app)


@app.route("/read-sqlite/getquerytext/<query_id>")
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


@app.route("/read-sqlite/<endpoint>")
def read_queries(endpoint):
    if endpoint not in Q.ENDPOINT_QUERY_DICT:
        msg = f'The requested endpoint "{endpoint}" is not handled'
        print(msg)
        return jsonify({"error": msg}), 404
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
            result = execute_query(db, pragma_qry)
            curr = result.first()[0]
            if curr != targ_val:
                print(f"Executing {pragma_qry} = {targ_val}")
                execute_query(db, f"{pragma_qry} = {targ_val}")

        print(f"Executing '{endpoint}' query...")
        result = execute_query(db, query, params)
        headers = [x for x in result.keys()]
        rows = [[y for y in x] for x in result.fetchall()]
        return jsonify({"data": {"headers": headers, "rows": rows}})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

def execute_query(db, query, params=None):
    if params is not None:
        return db.session.execute(text(query), params)
    else:
        return db.session.execute(text(query))

def get_db_name_from_request():
    try:
        return request.args.get("dbname")
    except:
        return ""


if __name__ == "__main__":
    app.run(debug=True)
