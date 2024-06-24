QUERY_COUNT_UNIQUE_QUERIES = """
SELECT count(1) as numUniqueQueries FROM queries
"""

#  Number of Queries executed. Average time taken, avg page hits, avg page faults.


# query = "SELECT * FROM users WHERE age > :age AND city = :city"
# params = {'age': 30, 'city': 'New York'}

# cursor.execute(query, params)

QUERY_TOP5_QUERIES_EXECUTED = """
SELECT query_id, count(query_id) as "Total Executions"
FROM query_execution qe
GROUP BY query_id
ORDER BY "Total Executions" desc
LIMIT %LIMIT%
"""

QUERY_TOP5_PAGE_HITS = """
SELECT query_id,
  sum(pageHits) as "Total Page Hits",
  min(pageHits) as "Min Page Hits",
  max(pageHits) as "Max Page Hits",
  avg(pageHits) as "Avg Page Hits"
FROM query_execution qe
GROUP BY query_id
ORDER BY sum(pageHits) DESC
LIMIT %LIMIT%
"""

QUERY_TOP5_PAGE_FAULTS = """
SELECT query_id,
  sum(pageFaults) as "Total Page Faults",
  min(pageFaults) as "Min Page Faults",
  max(pageFaults) as "Max Page Faults",
  avg(pageFaults) as "Avg Page Faults"
FROM query_execution
GROUP BY query_id
ORDER BY "Total Page Faults" DESC
LIMIT %LIMIT%
"""

QUERY_TOP5_ELAPSED_TIME = """
SELECT query_id, 
  sum(elapsedTimeMs) as "Total Elapsed Time (ms)",
  min(elapsedTimeMs) as "Min Elapsed Time (ms)",
  max(elapsedTimeMs) as "Max Elapsed Time (ms)",
  avg(elapsedTimeMs) as "Avg Elapsed Time (ms)"
FROM query_execution
GROUP BY query_id
ORDER BY "Total Elapsed Time (ms)" DESC
LIMIT %LIMIT%
"""

QUERY_GET_PLANNING_PCT = """
SELECT 
  avg(hasPlanning) * 100.0 as percentQueriesPlanned,
  sum(planning) * 100.0 /  sum(elapsedTimeMs) as planElapsedPercent
FROM (
  SELECT case planning when  0 THEN 0 ELSE 1 END as hasPlanning, planning, elapsedTimeMs
  FROM query_execution
)
"""

QUERY_GET_QUERY_TEXT = """
SELECT id, query, runtime, write_query
FROM queries
WHERE id=:query_id
"""

QUERY_GENERAL_STATS = """
  SELECT avg(pageHits) as avgPageHits, 
  avg(pageFaults) as avgPageFaults, 
  avg(elapsedTimeMs) as avgTimeTaken, 
  count(1)  as numQueriesExecuted,
  min(start_timeStamp) as firstStartTimestampMs, 
  min(end_timeStamp) as firstEndTimestampMs, 
  max(start_timeStamp) as lastStartTimestampMs, 
  max(end_timeStamp) as lastEndTimestampMs, 
  (max(start_timestamp)-min(start_timeStamp))/1000/60  as windowDurationMin
FROM query_execution 
"""

# -- which servers started queries at a certain timestamp and how many queries
QUERY_ = """
select DATETIME(start_timeStamp/1000, 'unixepoch' )as seconds,  server, count(1) as queries 
from query_execution group by seconds, server 
"""

# -- each query_id's average planning time, total planning, count of each query
# -- where planning more than 20
QUERY_ = """
select query_id, avg(planning), sum(planning), count(1) 
from query_execution 
where planning > 20 GROUP by query_id
"""

# -- timestamps and queries
QUERY_TIME_QUERY_COUNT = """
select start_timeStamp as time, count(1) as numQueries 
from query_execution 
group by time order by time
"""

# -- how many queries for each server+timestamp combo order by server
# -- "for each server at each time point, how many queries"
QUERY_ = """
select server, DATETIME(start_timeStamp/1000, 'unixepoch' ) as time,  count(1) as count 
from query_execution 
group by server, time 
"""

# -- same as above, but only failed queries and order by time first 
QUERY_ = """
select datetime(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as count 
from query_execution 
where failed=1 
GROUP by time, server
"""

# -- num servers
QUERY_QUERY_COUNT_BY_SERVER = """
SELECT server, count(1) as "Number of Queries Run"
FROM query_execution 
GROUP by server
ORDER BY "Number of Queries Run" DESC
"""

# -- time+server counts where planning > 100
QUERY_ = """
select datetime(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as count 
from query_execution 
where planning>100 
GROUP by time, server
"""

