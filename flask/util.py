import os
import time
from typing import Any

import dotenv

dotenv.load_dotenv()
from openai import OpenAI
import tiktoken


MAX_TOKENS = int(os.environ["MAX_TOKENS"])

DB_SCHEMA = """CREATE TABLE annotation_params (
  id INTEGER PRIMARY KEY,
  params varchar(1000),
  UNIQUE(params)
)
CREATE TABLE graphql_queries (
  id INTEGER PRIMARY KEY,
  app varchar(40),
  query varchar(4000) NOT NULL,
  UNIQUE(query, app)
)
CREATE TABLE queries (
  id INTEGER PRIMARY KEY,
  query varchar(4000) NOT NULL,
  runtime varchar(20) ,
  write_query INTEGER,
  UNIQUE(query,runtime)
)
CREATE TABLE query_annotation (
  graphql_query_id INTEGER,
  query_id INTEGER,
  annotation_params_id INTEGER,
  PRIMARY KEY(graphql_query_id,query_id,annotation_params_id),
  FOREIGN KEY (query_id) REFERENCES queries (id),
  FOREIGN KEY (graphql_query_id) REFERENCES graphql_queries (id),
  FOREIGN KEY (annotation_params_id) REFERENCES annotation_params (id)
)
CREATE TABLE query_execution (
  db_query_id INTEGER NOT NULL,
  db_transaction_id INTEGER NOT NULL,
  query_id INTEGER,
  database varchar(100),
  db_id varchar(20),
  authenticatedUser varchar(100),
  executedUser varchar(100),
  elapsedTimeMs INTEGER,
  pageFaults INTEGER,
  pageHits INTEGER,
  planning INTEGER,
  waiting INTEGER,
  start_timeStamp DATETIME,
  end_timeStamp DATETIME,
  allocatedBytes INTEGER,
  client varchar(200),
  server varchar(200),
  failed INTEGER,
  stacktrace varchar(4000),
  lang_driver varchar(100),
  driver_version varchar(100),
  query_type INTEGER,
  PRIMARY KEY(db_query_id,db_transaction_id),
  FOREIGN KEY (query_id) REFERENCES queries (id)
    ON DELETE CASCADE ON UPDATE NO ACTION
)"""


def num_tokens_from_string(string: str) -> int:
    """Returns the number of tokens in a text string."""
    encoding = tiktoken.get_encoding(os.environ["OPENAI_ENCODING"])
    return len(encoding.encode(string))


def header_rows_to_csv_string(headers: list[str], rows: list[list[Any]]):
    s = ",".join(headers)
    for row in rows:
        s += "\n" + ",".join([f"{x}" for x in row])
    return s


def format_seconds(seconds):
    if seconds < 0:
        raise ValueError("Seconds cannot be negative")

    # Round seconds to the nearest integer
    seconds = round(seconds)

    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    remaining_seconds = seconds % 60

    if hours > 0:
        return f"{hours}:{minutes:02d}:{remaining_seconds:02d}"
    else:
        return f"{minutes}:{remaining_seconds:02d}"


def openai_percentile_question(
    openai_client: OpenAI, headers: list[str], rows: list[list[Any]]
) -> str:
    csv_str = header_rows_to_csv_string(headers, rows)

    question = f"""
    Given this csv, what are some key things you notice, like outliers? What SQL queries do you recommend me to run to find more about outliers and anything else you think important?

    {csv_str}
    """

    num_tokens = num_tokens_from_string(question)
    if num_tokens > MAX_TOKENS:
        exit(f"Exiting - exceeds {MAX_TOKENS}")

    question_lines = question.split("\n")
    if len(question_lines) > 10:
        to_print = "\n".join(question_lines[:15]) + "\n....."
    else:
        to_print = question

    print(f"Asking openai question ({num_tokens} tokens)...")
    start = time.time()
    completion = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"You are an SQL expert assistant. Please be consise and assume I have a relatively advanced knowldge of sql. Here is the schema you should use for all questions: \n{DB_SCHEMA}\n.",
            },
            {
                "role": "user",
                "content": question,
            },
        ],
    )
    print(f"... took {time.time() - start:.3f} seconds")
    time.sleep(1)

    content = completion.choices[0].message.content
    # print(f"\n{content}")
    return content if content else "No response from OpenAI"
