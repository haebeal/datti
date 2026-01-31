package repository

import (
	"context"
	"errors"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/gateway/postgres"
	"github.com/jackc/pgx/v5"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// LendingRepositoryImpl 立て替えリポジトリの実装
type LendingRepositoryImpl struct {
	queries *postgres.Queries
}

// NewLendingRepository LendingRepositoryImplのファクトリ関数
func NewLendingRepository(queries *postgres.Queries) *LendingRepositoryImpl {
	return &LendingRepositoryImpl{
		queries: queries,
	}
}

// Create 立て替えを作成する
func (lr *LendingRepositoryImpl) Create(ctx context.Context, g *domain.Group, l *domain.Lending) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Lending.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// イベントを作成
	err = lr.queries.CreateEvent(ctx, postgres.CreateEventParams{
		ID:        l.ID().String(),
		GroupID:   g.ID().String(),
		Name:      l.Name(),
		Amount:    int32(l.Amount()),
		EventDate: l.EventDate(),
		CreatedAt: l.CreatedAt(),
		UpdatedAt: l.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	// 各債務者に対して支払いを作成
	for _, debtor := range l.Debtors() {
		paymentID := ulid.Make()

		err = lr.queries.CreatePayment(ctx, postgres.CreatePaymentParams{
			ID:       paymentID.String(),
			PayerID:  l.Payer().ID(),
			DebtorID: debtor.ID(),
			Amount:   int32(debtor.Amount()),
		})
		if err != nil {
			return err
		}

		err = lr.queries.CreateEventPayment(ctx, postgres.CreateEventPaymentParams{
			EventID:   l.ID().String(),
			PaymentID: paymentID.String(),
		})
		if err != nil {
			return err
		}
	}

	return nil
}

// FindByID 立て替えをIDで取得する
func (lr *LendingRepositoryImpl) FindByID(ctx context.Context, id ulid.ULID) (l *domain.Lending, err error) {
	ctx, span := tracer.Start(ctx, "repository.Lending.FindByID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// イベントを取得
	event, err := lr.queries.FindEventById(ctx, id.String())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.NewNotFoundError("lending", id.String())
		}
		return nil, err
	}

	// 支払い情報を取得（Payer/Debtor情報含む）
	payments, err := lr.queries.FindPaymentsByEventId(ctx, id.String())
	if err != nil {
		return nil, err
	}

	if len(payments) == 0 {
		return nil, domain.NewNotFoundError("lending payments", id.String())
	}

	// Payerを取得
	payerUser, err := lr.queries.FindUserByID(ctx, payments[0].PayerID)
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(payerUser.ID, payerUser.Name, payerUser.Avatar, payerUser.Email)
	if err != nil {
		return nil, err
	}

	// Debtorsを取得
	debtors := make(map[string]*domain.Debtor, len(payments))
	for _, p := range payments {
		debtorUser, err := lr.queries.FindUserByID(ctx, p.DebtorID)
		if err != nil {
			return nil, err
		}
		debtor, err := domain.NewDebtor(debtorUser.ID, debtorUser.Name, debtorUser.Avatar, debtorUser.Email, int64(p.Amount))
		if err != nil {
			return nil, err
		}
		debtors[debtor.ID()] = debtor
	}

	// Lending集約を再構築
	eventID, err := ulid.Parse(event.ID)
	if err != nil {
		return nil, err
	}

	l, err = domain.NewLending(ctx, eventID, event.Name, int64(event.Amount), event.EventDate, payer, debtors, event.CreatedAt, event.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return l, nil
}

// FindByGroupAndUserID グループとユーザーIDで立て替え一覧を取得する
func (lr *LendingRepositoryImpl) FindByGroupAndUserID(ctx context.Context, g *domain.Group, userID string, cursor *string, limit *int32) (lendings []*domain.Lending, err error) {
	ctx, span := tracer.Start(ctx, "repository.Lending.FindByGroupAndUserID")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// イベント一覧を取得
	events, err := lr.queries.FindAllLendingsByGroupIDAndUserIDWithCursor(ctx, postgres.FindAllLendingsByGroupIDAndUserIDWithCursorParams{
		GroupID: g.ID().String(),
		UserID:  userID,
		Cursor:  cursor,
		Limit:   *limit,
	})
	if err != nil {
		return nil, err
	}

	lendings = make([]*domain.Lending, 0, len(events))

	for _, event := range events {
		eventID, err := ulid.Parse(event.ID)
		if err != nil {
			return nil, err
		}

		// 各イベントのLending集約を取得
		lending, err := lr.FindByID(ctx, eventID)
		if err != nil {
			return nil, err
		}

		lendings = append(lendings, lending)
	}

	return lendings, nil
}

// Update 立て替えを更新する
func (lr *LendingRepositoryImpl) Update(ctx context.Context, l *domain.Lending) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Lending.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// イベント情報を更新
	err = lr.queries.UpdateEvent(ctx, postgres.UpdateEventParams{
		ID:        l.ID().String(),
		Name:      l.Name(),
		Amount:    int32(l.Amount()),
		EventDate: l.EventDate(),
		UpdatedAt: l.UpdatedAt(),
	})
	if err != nil {
		return err
	}

	// 既存の支払い情報を取得
	existingPayments, err := lr.queries.FindPaymentsByEventId(ctx, l.ID().String())
	if err != nil {
		return err
	}

	// 既存の債務者IDセットを作成
	existingDebtorIDs := make(map[string]string) // debtorID -> paymentID
	for _, p := range existingPayments {
		existingDebtorIDs[p.DebtorID] = p.ID
	}

	// 新しい債務者を追加、既存の債務者を更新
	for _, debtor := range l.Debtors() {
		if paymentID, exists := existingDebtorIDs[debtor.ID()]; exists {
			// 既存の債務者を更新
			err = lr.queries.UpdatePaymentAmount(ctx, postgres.UpdatePaymentAmountParams{
				ID:     paymentID,
				Amount: int32(debtor.Amount()),
			})
			if err != nil {
				return err
			}
			delete(existingDebtorIDs, debtor.ID())
		} else {
			// 新しい債務者を追加
			paymentID := ulid.Make()
			err = lr.queries.CreatePayment(ctx, postgres.CreatePaymentParams{
				ID:       paymentID.String(),
				PayerID:  l.Payer().ID(),
				DebtorID: debtor.ID(),
				Amount:   int32(debtor.Amount()),
			})
			if err != nil {
				return err
			}

			err = lr.queries.CreateEventPayment(ctx, postgres.CreateEventPaymentParams{
				EventID:   l.ID().String(),
				PaymentID: paymentID.String(),
			})
			if err != nil {
				return err
			}
		}
	}

	// 削除された債務者の支払いを削除
	for _, paymentID := range existingDebtorIDs {
		err = lr.queries.DeletePayment(ctx, paymentID)
		if err != nil {
			return err
		}
	}

	return nil
}

// Delete 立て替えを削除する
func (lr *LendingRepositoryImpl) Delete(ctx context.Context, id ulid.ULID) (err error) {
	ctx, span := tracer.Start(ctx, "repository.Lending.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// 関連する支払いを取得して削除
	payments, err := lr.queries.FindPaymentsByEventId(ctx, id.String())
	if err != nil {
		return err
	}

	for _, p := range payments {
		err = lr.queries.DeletePayment(ctx, p.ID)
		if err != nil {
			return err
		}
	}

	// イベントを削除
	err = lr.queries.DeleteEvent(ctx, id.String())
	if err != nil {
		return err
	}

	return nil
}
