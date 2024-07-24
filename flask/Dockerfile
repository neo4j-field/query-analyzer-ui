FROM python:3.11-slim
WORKDIR /app
COPY *.py .
COPY .env .
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
# EXPOSE 5000
CMD ["python", "-m", "flask", "--app", "app", "run", "--port=8000", "--host=0.0.0.0"]