FROM golang:1.21-alpine as builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.* ./
RUN go mod download
COPY . ./
RUN go build -v -o server

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/server /app/server
ENV PORT 8080
EXPOSE $PORT:8080

CMD ["/app/server"]
