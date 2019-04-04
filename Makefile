test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker stop test-app test-db | xargs docker rm
docs:
	npm run docs
deploy-build:
deploy: