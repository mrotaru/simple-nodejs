# Simple Node.js/Postgres backend

- Typesript
- Postgres - no ORM
- vanilla Node.js - no frameworks
- simple Docker compose setup - app and db

## To build and run the app locally
```
$ npm install
$ npm test # run unit tests
$ npm run start-db-container # start the Docker container with the Postgres db
$ npm run create-db-schema # create the database and initialize schema
$ npm start # build the app, run it locally
```

## Cleanup
```
$ npm run rm-db # force stopping and deleting the db container
```

## Other commands
```
$ npm start-db # start the Docker container with the Postgres database
$ npm reset-db # assumes db container is running; drops the "organizer" db and re-creates it from the ddl file
```

## To run the tests
```
$ npm test
```
