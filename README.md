# buzzforum

Installation instructions:

git clone

cd buzzforum/buzzfeed_forum

pip install -r requirements.txt

npm install

python manage.py makemigrations forum_app

python manage.py migrate

python manage.py runserver

Once it's up and running, you can find the forum welcome page at http://127.0.0.1:8000/ and the API root at http://127.0.0.1:8000/api/