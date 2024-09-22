FROM golang:1.22
ENV ROOT=/go/src/app
RUN mkdir ${ROOT}
WORKDIR ${ROOT}

# golang init
COPY app/backend ${ROOT}
RUN go mod tidy
RUN ls -l
WORKDIR ${ROOT}/cmd/app
RUN CGO_ENABLED=0 GOOS=linux go build -o ${ROOT}/binary

EXPOSE 8080

CMD ["/go/src/app/binary"]
