Prerequisite:
- docker
- docker-compose

Set up:
- create docker network:
docker network create localnetwork

Start up:

- Start infrastructures (mongodb and minio):
docker-compose -f docker-compose.infras.yml up --build --force-recreate

* minio:
  endpoint: http://localhost:9000/minio/
  credential: please refer docker-compose.infras.yml (MINIO_ACCESS_KEY and MINIO_SECRET_KEY)
* mongodb 
  url: mongodb://root:root@localhost:27017/
  
- Start backend service:
docker-compose -f docker-compose.yml up --build --force-recreate

Stop instances:
- Stop infrastructures (mongodb and minio):
docker-compose -f docker-compose.infras.yml down 
- Start backend service:
docker-compose -f docker-compose.yml down

* After stopping infrastructure, if you want to make change such as credential of minio or mongodb, please remove their volume
docker volume rm sample-project-backend_minio_data
docker volume rm sample-project-backend_mongodb_data
