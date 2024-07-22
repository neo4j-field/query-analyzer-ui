import logging as logger
import os
import sqlite3
import time
import traceback

from django.conf import settings
from django.contrib.auth.models import Group, User

# from django.views.decorators.csrf import csrf_exempt
# from django.utils.decorators import method_decorator
from query_proc_api.serializers import (
    GroupSerializer,
    UserSerializer,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import permissions, viewsets, status

from .util import queries as Q

formatter = logger.Formatter("%(asctime)s %(levelname)s (:%(lineno)d)  %(message)s")
logger.basicConfig(
    format="%(asctime)s %(levelname)s (line:%(lineno)d)  %(message)s",
    level=getattr(settings, "LOG_LEVEL", logger.DEBUG),
)

DATABASE_DIRPATH = os.path.join(
    os.path.dirname(os.path.realpath(__file__)),
    "..",
    "..",
    "..",
    os.environ["DATABASE_DIRNAME"],
)

CACHE_SIZE = 10000
PAGE_SIZE = 4096
JOURNAL_MODE = "wal"


class ApiMetadataView(APIView):
    def get(self, request, endpoint):
        Response({"data": "stuff"}, status=status.HTTP_200_OK)
        if endpoint == "dblist":
            logger.debug(f'dblist at "{DATABASE_DIRPATH}"')
            return Response(
                {
                    "data": {
                        "dbDirectory": os.path.abspath(DATABASE_DIRPATH),
                        "dbList": [
                            x
                            for x in next(os.walk(DATABASE_DIRPATH))[2]
                            if x != ".DS_Store"
                        ],
                    }
                }
            )


class ReadSQLiteView(APIView):
    def get(self, request, endpoint, optional_param=None):
        # logger.debug(request)
        if endpoint not in Q.ENDPOINT_QUERY_DICT:
            msg = f'The requested endpoint "{endpoint}" is not handled'
            print(msg)
            return Response({"error": msg}, status=status.HTTP_404_NOT_FOUND)
        query = Q.ENDPOINT_QUERY_DICT[endpoint]
        params = {}
        if endpoint == "getquerytext":
            params["query_id"] = optional_param

        #
        # URL PARAMETERS
        #

        try:
            db_file_name = request.GET.get("dbname")
        except:
            db_file_name = None
        if db_file_name is None:
            msg = 'db_file_name "{db_file_name}" is invalid'
            print(msg)
            return Response({"error": msg}, status=status.HTTP_404_NOT_FOUND)

        try:
            limit = request.GET.get("limit")
        except:
            limit = 10
        if limit is None:
            limit = 10
        query = query.replace("%LIMIT%", str(limit))

        #
        # db paths
        #
        fp = os.path.join(DATABASE_DIRPATH, db_file_name)
        if not os.path.isfile(fp):
            print(f'The specified database path "{fp}" does not exist.')
            return Response(
                {"error": f"{fp} not found"}, status=status.HTTP_404_NOT_FOUND
            )

        #
        # QUERY DATABASE
        #
        try:
            conn = sqlite3.connect(fp)
            cursor = conn.cursor()

            for pragma_qry, targ_val in [
                ("PRAGMA cache_size", CACHE_SIZE),
                ("PRAGMA page_size", PAGE_SIZE),
                ("PRAGMA journal_mode", JOURNAL_MODE),
            ]:
                execute_query(cursor, pragma_qry)
                curr = cursor.fetchall()[0][0]
                if curr != targ_val:
                    execute_query(cursor, f"{pragma_qry} = {targ_val}")

            start = time.time()
            execute_query(cursor, query, params)
            logger.debug(f"...took {time.time() - start:.3f}")

            headers = [x[0] for x in cursor.description]
            start = time.time()
            rows = cursor.fetchall()
            logger.debug(f"fetchall took {time.time() - start:.3f}")

            data = {"headers": headers, "rows": rows}
            start = time.time()
            logger.debug("Creating Response object...")
            ret = Response({"data": data}, status=status.HTTP_200_OK)
            logger.debug(f"...took {time.time() - start:.3f}")
            return ret
        except sqlite3.Error as e:
            errorMsg = str(e)
            logger.error(f"sqlite3.Error: {errorMsg}")
            traceback.format_exc()
            return Response({"error": errorMsg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            errorMsg = str(e)
            e.with_traceback()
            logger.error(f"Exception: {errorMsg}")
            traceback.format_exc()
            return Response(
                {"error": errorMsg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def execute_query(cursor, query, params={}):
    # logger.debug(f"params={params}")
    # logger.debug(f"query={query}")
    logger.debug("Executing query...")
    cursor.execute(query, params)


class ReadDb(viewsets.ModelViewSet):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    print(f"Dirpath is {dir_path}")


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
