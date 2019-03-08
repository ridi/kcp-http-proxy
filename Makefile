test:
	docker-compose -f docker-compose.test.yml up
	docker stop ridi_kcp_api | xargs docker rm