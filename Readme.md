# Clever sample project - Backend
## Installation guide


### Prerequisite:
- docker
- docker-compose


### Set up:
- create docker network:

  `docker network create localnetwork`

### Start up:

- Start infrastructures (mongodb and minio):

  `docker-compose -f docker-compose.infras.yml up --build --force-recreate`

  * minio:
    * endpoint: http://localhost:9000/minio/
    * credential: please refer docker-compose.infras.yml (MINIO_ACCESS_KEY and MINIO_SECRET_KEY)
  * mongodb 
    * url: mongodb://root:root@localhost:27017/
  
- Start backend service:

   `docker-compose -f docker-compose.yml up --build --force-recreate`

### Stop instances:
- Stop infrastructures (mongodb and minio):

  `docker-compose -f docker-compose.infras.yml down` 
- stop backend service:

  `docker-compose -f docker-compose.yml down`

* After stopping infrastructure, if you want to make change such as credential of minio or mongodb, please remove their volume

  `docker volume rm sample-project-backend_minio_data`

  `docker volume rm sample-project-backend_mongodb_data`

### Run from CLI
- To run backend service from CLI:
    * Turn on mongodb and minio using docker-compose
    * Run mongo-db migration:
      
      `npm run migrate-mongo:local`
    * Turn on backend service:
    
      `npm run start:local`
      
### DB Restoration
   - To enable DB (mongodb) restoration, backend service use a middleware (mutationRecording.js)to record every mutation sent to it along with the result of the mutation and send a mutation record to minio.
   - DB restoration requires creating a new DB (named simple_db_backup), using a script in package.json: migrate-mongo:localbackup
   - After creating the backup db, the restoration process will be started with a script in package.json: utils:restoredb (utils/dbrestoration/restoreDb.js). To restore db from mutation, all file from minio will be read and parsed to create mutation input for graphql resolver, this will protect any logic of backend service that turns the input to the db documents.  
   - To use the restoration db, there're many ways, but to simplify the example, please configure MONGODB_URL to point to the restoration db.
   - Known issue:
     * Using winston rotation event to send mutation to minio: one latest mutation will not be in minio, until another rotation event occurs.
     * Restoration logic are not versioned, which means the restoration process always uses the latest logic in backend service. Eg. in commit number 1, the mutation should success and insert into db new record, but in commit number 2, the mutation will fail and the record will not be inserted into db.
