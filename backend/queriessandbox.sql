select query_id, avg(elapsedTimeMs), avg(pageHits), SizePercentRank
FROM (
  SELECT query_id,elapsedTimeMs, pageHits, SizePercentRank
  FROM (
    SELECT    
      query_id,
      elapsedTimeMs,
      pageHits,
      PERCENT_RANK() OVER( 
        PARTITION BY query_id
        ORDER BY elapsedTimeMs 
      ) SizePercentRank
    FROM query_execution
  ) 
  WHERE SizePercentRank < 0.9
)
GROUP BY query_id

  