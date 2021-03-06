dev:
	yarn install --frozen-lockfile
	yarn run build

test:
	docker-compose -f docker-compose.test.yml up --build --exit-code-from app
	docker-compose -f docker-compose.test.yml down

docs:
	yarn run docs

build:
	GIT_REVISION=${GIT_REVISION} docker-compose -f docker-compose.prod.yml build
	docker push 023315198496.dkr.ecr.ap-northeast-2.amazonaws.com/ridi/kcp-http-proxy:${GIT_REVISION}
	
deploy:
	ecs-cli configure --region ap-northeast-2 --cluster kcp-http-proxy-${APP_ENV} --default-launch-type FARGATE
	APP_ENV=${APP_ENV} \
	GIT_REVISION=${GIT_REVISION} \
	AP_NORTHEAST_2A_PRIVATE_SUBNET_ID=${AP_NORTHEAST_2A_PRIVATE_SUBNET_ID} \
	AP_NORTHEAST_2C_PRIVATE_SUBNET_ID=${AP_NORTHEAST_2C_PRIVATE_SUBNET_ID} \
	SECURITY_GROUP_ID=${SECURITY_GROUP_ID} \
	ecs-cli compose --project-name kcp-http-proxy-api -f docker-compose.prod.yml service up \
	--force-deployment \
	--target-group-arn ${TARGET_GROUP_ARN} \
	--container-name app \
	--container-port 80