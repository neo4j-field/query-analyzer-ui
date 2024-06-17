query_execution: list[
    str
] = """
db_query_id, INTEGER "db_query_id" INTEGER NOT NULL
db_transaction_id, INTEGER "db_transaction_id" INTEGER NOT NULL
query_id, INTEGER "query_id" INTEGER
database, varchar(100) "database" varchar(100)
db_id, varchar(20) "db_id" varchar(20)
authenticatedUser, varchar(100) "authenticatedUser" varchar(100)
executedUser, varchar(100) "executedUser" varchar(100)
elapsedTimeMs, INTEGER "elapsedTimeMs" INTEGER
pageFaults, INTEGER "pageFaults" INTEGER
pageHits, INTEGER "pageHits" INTEGER
planning, INTEGER "planning" INTEGER
waiting, INTEGER "waiting" INTEGER
start_timeStamp, DATETIME "start_timeStamp" DATETIME
end_timeStamp, DATETIME "end_timeStamp" DATETIME
allocatedBytes, INTEGER "allocatedBytes" INTEGER
client, varchar(200) "client" varchar(200)
server, varchar(200) "server" varchar(200)
failed, INTEGER "failed" INTEGER
stacktrace, varchar(4000) "stacktrace" varchar(4000)
lang_driver, varchar(100) "lang_driver" varchar(100)
driver_version, varchar(100) "driver_version" varchar(100)
query_type, INTEGER "query_type" INTEGER
""".strip().split(
    "\n"
)

for x in query_execution:
    schemcol = x[x.index('"') :]
    schemcol = schemcol.strip('"')
    field, datatype = schemcol.split('"')
    datatype = datatype.strip()
    print(f"{field}, {datatype}")
