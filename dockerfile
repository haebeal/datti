FROM golang:latest
ENV ROOT=/go/src/app
RUN mkdir ${ROOT}
WORKDIR ${ROOT}

# Shift timezone to Asia/Tokyo.
RUN apt-get update && apt install -y tzdata && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV TZ Asia/Tokyo

# golang init
COPY go.mod go.sum ./
COPY . .
RUN go mod tidy
RUN ls -l
WORKDIR ${ROOT}/cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o $ROOT/binary

EXPOSE 8080

CMD ["/go/src/app/binary"]