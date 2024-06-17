import logging as logger
import os
import sqlite3
import time

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

from .util import queries as q

formatter = logger.Formatter("%(asctime)s %(levelname)s (:%(lineno)d)  %(message)s")
logger.basicConfig(
    format="%(asctime)s %(levelname)s (line:%(lineno)d)  %(message)s",
    level=getattr(settings, "LOG_LEVEL", logger.DEBUG),
)


class ApiMetadataView(APIView):
    def get(self, request):
        Response({"data": "stuff"}, status=status.HTTP_200_OK)

class ReadSQLiteView(APIView):
    def get(self, request, endpoint, optional_param=None):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        logger.debug(f"dirpath = {dir_path}")
        logger.debug(f"filename= {endpoint}")

        if endpoint not in q.ENDPOINT_QUERY_DICT:
            msg = f'The requested endpoint "{endpoint}" is not handled'
            print(msg)
            return Response({"error": msg}, status=status.HTTP_404_NOT_FOUND)
        query = q.ENDPOINT_QUERY_DICT[endpoint]
        params = {}
        if endpoint == "getquerytext":
            params["query_id"] = optional_param

        query = query.replace("%LIMIT%", str(10))

        # fp = os.path.join(dir_path, "..", "..", filename)
        fp = "/Users/henrylin/dev/query-proc-db-analysis/query_db2.db"
        if not os.path.isfile(fp):
            print("The specified database path does not exist.")
            return Response(
                {"error": f"{fp} not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            conn = sqlite3.connect(fp)
            cursor = conn.cursor()

            start = time.time()

            # cursor.execute(QUERY_COUNT)
            # logger.debug(f"query={query}")
            logger.debug("Executing...")
            cursor.execute(query, params)
            logger.debug(f"execute took {time.time() - start:.3f}")

            headers = [x[0] for x in cursor.description]
            start = time.time()
            rows = cursor.fetchall()
            logger.debug(f"fetchall took {time.time() - start:.3f}")

            # Close the connection
            start = time.time()
            conn.close()
            logger.debug(f"close connection took {time.time() - start:.3f}")

            data = {"headers": headers, "rows": rows}
            start = time.time()
            ret = Response({"data": data}, status=status.HTTP_200_OK)
            logger.debug(f"Creating Response took {time.time() - start:.3f}")
            return ret
        except sqlite3.Error as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReadDb(viewsets.ModelViewSet):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    print(f"Dirpath is {dir_path}")


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    print("hello in users", os.getcwd())
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
    print("hello in groups")