# Simple Node.js/Postgres backend

- Typesript
- Postgres - no ORM; runs inside Docker container, data is not persisted
- vanilla Node.js - no frameworks

## To build and run the app locally
```
$ npm install
$ npm run start-db-container # start the Docker container with the Postgres db
$ npm run create-db-schema # create the database and initialize schema
$ npm start # build the app, run it locally
$ npm test # run unit tests
```

## To run the tests
```
$ npm test
```

## Using the API with httpie
- once db container and app are running locally:
```
$ echo '{"title": "task 1"}' | http POST :8000/tasks # create a task
$ echo '{"title": "task 1 - updated"}' | http PUT :8000/tasks # update a task
$ echo '{"title": "task 2"}' | http POST :8000/tasks
$ echo '{"title": "task 3"}' | http POST :8000/tasks
$ http :8000/tasks # get all tasks
$ echo '{"title": "a list"}' | http POST :8000/lists # create a list
$ echo '{"add": [1,2]}' | http PUT :8000/lists/1 # add items to a list
$ http :8000/lists # get all lists - but not their tasks
$ http :8000/lists/1 # get list 1 (title) and all tasks in it
$ echo '{"remove": [2]}' | http PUT :8000/lists/1 # remove items from a list
$ echo '{"setTitle": "an updated list"}' | http PUT :8000/lists/1 # change list title
```

## Cleanup
```
$ npm run rm-db # force stopping and deleting the db container
```
