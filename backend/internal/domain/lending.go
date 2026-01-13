package domain

import (
	"context"
	"fmt"
	"time"

	"github.com/oklog/ulid/v2"
)

// LendingRole はユーザーの役割を表す
type LendingRole string

const (
	LendingRolePayer  LendingRole = "payer"
	LendingRoleDebtor LendingRole = "debtor"
)

// 貸したイベント
type Lending struct {
	id        ulid.ULID
	groupID   ulid.ULID
	name      string
	amount    *Amount
	eventDate time.Time
	createdAt time.Time
	updatedAt time.Time
	role      LendingRole
	payerID   ulid.ULID
}

func NewLending(id ulid.ULID, groupID ulid.ULID, name string, amount *Amount, eventDate time.Time, createdAt time.Time, updatedAt time.Time) (*Lending, error) {
	if len(name) < 1 {
		return nil, fmt.Errorf("イベント名は1文字以上である必要があります: %v", name)
	}
	if groupID == (ulid.ULID{}) {
		return nil, fmt.Errorf("groupID must not be nil")
	}

	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります: %v", updatedAt)
	}

	return &Lending{
		id:        id,
		groupID:   groupID,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
		role:      LendingRolePayer, // デフォルトは payer
		payerID:   ulid.ULID{},
	}, nil
}

func NewLendingWithRole(id ulid.ULID, groupID ulid.ULID, name string, amount *Amount, eventDate time.Time, createdAt time.Time, updatedAt time.Time, role LendingRole, payerID ulid.ULID) (*Lending, error) {
	if len(name) < 1 {
		return nil, fmt.Errorf("イベント名は1文字以上である必要があります: %v", name)
	}
	if groupID == (ulid.ULID{}) {
		return nil, fmt.Errorf("groupID must not be nil")
	}

	if createdAt.After(updatedAt) {
		return nil, fmt.Errorf("作成日は更新日より前である必要があります: %v", updatedAt)
	}

	return &Lending{
		id:        id,
		groupID:   groupID,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		createdAt: createdAt,
		updatedAt: updatedAt,
		role:      role,
		payerID:   payerID,
	}, nil
}

func CreateLending(groupID ulid.ULID, name string, amount *Amount, eventDate time.Time) (*Lending, error) {
	id := ulid.Make()
	now := time.Now()

	return NewLending(id, groupID, name, amount, eventDate, now, now)
}

func (le *Lending) Update(name string, amount *Amount, eventDate time.Time) (*Lending, error) {
	now := time.Now()

	return NewLending(le.id, le.groupID, name, amount, eventDate, le.createdAt, now)
}

// ID returns the ID of the lending event
func (le *Lending) ID() ulid.ULID {
	return le.id
}

func (le *Lending) GroupID() ulid.ULID {
	return le.groupID
}

// Name returns the name of the lending event
func (le *Lending) Name() string {
	return le.name
}

func (le *Lending) Amount() *Amount {
	return le.amount
}

// EventDate returns the event date of the lending event
func (le *Lending) EventDate() time.Time {
	return le.eventDate
}

// CreatedAt returns the creation time of the lending event
func (le *Lending) CreatedAt() time.Time {
	return le.createdAt
}

// UpdatedAt returns the last update time of the lending event
func (le *Lending) UpdatedAt() time.Time {
	return le.updatedAt
}

// Role returns the role of the user (payer or debtor)
func (le *Lending) Role() LendingRole {
	return le.role
}

// PayerID returns the payer's user ID
func (le *Lending) PayerID() ulid.ULID {
	return le.payerID
}

// SetRole sets the role and payerID for the lending
func (le *Lending) SetRole(role LendingRole, payerID ulid.ULID) {
	le.role = role
	le.payerID = payerID
}

// LendingPaginationParams holds cursor-based pagination parameters
type LendingPaginationParams struct {
	Limit  int32
	Cursor *string
}

// PaginatedLendings holds paginated results
type PaginatedLendings struct {
	Lendings   []*Lending
	NextCursor *string
	HasMore    bool
}

type LendingEventRepository interface {
	Create(context.Context, *Lending) error
	FindByID(context.Context, ulid.ULID) (*Lending, error)
	FindByGroupIDAndUserIDWithPagination(context.Context, ulid.ULID, string, LendingPaginationParams) (*PaginatedLendings, error)
	Update(context.Context, *Lending) error
	Delete(context.Context, ulid.ULID) error
}
