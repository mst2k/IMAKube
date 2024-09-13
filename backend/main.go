package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/generate-load", generateLoadHandler).Methods("GET")
	r.HandleFunc("/crash-backend", crashBackendHandler).Methods("GET")
	r.HandleFunc("/healthz", healthCheckHandler).Methods("GET")

	// Create a new CORS handler
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // Allow all origins
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"*"},
		// Enable Debugging for testing, consider disabling in production
		Debug: false,
	})

	// Wrap the router with the CORS handler
	handler := c.Handler(r)

	port := os.Getenv("PORT")
	if port == "" {
		fmt.Println("No PORT specified. Defaulting to 8080")
		port = "8080"
	}

	srv := &http.Server{
		Handler:      handler,
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Printf("Server is starting on port %s", port)
	log.Fatal(srv.ListenAndServe())
}

func generateLoadHandler(w http.ResponseWriter, r *http.Request) {
	nStr := r.URL.Query().Get("n")
	n, err := strconv.Atoi(nStr)
	if err != nil || n < 0 {
		http.Error(w, "Invalid input for n", http.StatusBadRequest)
		return
	}

	result := calculateFibonacci(n)
	fmt.Println(result)
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"result": %d}`, result)
}

func calculateFibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return calculateFibonacci(n-1) + calculateFibonacci(n-2)
}

func crashBackendHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "Backend will crash now"}`)
	
	// Flush the response to ensure it's sent before crashing
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	log.Println("Crashing backend as requested")
	go func() {
		time.Sleep(100 * time.Millisecond) // Small delay to ensure response is sent
		os.Exit(1)
	}()
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "OK")
}