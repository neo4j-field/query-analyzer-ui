# Query Analyzer Interface
## Dashboard and chart visualizations for the Query Analysis tool https://github.com/ravi-anthapu/Neo4jqueryprocessor by reading in the Sqlite files output from the tool.
![](/assets/1.png)
![](/assets/2.png)
* Simply choose a log database from the dropdown to view statistics of a Neo4j query log at its given time window, like the number of queries, estimated time taken, page hits and page faults.

### To build and run the application using Docker:
* Create a `databases` directory here (alongside `ui` and `backend`) and place your Query Analysis sqlite files.
* Run the below:
```sh
docker compose build
docker compose up -d
```

### To shutdown:
```sh
docker compose down
```

### For running in development, see the readme.md in `flask` and `ui`