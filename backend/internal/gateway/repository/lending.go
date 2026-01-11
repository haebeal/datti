package repository

import (
	"context"

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
		GroupID:   e.GroupID().String(),
		Name:      e.Name(),
		Amount:    int32(e.Amount().Value()),
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

	groupID, err := ulid.Parse(event.GroupID)
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

	lendingEvent, err := domain.NewLending(eventID, groupID, event.Name, amount, event.EventDate, event.CreatedAt, event.UpdatedAt)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return lendingEvent, nil
}

func (lr *LendingEventRepositoryImpl) FindByGroupIDAndUserID(ctx context.Context, groupID ulid.ULID, userID string) ([]*domain.Lending, error) {
	lendingEvents, err := lr.queries.FindLendingsByGroupIDAndUserID(ctx, postgres.FindLendingsByGroupIDAndUserIDParams{
		GroupID: groupID.String(),
		PayerID: userID,
	})
	if err != nil {
		return nil, err
	}

	lendings := []*domain.Lending{}
	for _, l := range lendingEvents {
		eventID, err := ulid.Parse(l.ID)
		if err != nil {
			return nil, err
		}
		eventGroupID, err := ulid.Parse(l.GroupID)
		if err != nil {
			return nil, err
		}
		amount, err := domain.NewAmount(int64(l.Amount))
		if err != nil {
			return nil, err
		}
		lending, err := domain.NewLending(eventID, eventGroupID, l.Name, amount, l.EventDate, l.CreatedAt, l.UpdatedAt)
		if err != nil {
			return nil, err
		}
		lendings = append(lendings, lending)
	}

	return lendings, nil
}

func (lr *LendingEventRepositoryImpl) FindByGroupIDAndUserIDWithPagination(
	ctx context.Context,
	groupID ulid.ULID,
	userID string,
	params domain.LendingPaginationParams,
) (*domain.PaginatedLendings, error) {
	ctx, span := tracer.Start(ctx, "lendingEvent.FindByGroupIDAndUserIDWithPagination")
	defer span.End()

	// Fetch limit + 1 to determine hasMore
	fetchLimit := params.Limit + 1

	ctx, querySpan := tracer.Start(ctx, "SELECT DISTINCT * FROM events WITH CURSOR")
	lendingEvents, err := lr.queries.FindLendingsByGroupIDAndUserIDWithCursor(ctx, postgres.FindLendingsByGroupIDAndUserIDWithCursorParams{
		GroupID: groupID.String(),
		PayerID: userID,
		Cursor:  params.Cursor,
		Limit:   fetchLimit,
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return nil, err
	}
	querySpan.End()

	hasMore := len(lendingEvents) > int(params.Limit)
	if hasMore {
		lendingEvents = lendingEvents[:params.Limit]
	}

	lendings := make([]*domain.Lending, 0, len(lendingEvents))
	var nextCursor *string

	for _, l := range lendingEvents {
		eventID, err := ulid.Parse(l.ID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		eventGroupID, err := ulid.Parse(l.GroupID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		amount, err := domain.NewAmount(int64(l.Amount))
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		lending, err := domain.NewLending(eventID, eventGroupID, l.Name, amount, l.EventDate, l.CreatedAt, l.UpdatedAt)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		lendings = append(lendings, lending)
	}

	// Set nextCursor to the ID of the last item if there are more items
	if hasMore && len(lendings) > 0 {
		lastID := lendings[len(lendings)-1].ID().String()
		nextCursor = &lastID
	}

	return &domain.PaginatedLendings{
		Lendings:   lendings,
		NextCursor: nextCursor,
		HasMore:    hasMore,
	}, nil
}

func (lr *LendingEventRepositoryImpl) Update(ctx context.Context, e *domain.Lending) error {
	ctx, span := tracer.Start(ctx, "lendingEvent.Update")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "UPDATE events SET name = $2, amount = $3, event_date = $4, updated_at = $5 WHERE id = $1")
	err := lr.queries.UpdateEvent(ctx, postgres.UpdateEventParams{
		ID:        e.ID().String(),
		Name:      e.Name(),
		Amount:    int32(e.Amount().Value()),
		EventDate: e.EventDate(),
		UpdatedAt: e.UpdatedAt(),
	})
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}

func (lr *LendingEventRepositoryImpl) Delete(ctx context.Context, id ulid.ULID) error {
	ctx, span := tracer.Start(ctx, "lendingEvent.Delete")
	defer span.End()

	ctx, querySpan := tracer.Start(ctx, "DELETE FROM events WHERE id = $1")
	err := lr.queries.DeleteEvent(ctx, id.String())
	if err != nil {
		querySpan.SetStatus(codes.Error, err.Error())
		querySpan.RecordError(err)
		querySpan.End()
		return err
	}
	querySpan.End()

	return nil
}
