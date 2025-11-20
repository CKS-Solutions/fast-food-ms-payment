.PHONY: build clean deploy gomodgen

define FN_MAP
generatePayment=cmd/generate_payment_lambda/main.go
checkPaymentStatus=cmd/check_payment_status_lambda/main.go
webhookOrchestratorMP=cmd/webhook_orchestrator_mp_lambda/main.go
updatePaymentStatus=cmd/update_payment_status_lambda/main.go
endef
export FN_MAP

clean:
	rm -rf ./bin ./vendor go.sum

install:
	go mod tidy

build:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/generatePayment cmd/generate_payment_lambda/main.go
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/checkPaymentStatus cmd/check_payment_status_lambda/main.go
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/webhookOrchestratorMP cmd/webhook_orchestrator_mp_lambda/main.go
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/updatePaymentStatus cmd/update_payment_status_lambda/main.go

build-fn:
	@if [ -z "$(FN)" ]; then \
		echo "❌ ERRO: informe a função via FN=<nome>"; exit 1; \
	fi

	$(eval MAIN_GO := $(word 2, $(subst =, ,$(filter $(FN)=%, $(FN_MAP)))))

	@if [ -z "$(MAIN_GO)" ]; then \
		echo "❌ Função '$(FN)' não encontrada no FN_MAP"; exit 1; \
	fi

	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o bin/$(FN) $(MAIN_GO)

	@echo "✔ Função '$(FN)' compilada com sucesso!"

deploy: clean install build
	sls deploy --verbose

deploy-local: clean install build
	sls deploy --verbose --stage local

deploy-fn: build-fn
	sls deploy function --function $(FN)

deploy-fn-local: build-fn
	sls deploy function --function $(FN) --stage local

remove-local:
	sls remove --stage local

gomodgen:
	chmod u+x gomod.sh
	./gomod.sh