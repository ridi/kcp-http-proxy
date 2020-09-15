[![CI](https://github.com/ridi/kcp-http-proxy/workflows/CI/badge.svg?branch=master)](https://github.com/ridi/kcp-http-proxy/actions?query=workflow%3ACI+branch%3Amaster) [![codecov](https://codecov.io/gh/ridi/kcp-http-proxy/branch/master/graph/badge.svg)](https://codecov.io/gh/ridi/kcp-http-proxy)

## Requirements
- [Yarn](https://yarnpkg.com/en/docs/install#mac-stable)
- [Docker](https://store.docker.com/editions/community/docker-ce-desktop-mac)

## Getting Started
#### 1. Make
```shell
make dev
```

#### 2. Build docker containers
```shell
docker-compose up [--build] 
```

## Run Test
```shell
make test
```

## [API Document](https://ridi.github.io/kcp-http-proxy/)

### Create Document
```shell
make docs
```
