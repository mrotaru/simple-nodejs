CREATE DATABASE organiser;

\c organiser;

CREATE TABLE IF NOT EXISTS tasks (
  id serial PRIMARY KEY,
  updatedAt TIMESTAMP,
  title TEXT
);

CREATE TABLE IF NOT EXISTS lists (
  id serial PRIMARY KEY,
  updatedAt TIMESTAMP,
  title TEXT
);

CREATE TABLE IF NOT EXISTS tasksLists (
  taskId INTEGER REFERENCES tasks (id),
  listId INTEGER REFERENCES lists (id)
);
