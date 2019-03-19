test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker-compose -f docker-compose.test.yml down
	docker rm test_ridi_kcp_http_proxy
	docker rm test_rici_kcp_http_proxy_db