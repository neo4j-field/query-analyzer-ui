# Schema
```
annotation_params
    id, INTEGER, PK
    params, varchar(1000)

graphql_queries (1856)
    id, INTEGER, PK
    app, varchar(40)
    query, varchar(4000)

queries (2919)
    id, INTEGER, PK
    query, varchar(4000)
    runtime, varchar(20)
    write_query, INTEGER

query_annotation (4694)
    annotation_params_id, INTEGER, PK
    graphql_query_id, INTEGER, PK
    query_id, INTEGER, PK

query_execution (2,526,707)
    db_query_id, INTEGER NOT NULL, PK
    db_transaction_id, INTEGER NOT NULL, PK
    query_id, INTEGER, FK
    allocatedBytes, INTEGER
    authenticatedUser, varchar(100)
    client, varchar(200)
    database, varchar(100)
    db_id, varchar(20)
    driver_version, varchar(100)
    elapsedTimeMs, INTEGER
    end_timeStamp, DATETIME
    executedUser, varchar(100)
    failed, INTEGER (binary)
    lang_driver, varchar(100)
    pageFaults, INTEGER
    pageHits, INTEGER
    planning, INTEGER
    query_type, INTEGER
    server, varchar(200)
    stacktrace, varchar(4000)
    start_timeStamp, DATETIME
    waiting, INTEGER
```

## Creates
```sql
CREATE TABLE query_execution (
    db_query_id INTEGER NOT
    NULL, db_transaction_id
    INTEGER NOT NULL, query_id
    INTEGER, database
    varchar(100), db_id
    varchar(20),
    authenticatedUser
    varchar(100), executedUser
    varchar(100),
    elapsedTimeMs INTEGER,
    pageFaults INTEGER,
    pageHits INTEGER, planning
    INTEGER, waiting INTEGER,
    start_timeStamp DATETIME,
    end_timeStamp DATETIME,
    allocatedBytes INTEGER,
    client varchar(200),
    server varchar(200),
    failed INTEGER, stacktrace
    varchar(4000), lang_driver
    varchar(100),
    driver_version
    varchar(100), query_type
    INTEGER, 
    PRIMARY KEY(db_query_id,db_transaction_id), 
    FOREIGN KEY (query_id) REFERENCES queries (id) 
    ON DELETE CASCADE ON UPDATE NO
    ACTION
)
```