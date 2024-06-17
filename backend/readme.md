## Requirements
python3.11

## To start
```bash
# create python venv environment
python -m venv .venv

# enter into it
source .venv/bin/activate

# install dependencies
(.venv) python -m pip install -r requirements.txt

# start server
(.venv) python api/manage.py runserver
```


```
source .venv/bin/activate

cd api
python manage.py runserver
```