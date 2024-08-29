package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
)

type Response struct {
	IsEven bool `json:"is_even"`
}

var PORT = os.Getenv("PORT")

func isEvenHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	numberStr := r.URL.Query().Get("number")
	if numberStr == "" {
		http.Error(w, "Missing 'number' query parameter", http.StatusBadRequest)
		return
	}

	number, err := strconv.Atoi(numberStr)
	if err != nil {
		http.Error(w, "Invalid number", http.StatusBadRequest)
		return
	}

	isEven := number%2 == 0
	response := Response{IsEven: isEven}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {

	if PORT == "" {
		fmt.Println("PORT is not set, using default port 8080")
		PORT = ":8080"
	} else if PORT[0] != ':' {
		PORT = ":" + PORT
	}

	http.HandleFunc("/iseven", isEvenHandler)
	err := http.ListenAndServe(PORT, nil)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
