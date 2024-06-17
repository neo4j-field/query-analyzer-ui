-- which servers started queries at a certain timestamp and how many queries
select DATETIME(start_timeStamp/1000, 'unixepoch' )as seconds,  server, count(1) as queries 
from query_execution group by seconds, server 

-- each query_id's average planning time, total planning, count of each query
-- where planning more than 20
select query_id, avg(planning), sum(planning), count(1) 
from query_execution 
where planning > 20 
GROUP by query_id

-- total duration of window of time this log was taken
select (max(start_timestamp)-min(start_timeStamp))/1000/60  as windowDuration
from query_execution

-- which timestamps had the most queries being run
select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, count(1) as queries 
from query_execution 
group by time order by queries desc

-- how many queries for each server+timestamp combo order by time
-- "for each server at each time point, how many queries"
select datetime(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as count 
from query_execution 
-- where failed=1 
GROUP by time, server

-- num servers
select server, count(1) as numQueriesRun
from query_execution GROUP by server

-- time+server counts where planning > 100
select datetime(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as count 
from query_execution 
where planning>100 
GROUP by time, server

-- time+server: query counts, average and total plannning times, elapsed
-- "for each server at each time point, how many queries, average and total planning and elapsed times"
select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, 
  server, 
  count(1) as queries, 
  avg(planning) as avgPlanning, 
  sum(planning) as totalPlanning, 
  avg(elapsedtimems) as avgTime, 
  sum(elapsedtimems) as totalTime 
from query_execution 
group by  server, time 
--order by queries desc



qid	count
1	1891
2	42
3	81
31	603884
32	258776
33	85097
34	258854
35	56824
36	258783
37	259644
38	91312
39	91442
40	392645
41	488728
42	696460
43	173823
44	202205
45	525
47	716244
48	199454
49	232781
50	369482
51	722571
52	50731
53	165452
54	152199
69	2
82	365704

min: 2024-01-30 16:04:07	
max: 2024-01-31 07:59:16

16*60*60

10.192.190.247	2752488
10.192.20.86	7751164
10.192.62.97	2831795

server	        count	min(elapsedtimems)	max(elapsedtimems)	avg(elapsedtimems)
10.192.190.247	2752488	    1	                98997	        103.627934799352
10.192.20.86	7751164	    1	                31719	        34.7538247158749
10.192.62.97	2831795	    1	                30010	        75.5489613478377


select  server, count(1) as count 
from query_execution 
where elapsedTimeMs>5000 group by server

10.192.190.247	13000
10.192.20.86	2184
10.192.62.97	11039

select  server, count(1) as count 
from query_execution where elapsedTimeMs>10000 group by server
10.192.190.247	8851
10.192.20.86	573
10.192.62.97	5686

-- select query_id, min(elapsedtimems), max(elapsedtimems), avg(elapsedtimems)  from query_execution GROUP by query_id

select query_id, count(1) as count, avg(elapsedtimems)  
from query_execution 
where elapsedTimeMs > 1000 
GROUP by query_id
query_id	count	avg(elapsedtimems)


select query_id, count(1) as count, avg(elapsedtimems)  from query_execution where elapsedTimeMs > 500 GROUP by query_id
query_id	count	avg(elapsedtimems)


select query from queries where id in (42, 50, 55, 58, 59, 60, 61)


-- -- CYPHER
-- profile MATCH (s:Student {id: '5b73f3bc-0f01-4d24-b732-84c5ae123d29'})<-[:ASSIGNED_TO]-(ac)-[:OF_CONTEXT]->(c:Context) 
-- USING index c:Context(id)
-- USING index s:Student(id)
-- WHERE c.id in ["629181ec-f242-49d1-90d9-20eb04acd69b",
-- "d943ba18-869a-4d93-867f-d2a93fbc7d0e",
-- "f6ab9935-cf2a-4431-ac05-77df0edd469a",
-- "30998a36-aa79-44cc-8194-4adbb57673d4",
-- "ed9c493b-4799-4698-8d76-6eda864f699c",
-- "8f3803b0-3488-48a8-9eab-29a0da4a7cf8",
-- "9f17571f-a944-41e1-894e-38340580cbe4",
-- "84024ab5-5917-4c8b-bf90-5bb2d3908de5",
-- "7859fea9-2351-4dd4-84a6-96d02c6d4db2",
-- "6cc4204b-7655-40fd-a872-cfa6bbd6ae94",
-- "03bbf40c-4bdb-43f8-9390-26090449228a",
-- "f7ac5077-c665-4c01-81e4-1fc35cbeb0aa",
-- "2a26c582-d883-460a-b98a-3ca7b920cc41",
-- "a3db9e58-4866-45ec-bd8d-33d444924832",
-- "28aee33c-c73c-4738-b547-620bbaa59923"]
-- return count(*)


-- id	query
-- 42	
-- 		CREATE (sa:StudentAnswer{
-- 		studentAnswerId: $studentAnswerId,
-- 		questionAnswerId: $questionAnswerId,
-- 		studentAnswer: $studentAnswer,
-- 		questionAnswersOrder: $questionAnswersOrder,
-- 		questionAnswersAssociation: $questionAnswersAssociation,
-- 		timeSpent: $timeSpent,
-- 		createdAt: datetime(),
-- 		timestampDay: datetime().epochMillis / 1000 / 60 / 60 / 24})
-- 		WITH sa
-- 		MATCH (s:Student {id: $studentId}) 
-- 		WITH sa, s
-- 		MATCH (s)<-[:ASSIGNED_TO]-(ac:AssignedContext)-[:OF_CONTEXT]->(c:Context) 
-- 		WHERE c.id in $contextId WITH sa, ac
-- 		CREATE (ac)<-[:OF_ASSIGNED_CONTEXT]-(sa)
        
-- 50	MATCH (q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
-- 	MATCH (q)<-[:ANSWER_OF]-(:QuestionAnswer)
-- 	WITH DISTINCT q
-- 	OPTIONAL MATCH (:Student{id: $studentId})-[:ANSWERED]->(sa:StudentAnswer)-[:TO]->(q)
-- 	WITH q.questionId as questionId, q.difficulty as difficulty, COUNT(sa) as attemptsPerQuestion
-- 	ORDER BY questionId
	
-- 	RETURN {questionId: questionId, difficulty: difficulty, attemptsPerQuestion: toFloat(attemptsPerQuestion)}
-- 	ORDER BY attemptsPerQuestion
-- 55	MATCH (this:Question)

-- WHERE (this.questionId = $param0 AND this.visible = $param1)
-- CALL {
--     WITH this
--     MATCH (this)<-[this0:ANSWER_OF]-(this1:QuestionAnswer)
--     WITH this1 { .questionAnswerId, .text, .fraction } AS this1
--     RETURN collect(this1) AS var2
-- }
-- RETURN this { .questionId, .questionCommand, .text, .visible, .type, answers: var2 } AS this

-- 58	UNWIND $create_param0 AS create_var0
-- CALL {
--     WITH create_var0
--     CREATE (create_this1:Battle)
--     SET
--         create_this1.type = create_var0.type,
--         create_this1.status = create_var0.status,
--         create_this1.createdAt = datetime(),
--         create_this1.updatedAt = datetime(),
--         create_this1.id = randomUUID()
    
--     RETURN create_this1
-- }
-- RETURN collect(create_this1 { .id }) AS data
-- 59	UNWIND $create_param0 AS create_var0
-- CALL {
--     WITH create_var0
--     CREATE (create_this1:QuestionRound)
--     SET
--         create_this1.status = create_var0.status,
--         create_this1.id = randomUUID()
    
--     RETURN create_this1
-- }
-- RETURN collect(create_this1 { .id, .status }) AS data
-- 60	MATCH (q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
-- 					MATCH (q)<-[:ANSWER_OF]-(:QuestionAnswer)
-- 					WITH DISTINCT q
-- 					OPTIONAL MATCH (:Student{id: $studentId})-[:ANSWERED]->(sa:StudentAnswer)-[:TO]->(q)
-- 					WITH q.questionId as questionId, q.difficulty as difficulty, COUNT(sa) as attemptsPerQuestion
-- 					ORDER BY questionId
					
-- 					RETURN {questionId: questionId, difficulty: difficulty, attemptsPerQuestion: toFloat(attemptsPerQuestion)}
-- 					ORDER BY attemptsPerQuestion
-- 61	MATCH (s:Student{id: $studentId})<-[rt:RECOMMENDED_TO]-(q:Question{visible: true})-[:ACTIVITY_OF]->(:Topic{topicId: $topicId})
-- 					RETURN {questionId: q.questionId, questionDifficulty: q.difficulty, studentAbilityGlobal: rt.studentAbilityGlobal, studentAbilityInCourse: rt.studentAbilityInCourse, studentAbilityInTopic: rt.studentAbilityInTopic, abilityError: rt.abilityError, abilityErrorPercent: rt.abilityErrorPercent, studentSAEBAbilityInCourse: rt.studentSAEBAbilityInCourse, studentENEMAbilityInCourse: rt.studentENEMAbilityInCourse, hitProbability: rt.hitProbability, score: rt.score} as recommendedQuestion

-- 					ORDER BY recommendedQuestion.score DESC



server						qcount
							1
10.192.190.247				34
10.192.20.86				45
10.192.62.97				29
var/run/neo4j/maintenance.sock>	4


select query_id, server, count(1) as count 
from query_execution qe, queries q 
where qe.query_id=q.id and q.write_query=0 group by  query_id, server

select query_id, server, count(1) as count 
from query_execution qe, queries q 
where qe.query_type=0 and qe.query_id=q.id and q.write_query=0 and q.runtime != 'system' 
group by  query_id, server

lang_driver			plan_count	total		percentage
Go Driver			1125		6895636		< 1% (1.6 per 10000)
neo4j-javascript	105513		6440433		1.6% (163.8 per 10000)
neo4j-browser		51			1390		
neo4j-desktop		4			4


Go Driver	6895636
neo4j-browser	1390
neo4j-desktop	4
neo4j-javascript	6440433

-- select server, count(1) as qcount from (
-- select query_id, server, count(1) as count from query_execution qe, queries q where qe.query_type=0 and qe.query_id=q.id and q.write_query=0 and q.runtime != 'system' group by  query_id, server
-- ) GROUP by server
-- select DATETIME(start_timeStamp/1000, 'unixepoch' ) from query_execution where db_query_id=5624006 and db_transaction_id=5618000
-- select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as queries, avg(planning) as avgPlanning, sum(planning) as totalPlanning, avg(elapsedtimems) as avgTime, sum(elapsedtimems) as totalTime from query_execution group by  server, time --order by queries desc
-- select strftime('%s','2024-01-30 21:18:47') from queries limit 1
-- select query_id, count(1) as count FROM query_execution where planning > 500 GROUP by query_id
-- select distinct lang_driver from query_execution where query_id in (55,58,59)
select  lang_driver, count(1) as count from query_execution where  planning > 0 group by lang_driver


-- select server, count(1) as qcount from (
-- select query_id, server, count(1) as count from query_execution qe, queries q where qe.query_type=0 and qe.query_id=q.id and q.write_query=0 and q.runtime != 'system' group by  query_id, server
-- ) GROUP by server
-- select DATETIME(start_timeStamp/1000, 'unixepoch' ) from query_execution where db_query_id=5624006 and db_transaction_id=5618000
-- select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as queries, avg(planning) as avgPlanning, sum(planning) as totalPlanning, avg(elapsedtimems) as avgTime, sum(elapsedtimems) as totalTime from query_execution group by  server, time --order by queries desc
-- select strftime('%s','2024-01-30 21:18:47') from queries limit 1
-- select query_id, count(1) as count FROM query_execution where planning > 500 GROUP by query_id
-- select distinct lang_driver from query_execution where query_id in (55,58,59)
select  lang_driver, count(1) as count 
from query_execution 
where failed=1  and planning > 0 
group by lang_driver

select  query_id, lang_driver, count(1) as count 
from query_execution 
where failed=1  and planning > 0 
group by lang_driver

select  query_id, lang_driver, count(1) as count 
from query_execution 
group by query_id, lang_driver

select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as queries  
from query_execution where planning > 0 group by  server, time --order by queries desc

-- "for each server, what language drivers were used and counts of queries that both used and not used planning time"
SELECT server, lang_driver, hasPlanning, count(1) as count 
FROM (
  select  server, lang_driver, 
    case planning when  0 THEN 0 ELSE 1 END as hasPlanning 
  from query_execution 
) GROUP by server, lang_driver, hasPlanning

-- "for each query that has run >1000x, get count, min/max/avg elapsed times, avag planning"
select query_id, 
  count(1) as count, 
  min(elapsedtimems) as minTime, 
  max(elapsedtimems) as maxTime, 
  avg(elapsedtimems) as avg, 
  avg(planning) as planavg  
from query_execution 
GROUP by query_id 
having count > 1000

-- avg number of queries per second (num queries / duration of time window)
SELECT count(1) / ((max(start_timeStamp)-min(start_timeStamp)) / 1000)  
from query_execution

-- same, but for each server
SELECT server, count(1)/((max(start_timeStamp)-min(start_timeStamp))/1000) as qsPerSec 
from query_execution 
group by server

-- "get query ids with outlier long times through percent ranks at the 90th+ percentile
-- then calc min, max and average elapsed times for each query within this window
SELECT query_id, min(elapsedTimeMs) as minTime, max(elapsedTimeMs) as maxTime, avg(elapsedTimeMs) as avgTime
FROM (
  SELECT query_id, elapsedTimeMs, SizePercentRank
  FROM (
    SELECT    
      query_id,
      elapsedTimeMs,
      PERCENT_RANK() OVER( 
        PARTITION BY query_id
        ORDER BY elapsedTimeMs 
      ) SizePercentRank
    FROM query_execution
  ) WHERE SizePercentRank > 0.89
) GROUP BY query_id





SELECT server, min(totalTime), max(totalTime), avg(totalTime) FROM (
SELECT server, start_timeStamp, sum(elapsedtimems) as totalTime from query_execution GROUP by server, start_timeStamp
) GROUP by server


--         MATCH (s:Student{id: $studentId})
--         MATCH (a:Assessment{id: $assessmentId})<-[:OF_CONTEXT]-(ac:AssignedContext)-[:ASSIGNED_TO]->(s)
--         OPTIONAL MATCH (s)-[:HAS]->(sab:StudentAbility{period: "CURRENT"})-[:IN]->(ac)
--         RETURN sab

--  MATCH (s:Student{id: '75daf0d0-ef24-42d8-ac2c-bc080ec47c41'})
--         MATCH (a:Assessment{id: 'b7602c75-64e8-4791-b0b1-1236eff17b08'})<-[:OF_CONTEXT]-(ac:AssignedContext)-[:ASSIGNED_TO]->(s)
--         OPTIONAL MATCH (s)-[:HAS]->(sab:StudentAbility{period: "CURRENT"})-[:IN]->(ac)
--         RETURN sab

		aid	
		sid 75daf0d0-ef24-42d8-ac2c-bc080ec47c41

=INDEX(Sheet2!$B$2:$E$874,MATCH(A2,Sheet2!$A$2:$A$874,0),1)
-- Script to match excel data from another sheet.


SELECT server, DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, sum(elapsedtimems) as totalTime from query_execution GROUP by server, start_timeStamp
SELECT server, DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, sum(elapsedtimems) as totalTime from query_execution GROUP by server, start_timeStamp having totalTime > 2000

select strftime('%s','2024-02-22 20:35:57') 

-- percentile below and above 90 
SELECT lower90.query_id as query_id, minTime_lower90, maxTime_lower90, avgTime_lower90, count_lower90, minTime_upper90, maxTime_upper90, avgTime_upper90, count_upper90
FROM 
  (
    SELECT 
      query_id, 
      min(elapsedTimeMs) as minTime_lower90, 
      max(elapsedTimeMs) as maxTime_lower90, 
      avg(elapsedTimeMs) as avgTime_lower90, 
      count(1) as count_lower90
    FROM (
        SELECT query_id, elapsedTimeMs, SizePercentRank
        FROM (
          SELECT
            query_id,
            elapsedTimeMs,
            PERCENT_RANK() OVER( 
              PARTITION BY query_id
              ORDER BY elapsedTimeMs ASC
            ) SizePercentRank
        FROM
        query_execution
      ) WHERE SizePercentRank < 0.9
    ) GROUP BY query_id 
  ) lower90,
  (
    SELECT 
      query_id, 
      min(elapsedTimeMs) as minTime_upper90, 
      max(elapsedTimeMs) as maxTime_upper90, 
      avg(elapsedTimeMs) as avgTime_upper90, count(1) as count_upper90
    FROM (
        SELECT query_id, elapsedTimeMs, SizePercentRank
        FROM (
          SELECT
            query_id,
            elapsedTimeMs,
            PERCENT_RANK() OVER( 
              PARTITION BY query_id
              ORDER BY elapsedTimeMs ASC
            ) SizePercentRank
        FROM
        query_execution
      ) WHERE SizePercentRank >=0.9
    ) GROUP BY query_id 
  ) as upper90
WHERE lower90.query_id=upper90.query_id

SELECT time, count(server) as server_count FROM (
select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as queries from query_execution group by time, server
) WHERE server != 'var/run/neo4j/maintenance.sock>' group by time having server_count > 3

SELECT time, count(server) as server_count FROM (
select DATETIME(start_timeStamp/1000, 'unixepoch' ) as time, server, count(1) as queries from query_execution group by time, server
) WHERE server != 'var/run/neo4j/maintenance.sock>' group by time having server_count > 3

SELECT count*.10/(last-first) from ( 
select count(1) as count, min(start_timeStamp)/1000 as first, max(start_timeStamp)/1000 as last from query_execution
)

SELECT (select count(1) from query_execution where planning > 0 ) *100.0/ (select count(1) from query_execution) as planPercent

SELECT  sum(planning) *100.0/  sum(elapsedTimeMs)  as planPercent from query_execution  


SELECT (
  select sum(planning) 
  from query_execution
) *100.0/ (
  select sum(elapsedTimeMs) 
  from query_execution
) as planPercent


SELECT lower90.query_id as query_id, minTime_lower90, maxTime_lower90, avgTime_lower90, count_lower90, minTime_upper90, maxTime_upper90, avgTime_upper90, count_upper90
FROM 
( SELECT query_id, min(elapsedTimeMs) as minTime_lower90, max(elapsedTimeMs) as maxTime_lower90, avg(elapsedTimeMs) as avgTime_lower90, count(1) as count_lower90
FROM (
		SELECT query_id, elapsedTimeMs, SizePercentRank
		FROM (
			SELECT
				query_id,
				elapsedTimeMs,
				PERCENT_RANK() OVER( 
					PARTITION BY query_id
					ORDER BY elapsedTimeMs ASC
				) SizePercentRank
		FROM
		query_execution
	) WHERE SizePercentRank < 0.9
) GROUP BY query_id ) lower90
LEFT JOIN (SELECT query_id, min(elapsedTimeMs) as minTime_upper90, max(elapsedTimeMs) as maxTime_upper90, avg(elapsedTimeMs) as avgTime_upper90, count(1) as count_upper90
FROM (
		SELECT query_id, elapsedTimeMs, SizePercentRank
		FROM (
			SELECT
				query_id,
				elapsedTimeMs,
				PERCENT_RANK() OVER( 
					PARTITION BY query_id
					ORDER BY elapsedTimeMs ASC
				) SizePercentRank
		FROM
		query_execution
	) WHERE SizePercentRank >=0.9
) GROUP BY query_id ) upper90 ON lower90.query_id=upper90.query_id

------------------------
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


