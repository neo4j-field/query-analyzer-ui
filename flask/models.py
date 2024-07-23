from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String

Base = declarative_base()

class Query(Base):
    __tablename__ = 'queries'
    id = Column(Integer, primary_key=True)
    query = Column(String(100), nullable=False)
    runtime = Column(String(100), nullable=True)
    write_query = Column(Integer)

class QueryExecution(Base):
    __tablename__ = 'query_execution'
    db_query_id = Column(Integer, primary_key=True)
    db_transaction_id = Column(Integer, primary_key=True)
    server = Column(String(200), primary_key=True)
    query_id = Column(Integer)
    database = Column(String(100))
    db_id = Column(String(20))
    authenticatedUser = Column(String(100))
    executedUser = Column(String(100))
    elapsedTimeMs = Column(Integer)
    pageFaults = Column(Integer)
    pageHits = Column(Integer)
    planning = Column(Integer)
    waiting = Column(Integer)
    start_timeStamp = Column(Integer)   # using DateTime errors out, since values are currently stored as ints
    end_timeStamp = Column(Integer)   # using DateTime errors out, since values are currently stored as ints
    allocatedBytes = Column(Integer)
    client = Column(String(200))
    failed = Column(Integer)
    stacktrace = Column(String(4000))
    lang_driver = Column(String(100))
    driver_version = Column(String(100))
    query_type = Column(Integer)