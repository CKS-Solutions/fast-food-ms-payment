.PHONY: build clean deploy gomodgen

build: gomodgen
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w -extldflags '-static'" -o bin/generate_payment cmd/generate_payment_lambda/main.go

clean:
	rm -rf ./bin ./vendor go.sum

deploy: clean install build
	sls deploy --verbose

deploy-local: clean install build
	sls deploy --verbose --stage local

remove-local:
	sls remove --stage local

gomodgen:
	chmod u+x gomod.sh
	./gomod.sh

install:
	go mod tidy