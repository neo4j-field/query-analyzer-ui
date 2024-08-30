export const API_URIS = {
  SQLITE_ROOT: {
    rootName: "read-sqlite",
    QUERY_LONGEST_QUERIES: "longestavgqueries",
    QUERY_ALL_TIMESTAMPS: "allqueriestimes",
    QUERY_COUNT: "querycount",
    QUERY_PERCENTILE: "querypercentile",
    QUERY_GET_QUERY_TEXT: "getquerytext",
    QUERY_QUERY_COUNT_BY_SERVER: "getquerycountbyserver",
    QUERY_TIME_QUERY_COUNT: "timequerycount",
    QUERY_TIME_PAGE_FAULTS_COUNT: "timepagefaultscount",
    QUERY_TIME_PAGE_HITS_COUNT: "timepagehitscount",
    QUERY_TIME_ELAPSED_TIME_COUNT: "timeelapsedtimecount",
    QUERY_TIME_PLANNING_COUNT: "timeplanningcount",
    QUERY_GET_PLANNING_PCT: "planningpercent",
    QUERY_COUNT_UNIQUE_QUERIES: "countuniquequeries",
    QUERY_GENERAL_STATS: "generalstats",
    QUERY_TOP5_PAGE_HITS: "pageHits",
    QUERY_TOP5_QUERIES_EXECUTED: "queriesexecuted",
    QUERY_TOP5_PAGE_FAULTS: "pageFaults",
    QUERY_TOP5_ELAPSED_TIME: "elapsedTime",
  },
  API_METADATA_ROOT: {
    rootName: "apimetadata",
    DB_LIST: "dblist",
  },
}

// RESULT KEYS
export const AVG_TIME_LOWER_90 = "avgTime_L90"
export const AVG_TIME_UPPER_90 = "avgTime_U90"
export const AVG_HITS_LOWER_90 = "avgHits_L90"
export const AVG_HITS_UPPER_90 = "avgHits_U90"
