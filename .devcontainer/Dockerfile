FROM mcr.microsoft.com/devcontainers/go:1.24-bookworm

USER vscode

RUN go install github.com/air-verse/air@latest \
  && go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest \
  && go install github.com/go-task/task/v3/cmd/task@latest \
  && go install github.com/joho/godotenv/cmd/godotenv@latest \
  && go install github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen@latest
