package domain

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("github.com/haebeal/datti/internal/domain")
