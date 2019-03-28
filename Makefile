test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker stop test_ridi_kcp_http_proxy test_ridi_kcp_http_proxy_db | xargs docker rm
docs:
	npm run docs
