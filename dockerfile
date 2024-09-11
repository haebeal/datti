FROM golang:1.22
ENV ROOT=/go/src/app
RUN mkdir ${ROOT}
WORKDIR ${ROOT}

# golang init
COPY go.mod go.sum ./
COPY . .
RUN go mod tidy
RUN ls -l
WORKDIR ${ROOT}/cmd
RUN CGO_ENABLED=0 GOOS=linux go build -o $ROOT/binary

EXPOSE 8080

CMD ["/go/src/app/binary"]
