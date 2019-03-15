test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker-compose -f docker-compose.test.yml down