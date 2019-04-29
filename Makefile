test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker-compose -f docker-compose.test.yml down

docs:
	npm run docs

build:
	GIT_REVISION=${GIT_REVISION} docker-compose -f ./config/ecs/api.yml build
	docker push <AWS_CONTAINER_REGISTRY>:${GIT_REVISION}

deploy: #Fargate Deployment