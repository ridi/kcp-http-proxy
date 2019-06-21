test:
	docker-compose -f docker-compose.test.yml up --exit-code-from application
	docker-compose -f docker-compose.test.yml down

docs:
	npm run docs

build:
	TAG=${TAG} docker-compose -f docker-compose.prod.yml build
	docker push 023315198496.dkr.ecr.ap-northeast-2.amazonaws.com/ridi/kcp-http-proxy:${TAG}
	
deploy:
	ecs-cli configure --region ap-northeast-2 --cluster kcp-http-proxy-${APP_ENV} --default-launch-type FARGATE
	APP_ENV=${APP_ENV} \
	TAG=${TAG} \
	AP_NORTHEAST_2A_PRIVATE_SUBNET_ID=${AP_NORTHEAST_2A_PRIVATE_SUBNET_ID} \
	AP_NORTHEAST_2C_PRIVATE_SUBNET_ID=${AP_NORTHEAST_2C_PRIVATE_SUBNET_ID} \
	SECURITY_GROUP_ID=${SECURITY_GROUP_ID} \
	ecs-cli compose -f docker-compose.prod.yml service up --force-deployment
