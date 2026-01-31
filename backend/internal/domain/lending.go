package domain

import (
	"context"
	"time"
	"unicode/utf8"

	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

// Lending 立て替えイベント集約
type Lending struct {
	id        ulid.ULID
	name      string
	amount    int64
	eventDate time.Time
	payer     *Payer
	debtors   map[string]*Debtor
	createdAt time.Time
	updatedAt time.Time
}

// NewLending Lendingエンティティのファクトリ関数 (リポジトリからの復元用)
func NewLending(ctx context.Context, id ulid.ULID, name string, amount int64, eventDate time.Time, payer *Payer, debtors map[string]*Debtor, createdAt time.Time, updatedAt time.Time) (l *Lending, err error) {
	_, span := tracer.Start(ctx, "domain.Lending.New")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	if utf8.RuneCountInString(name) < 1 {
		return nil, NewValidationError("name", "イベント名は1文字以上である必要があります")
	}

	if payer == nil {
		return nil, NewValidationError("payer", "支払い者は必須です")
	}

	if len(debtors) == 0 {
		return nil, NewValidationError("debtors", "債務者は1人以上必要です")
	}

	if createdAt.After(updatedAt) {
		return nil, NewValidationError("updatedAt", "更新日は作成日より後である必要があります")
	}

	return &Lending{
		id:        id,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		payer:     payer,
		debtors:   debtors,
		createdAt: createdAt,
		updatedAt: updatedAt,
	}, nil
}

// CreateLending 新規Lendingを作成するファクトリ関数
// debtorsは空で作成し、AddDebtorメソッドで追加する
func CreateLending(ctx context.Context, name string, amount int64, eventDate time.Time, payer *Payer) (*Lending, error) {
	_, span := tracer.Start(ctx, "domain.Lending.Create")
	defer span.End()

	if utf8.RuneCountInString(name) < 1 {
		return nil, NewValidationError("name", "イベント名は1文字以上である必要があります")
	}

	if payer == nil {
		return nil, NewValidationError("payer", "支払い者は必須です")
	}

	id := ulid.Make()
	now := time.Now()

	return &Lending{
		id:        id,
		name:      name,
		amount:    amount,
		eventDate: eventDate,
		payer:     payer,
		debtors:   make(map[string]*Debtor),
		createdAt: now,
		updatedAt: now,
	}, nil
}

// Update Lendingの基本情報を更新する
func (l *Lending) Update(ctx context.Context, name string, amount int64, eventDate time.Time) (*Lending, error) {
	now := time.Now()

	return NewLending(ctx, l.id, name, amount, eventDate, l.payer, l.debtors, l.createdAt, now)
}

// AddDebtor 債務者を追加する
func (l *Lending) AddDebtor(debtor *Debtor) error {
	// 自分自身への立て替えはできない
	if debtor.ID() == l.payer.ID() {
		return NewValidationError("debtor", "支払い者自身を債務者にすることはできません")
	}

	// 重複チェック
	if _, exists := l.debtors[debtor.ID()]; exists {
		return NewValidationError("debtor", "既に追加されている債務者です")
	}

	l.debtors[debtor.ID()] = debtor
	return nil
}

// RemoveDebtor 債務者を削除する
func (l *Lending) RemoveDebtor(debtorID string) error {
	if _, exists := l.debtors[debtorID]; !exists {
		return NewValidationError("debtor", "債務者が見つかりません")
	}

	delete(l.debtors, debtorID)
	return nil
}

// UpdateDebtor 債務者を更新する
func (l *Lending) UpdateDebtor(debtor *Debtor) error {
	if _, exists := l.debtors[debtor.ID()]; !exists {
		return NewValidationError("debtor", "債務者が見つかりません")
	}
	l.debtors[debtor.ID()] = debtor
	return nil
}

// ID イベントID
func (l *Lending) ID() ulid.ULID {
	return l.id
}

// Name イベント名
func (l *Lending) Name() string {
	return l.name
}

// Amount 金額
func (l *Lending) Amount() int64 {
	return l.amount
}

// EventDate イベント日
func (l *Lending) EventDate() time.Time {
	return l.eventDate
}

// CreatedAt 作成日時
func (l *Lending) CreatedAt() time.Time {
	return l.createdAt
}

// UpdatedAt 更新日時
func (l *Lending) UpdatedAt() time.Time {
	return l.updatedAt
}

// Payer 支払い者
func (l *Lending) Payer() *Payer {
	return l.payer
}

// Debtors 債務者一覧
func (l *Lending) Debtors() map[string]*Debtor {
	return l.debtors
}

// LendingPaginationParams ページネーションパラメータ
type LendingPaginationParams struct {
	Limit  int32
	Cursor *string
}

// PaginatedLendings ページネーション結果
type PaginatedLendings struct {
	Lendings   []*Lending
	NextCursor *string
	HasMore    bool
}

// LendingRepository 立て替えイベントリポジトリのインターフェース
type LendingRepository interface {
	Create(ctx context.Context, g *Group, l *Lending) error
	FindByID(ctx context.Context, id ulid.ULID) (*Lending, error)
	FindByGroupAndUserID(ctx context.Context, g *Group, userID string, cursor *string, limit *int32) ([]*Lending, error)
	Update(ctx context.Context, l *Lending) error
	Delete(ctx context.Context, id ulid.ULID) error
}