# -- time+server: query counts, average and total plannning times, elapsed
# -- "for each server at each time point, how many queries, average and total planning and elapsed times"
QUERY_ = """
select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, 
  server, 
  count(1) as queries, 
  avg(planning) as avgPlanning, 
  sum(planning) as totalPlanning, 
  avg(elapsedtimems) as avgTime, 
  sum(elapsedtimems) as totalTime 
from query_execution 
group by  server, time --order by queries desc
"""



# mine
QUERY_ALL_TIMESTAMPS = """
SELECT qe.db_query_id, qe.db_transaction_id, qe.query_id, qe.start_timeStamp, qe.end_timeStamp
FROM query_execution as qe
"""

# mine
QUERY_COUNT = """
SELECT count(*)
from query_execution
"""

# mine
QUERY_LONGEST_QUERIES = """
SELECT
qe.query_id,
queries.query,
count(qe.query_id) as ct,
AVG(qe.end_timeStamp-qe.start_timeStamp) AS average_duration
FROM query_execution as qe
JOIN queries ON qe.query_id = queries.id
GROUP BY query_id
ORDER BY average_duration DESC
LIMIT %LIMIT%;
"""

QUERY_PERCENTILE = """
SELECT query_id, minTime_lower90, maxTime_lower90, avgTime_lower90,minHits_lower90, maxHits_lower90, avgHits_lower90, count_lower90, minTime_upper90, maxTime_upper90, avgTime_upper90, minHits_upper90, maxHits_upper90, avgHits_upper90, count_upper90
FROM
(
  SELECT lower90.query_id as query_id, minTime_lower90, maxTime_lower90, avgTime_lower90,minHits_lower90, maxHits_lower90, avgHits_lower90, count_lower90, minTime_upper90, maxTime_upper90, avgTime_upper90, minHits_upper90, maxHits_upper90, avgHits_upper90, count_upper90
  FROM 
  ( 
    SELECT query_id, min(elapsedTimeMs) as minTime_lower90, max(elapsedTimeMs) as maxTime_lower90, avg(elapsedTimeMs) as avgTime_lower90,  min(pageHits) as minHits_lower90, max(pageHits) as maxHits_lower90, avg(pageHits) as avgHits_lower90, count(1) as count_lower90
    FROM (
      SELECT query_id, elapsedTimeMs, pageHits, SizePercentRank
      FROM (
        SELECT
          query_id,
          elapsedTimeMs,
          pageHits,
          PERCENT_RANK() OVER( 
            PARTITION BY query_id
            ORDER BY elapsedTimeMs ASC
          ) SizePercentRank
        FROM query_execution
      ) WHERE SizePercentRank < 0.9
    ) GROUP BY query_id   
  ) lower90
  LEFT JOIN 
  (
    SELECT query_id, min(elapsedTimeMs) as minTime_upper90, max(elapsedTimeMs) as maxTime_upper90, avg(elapsedTimeMs) as avgTime_upper90, min(pageHits) as minHits_upper90, max(pageHits) as maxHits_upper90, avg(pageHits) as avgHits_upper90, count(1) as count_upper90
    FROM (
        SELECT query_id, elapsedTimeMs, pageHits, SizePercentRank
        FROM (
          SELECT
            query_id,
            elapsedTimeMs,
            pageHits,
            PERCENT_RANK() OVER( 
              PARTITION BY query_id
              ORDER BY elapsedTimeMs ASC
            ) SizePercentRank
        FROM
        query_execution
      ) WHERE SizePercentRank >=0.9
    ) GROUP BY query_id 
  ) upper90 ON lower90.query_id=upper90.query_id 
) percData
WHERE query_id in (SELECT DISTINCT query_id from query_annotation)
"""

ENDPOINT_QUERY_DICT = {
    "longestavgqueries": QUERY_LONGEST_QUERIES,
    "allqueriestimes": QUERY_ALL_TIMESTAMPS,
    "querycount": QUERY_COUNT,
    "querypercentile": QUERY_PERCENTILE,
    "getquerytext": QUERY_GET_QUERY_TEXT,
    "getquerycountbyserver": QUERY_QUERY_COUNT_BY_SERVER,
    "timequerycount": QUERY_TIME_QUERY_COUNT,
    "planningpercent": QUERY_GET_PLANNING_PCT,
    "countuniquequeries": QUERY_COUNT_UNIQUE_QUERIES,
    "generalstats": QUERY_GENERAL_STATS,
    "pageHits": QUERY_TOP5_PAGE_HITS,
    "queriesexecuted": QUERY_TOP5_QUERIES_EXECUTED,
    "pageFaults": QUERY_TOP5_PAGE_FAULTS,
    "elapsedTime": QUERY_TOP5_ELAPSED_TIME,
}