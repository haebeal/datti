package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type LendingEventRepositoryImpl struct {
	queries *postgres.Queries
}

func NewLendingEventRepository(queries *postgres.Queries) *LendingEventRepositoryImpl {
	return &LendingEventRepositoryImpl{
		queries: queries,
	}
}

func (lr *LendingEventRepositoryImpl) Create(ctx context.Context, e *domain.Lending) error {
	_, span := tracer.Start(ctx, "lendingEvent.Create")
	defer span.End()

	err := lr.queries.CreateEvent(ctx, postgres.CreateEventParams{
		ID:        e.ID().String(),
		Amount:    int32(e.Amount().Value()),
		Name:      e.Name(),
		EventDate: e.EventDate(),
		CreatedAt: e.CreatedAt(),
		UpdatedAt: e.UpdatedAt(),
	})

	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

func (lr *LendingEventRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (*domain.Lending, error) {
	ctx, span := tracer.Start(ctx, "lendingEvent.FindByID")
	defer span.End()

	_, querySpan := tracer.Start(ctx, "SELECT * FROM events WHERE id = $1 LIMIT 1")
	event, err := lr.queries.FindEventById(ctx, id.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	eventID, err := ulid.Parse(event.ID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	amount, err := domain.NewAmount(int64(event.Amount))
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	lendingEvent, err := domain.NewLending(eventID, event.Name, amount, event.EventDate, event.CreatedAt, event.UpdatedAt)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return lendingEvent, nil
}

func (lr *LendingEventRepositoryImpl) FindByUserID(ctx context.Context, id uuid.UUID) (*[]domain.Lending, error) {
	lendingEvents, err := lr.queries.FindLendingsByUserId(ctx, id)
	if err != nil {
		return nil, err
	}

	lendings := []domain.Lending{}
	for _, l := range lendingEvents {
		eventID, err := ulid.Parse(l.ID)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(int64(l.Amount))
		if err != nil {
			return nil, err
		}
		lending, err := domain.NewLending(eventID, l.Name, amount, l.EventDate, l.CreatedAt, l.UpdatedAt)
		if err != nil {
			return nil, err
		}
		lendings = append(lendings, *lending)
	}

	return &lendings, nil
}
