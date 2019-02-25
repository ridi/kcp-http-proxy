test:
	docker-compose -f docker-compose.test.yml up
	docker stop ridi_kcp_test | xargs docker rm