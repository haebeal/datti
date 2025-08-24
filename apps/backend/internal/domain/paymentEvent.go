package domain

import (
	"fmt"
	"time"
	"unicode/utf8"

	"github.com/oklog/ulid/v2"
)

// 支払いイベント
type PaymentEvent struct {
	id        ulid.ULID
	name      string
	eventDate time.Time
	payer     *Payer
	debtors   []*Debtor
	createdAt time.Time
	updatedAt time.Time
}

func NewPaymentEvent(id string, name string, payer *Payer, debtors []*Debtor, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (*PaymentEvent, error) {
	ulid, err := ulid.Parse(id)
	if err != nil {
		return nil, err
	}

	nl := utf8.RuneCountInString(name)
	if nl <= 0 {
		return nil, fmt.Errorf("name length must be greater than 0")
	}

	if len(debtors) == 0 {
		return nil, fmt.Errorf("debtors length must be greater than 0")
	}

	// debtorsでユーザーが重複していないかチェック
	du := make(map[string]string, len(debtors))
	for _, d := range debtors {
		id := d.ID().String()
		_, exist := du[id]
		if exist {
			return nil, fmt.Errorf("duplicate debtor: id %s, name %s", d.ID(), d.Name())
		}
		du[id] = id
	}

	// payerがdebtorsに含まれているかチェック
	for _, d := range debtors {
		if payer.Equal(d.User) {
			return nil, fmt.Errorf("payer must not be a debtor: id %s, name %s", d.ID(), d.Name())
		}
	}

	return &PaymentEvent{
		id:        ulid,
		name:      name,
		payer:     payer,
		debtors:   debtors,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

func CreatePaymentEvent(name string, payer *Payer, debtors []*Debtor, eventDate time.Time) (*PaymentEvent, error) {
	id := ulid.Make().String()
	now := time.Now()

	return NewPaymentEvent(id, name, payer, debtors, eventDate, now, now)
}

func (e *PaymentEvent) Update(name string, payer *Payer, debtors []*Debtor, eventDate time.Time) (*PaymentEvent, error) {
	now := time.Now()

	nw, err := NewPaymentEvent(e.id.String(), name, payer, debtors, eventDate, e.createdAt, now)
	if err != nil {
		return nil, err
	}

	return nw, nil
}

func (e *PaymentEvent) ID() ulid.ULID {
	return e.id
}

func (e *PaymentEvent) Name() string {
	return e.name
}

func (e *PaymentEvent) Payer() *Payer {
	return e.payer
}

func (e *PaymentEvent) Debtors() []*Debtor {
	return e.debtors
}

func (e *PaymentEvent) EventDate() time.Time {
	return e.eventDate
}

func (e *PaymentEvent) CreatedAt() time.Time {
	return e.createdAt
}

func (e *PaymentEvent) UpdatedAt() time.Time {
	return e.updatedAt
}

type PaymentEventRepository interface {
	Create(*PaymentEvent) error
	FindAll() ([]*PaymentEvent, error)
	FindByID(string) (*PaymentEvent, error)
	Update(*PaymentEvent) error
	Delete(*PaymentEvent) error
}
