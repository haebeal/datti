package repositoryimpl

import (
	"context"
	"fmt"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/rs/xid"
)

type paymentRepositoryImpl struct {
	DBEngine database.DBClient
}

// CreatePayment implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) CreatePayment(c context.Context, eventId string, paidTo string, paidBy string, paidAt time.Time, amount int) (*model.Payment, error) {
	pid := xid.New()
	payment := &model.Payment{
		ID:        pid.String(),
		EventedBy: eventId,
		PaidBy:    paidBy,
		PaidTo:    paidTo,
		PaidAt:    paidAt,
		Amount:    amount,
	}
	_, err := p.DBEngine.Client.NewInsert().
		Model(payment).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return payment, nil
}

// DeletePayment implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) DeletePayment(c context.Context, id string) error {
	payment := new(model.Payment)
	_, err := p.DBEngine.Client.NewDelete().
		Model(payment).
		Where("id = ?", id).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// GetPayment implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) GetPayment(c context.Context, id string) (*model.Payment, error) {
	payment := new(model.Payment)
	err := p.DBEngine.Client.NewSelect().
		Table("payments").
		Where("id = ?", id).
		Scan(c, payment)
	if err != nil {
		return nil, err
	}

	return payment, nil
}

func (p *paymentRepositoryImpl) GetPaymentByEventId(c context.Context, eventId string) ([]*model.Payment, error) {
	payments := []*model.Payment{}
	err := p.DBEngine.Client.NewSelect().
		Table("payments").
		Where("evented_by = ?", eventId).
		Scan(c, payments)
	if err != nil {
		return nil, err
	}
	return payments, nil
}

// GetPayments implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) GetPayments(c context.Context, uid string) ([]*model.PaymentResult, error) {
	results := []*model.PaymentResult{}

	// lendAmounts := p.DBEngine.Client.NewSelect().
	// 	Model((*model.Payment)(nil)).
	// 	Column("paid_by").
	// 	Column("paid_to").
	// 	ColumnExpr("SUM(amount) AS amount").
	// 	Where("deleted_at IS NULL").
	// 	Group("paid_by", "paid_to")

	// borrowAmounts := p.DBEngine.Client.NewSelect().
	// 	Model((*model.Payment)(nil)).
	// 	Column("paid_to").
	// 	Column("paid_by").
	// 	ColumnExpr("SUM(amount) AS amount").
	// 	Where("deleted_at IS NULL").
	// 	Group("paid_to", "paid_by")

	// err := p.DBEngine.Client.NewSelect().
	// 	With("lendAmounts", lendAmounts).
	// 	With("borrowAmounts", borrowAmounts).
	// 	TableExpr(`
	// 		SELECT COALESCE(l.paid_by, b.paid_by) AS paid_by,
	// 		COALESCE(l.paid_to, b.paid_to) AS paid_to,
	// 		COALESCE(l.amount, 0) - COALESCE(b.amount, 0) AS balance
	// 		FROM lendAmounts AS l
	// 		FULL OUTER JOIN borrowAmounts AS b
	// 		ON l.paid_by = b.paid_by AND l.paid_to = b.paid_to
	// 		WHERE COALESCE(l.paid_by, b.paid_by) = ?
	// 	`, uid).
	// 	Scan(c, &results)

	// query := p.DBEngine.Client.NewSelect().
	// 	With("lendAmounts", lendAmounts).
	// 	With("borrowAmounts", borrowAmounts).
	// 	TableExpr("(SELECT * FROM lendAmounts) AS l").
	// 	ColumnExpr("COALESCE(l.paid_by, b.paid_by) AS paid_by").
	// 	ColumnExpr("COALESCE(l.paid_to, b.paid_to) AS paid_to").
	// 	ColumnExpr("COALESCE(l.amount, 0) - COALESCE(b.amount, 0) AS balance").
	// 	Join("FULL OUTER JOIN (SELECT * FROM borrowAmounts) AS b ON l.paid_by = b.paid_by AND l.paid_to = b.paid_to").
	// 	Where("COALESCE(l.paid_by, b.paid_by) = ?", uid)

	// LendAmountsのサブクエリ
	lendAmounts := p.DBEngine.Client.NewSelect().
		Model((*model.Payment)(nil)).
		ColumnExpr("paid_by AS user_id").
		ColumnExpr("paid_to AS counterparty_id").
		ColumnExpr("SUM(amount) AS amount").
		Group("paid_by", "paid_to").
		Where("deleted_at IS NULL")

	// BorrowAmountsのサブクエリ
	borrowAmounts := p.DBEngine.Client.NewSelect().
		Model((*model.Payment)(nil)).
		ColumnExpr("paid_to AS user_id").
		ColumnExpr("paid_by AS counterparty_id").
		ColumnExpr("SUM(amount) AS amount").
		Group("paid_to", "paid_by").
		Where("deleted_at IS NULL")

	// メインクエリ
	query := p.DBEngine.Client.NewSelect().
		ColumnExpr("COALESCE(l.user_id, b.user_id) AS user_id").
		ColumnExpr("COALESCE(l.counterparty_id, b.counterparty_id) AS counterparty_id").
		ColumnExpr("COALESCE(l.amount, 0) - COALESCE(b.amount, 0) AS balance").
		Join("FULL OUTER JOIN (?) AS b ON l.user_id = b.user_id AND l.counterparty_id = b.counterparty_id", borrowAmounts).
		TableExpr("(?) AS l", lendAmounts).
		Where("COALESCE(l.user_id, b.user_id) = ?", uid)

	// クエリの実行
	err := query.Scan(c, &results)

	if err != nil {
		fmt.Println("SQL Error: ", err)
		return nil, err
	}

	return results, nil
}

// GetPaidBy implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) GetPaidBy(c context.Context, uid string) ([]*model.Payment, error) {
	payments := new([]*model.Payment)
	err := p.DBEngine.Client.NewSelect().
		Table("payments").
		Where("paid_by = ?", uid).
		Scan(c, payments)
	if err != nil {
		return nil, err
	}

	return *payments, nil
}

// GetPaidTo implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) GetPaidTo(c context.Context, uid string) ([]*model.Payment, error) {
	payments := new([]*model.Payment)
	err := p.DBEngine.Client.NewSelect().
		Table("payments").
		Where("paid_to = ?", uid).
		Scan(c, payments)
	if err != nil {
		return nil, err
	}

	return *payments, nil
}

// UpdatePayment implements repository.PaymentRepository.
func (p *paymentRepositoryImpl) UpdatePayment(c context.Context, eventId string, id string, paidTo string, paidBy string, paidAt time.Time, amount int) (*model.Payment, error) {
	payment := new(model.Payment)
	payment.EventedBy = eventId
	payment.ID = id
	payment.PaidTo = paidTo
	payment.PaidBy = paidBy
	payment.PaidAt = paidAt
	payment.Amount = amount

	_, err := p.DBEngine.Client.NewUpdate().
		Model(payment).
		Column("paid_by", "paid_to", "paid_at", "amount").
		Where("evented_by = ? AND ", eventId).
		Exec(c)
	if err != nil {
		return nil, err
	}

	return payment, nil
}

func NewPaymentRepository(engine *database.DBClient) repository.PaymentRepository {
	return &paymentRepositoryImpl{
		DBEngine: *engine,
	}
}
