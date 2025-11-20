package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

type SnsMessage struct {
	Type         string `json:"Type"`
	MessageId    string `json:"MessageId"`
	Token        string `json:"Token"`
	TopicArn     string `json:"TopicArn"`
	Message      string `json:"Message"`
	SubscribeURL string `json:"SubscribeURL"`
}

func main() {
	http.HandleFunc("/sns", func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "erro lendo body", http.StatusBadRequest)
			return
		}

		var msg SnsMessage
		if err := json.Unmarshal(body, &msg); err != nil {
			log.Println("Erro ao fazer parse do JSON:", err)
			log.Println("Body recebido:", string(body))
			w.WriteHeader(http.StatusOK)
			return
		}

		if msg.Type == "SubscriptionConfirmation" {
			log.Println("Recebeu SubscriptionConfirmation. Confirmando...")

			_, err := http.Get(msg.SubscribeURL)
			if err != nil {
				log.Println("Erro ao confirmar assinatura:", err)
			} else {
				log.Println("Assinatura confirmada com sucesso!")
			}

			w.WriteHeader(http.StatusOK)
			return
		}

		if msg.Type == "Notification" {
			log.Println("Mensagem:", msg.Message)
		}

		w.WriteHeader(http.StatusOK)
	})

	log.Println("Servidor SNS Fake Subscriber rodando em :4000")
	log.Fatal(http.ListenAndServe(":4000", nil))
}
