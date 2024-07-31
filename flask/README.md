## Requirements
python3.11

## Install
```bash
python -m venv .venv
source .venv/bin/activate
(.venv) python -m pip install -r requirements.txt
```

* Create `.env` file based from `.env.template`

* Set the `DATABASE_DIRNAME` in `views.py` to name of directory in the project root folder (eg alongside `ui` and `backend`) where you will store your sqlite3 files. TODO will be updated.

## Start
```bash
./start.sh
```