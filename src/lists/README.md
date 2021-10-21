# lists

Create, update, read and delete task lists.

POST /lists - create
GET /lists - get all lists (title and id)
GET /tasks/:id - get list, and associated tasks
PUT /tasks/:id - update list; request body must be JSON with taskIds to be added ('{"add": [1,2], "remove": [3]}')
DELETE /tasks/:id - delete list
