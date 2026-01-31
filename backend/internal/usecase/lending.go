package usecase

import (
	"context"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"go.opentelemetry.io/otel/codes"
)

// LendingUseCaseImpl 立て替えに関するユースケースの実装
type LendingUseCaseImpl struct {
	ur domain.UserRepository
	gr domain.GroupRepository
	lr domain.LendingRepository
}

// NewLendingUseCase LendingUseCaseImplのファクトリ関数
func NewLendingUseCase(ur domain.UserRepository, gr domain.GroupRepository, lr domain.LendingRepository) LendingUseCaseImpl {
	return LendingUseCaseImpl{
		ur: ur,
		gr: gr,
		lr: lr,
	}
}

// Create 立て替えを作成する
func (u LendingUseCaseImpl) Create(ctx context.Context, i handler.CreateInput) (output *handler.CreateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Lending.Create")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// グループの取得とメンバーシップ確認
	group, err := u.gr.FindByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}

	members, err := u.gr.FindMembersByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}
	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == i.UserID
	}) {
		return nil, NewForbiddenError("グループのメンバーではありません")
	}

	// 支払い者の作成
	paidUser, err := u.ur.FindByID(ctx, i.UserID)
	if err != nil {
		return nil, err
	}
	payer, err := domain.NewPayer(paidUser.ID(), paidUser.Name(), paidUser.Avatar(), paidUser.Email())
	if err != nil {
		return nil, err
	}

	// Lending集約を作成
	lending, err := domain.CreateLending(ctx, i.Name, i.Amount, i.EventDate, payer)
	if err != nil {
		return nil, err
	}

	// 債務者を追加（AddDebtorでバリデーション）
	for _, d := range i.Debts {
		user, err := u.ur.FindByID(ctx, d.UserID)
		if err != nil {
			return nil, err
		}

		debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), d.Amount)
		if err != nil {
			return nil, err
		}

		if err := lending.AddDebtor(debtor); err != nil {
			return nil, err
		}
	}

	// 債務者が1人以上いることを確認
	if len(lending.Debtors()) == 0 {
		return nil, domain.NewValidationError("debts", "債務者は1人以上必要です")
	}

	// リポジトリに保存
	if err := u.lr.Create(ctx, group, lending); err != nil {
		return nil, err
	}

	// ハンドラー互換のため配列に変換
	debtorList := make([]*domain.Debtor, 0, len(lending.Debtors()))
	for _, d := range lending.Debtors() {
		debtorList = append(debtorList, d)
	}

	return &handler.CreateOutput{
		Event:   lending,
		Debtors: debtorList,
	}, nil
}

// Get 立て替えを取得する
func (u LendingUseCaseImpl) Get(ctx context.Context, i handler.GetInput) (output *handler.GetOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Lending.Get")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// メンバーシップ確認
	members, err := u.gr.FindMembersByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}
	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == i.UserID
	}) {
		return nil, NewForbiddenError("グループのメンバーではありません")
	}

	// Lending取得
	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		return nil, err
	}

	// アクセス権限確認: 支払い者または債務者のみ
	isPayer := lending.Payer().ID() == i.UserID
	_, isDebtor := lending.Debtors()[i.UserID]
	if !isPayer && !isDebtor {
		return nil, domain.NewNotFoundError("lending", i.EventID.String())
	}

	// ハンドラー互換のため配列に変換
	debtorList := make([]*domain.Debtor, 0, len(lending.Debtors()))
	for _, d := range lending.Debtors() {
		debtorList = append(debtorList, d)
	}

	return &handler.GetOutput{
		Lending: lending,
		Debtors: debtorList,
	}, nil
}

// GetByQuery 立て替え一覧を取得する
func (u LendingUseCaseImpl) GetByQuery(ctx context.Context, i handler.GetAllInput) (output *handler.GetAllOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Lending.GetByQuery")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// グループの取得とメンバーシップ確認
	group, err := u.gr.FindByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}

	members, err := u.gr.FindMembersByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}
	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == i.UserID
	}) {
		return nil, NewForbiddenError("グループのメンバーではありません")
	}

	// Lending一覧取得
	limit := i.Limit
	lendings, err := u.lr.FindByGroupAndUserID(ctx, group, i.UserID, i.Cursor, &limit)
	if err != nil {
		return nil, err
	}

	result := handler.GetAllOutput{
		Lendings: make([]struct {
			Lending *domain.Lending
			Debtors []*domain.Debtor
		}, 0, len(lendings)),
	}

	for _, l := range lendings {
		// Debtorsをmapから配列に変換
		debtorList := make([]*domain.Debtor, 0, len(l.Debtors()))
		for _, d := range l.Debtors() {
			debtorList = append(debtorList, d)
		}

		result.Lendings = append(result.Lendings, struct {
			Lending *domain.Lending
			Debtors []*domain.Debtor
		}{
			Lending: l,
			Debtors: debtorList,
		})
	}

	// ページネーション情報の設定
	if len(lendings) > 0 && int32(len(lendings)) >= limit {
		lastID := lendings[len(lendings)-1].ID().String()
		result.NextCursor = &lastID
		result.HasMore = true
	}

	return &result, nil
}

// Update 立て替えを更新する
func (u LendingUseCaseImpl) Update(ctx context.Context, i handler.UpdateInput) (output *handler.UpdateOutput, err error) {
	ctx, span := tracer.Start(ctx, "usecase.Lending.Update")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// メンバーシップ確認
	members, err := u.gr.FindMembersByID(ctx, i.GroupID)
	if err != nil {
		return nil, err
	}
	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == i.UserID
	}) {
		return nil, NewForbiddenError("グループのメンバーではありません")
	}

	// Lending取得
	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		return nil, err
	}

	// 支払い者のみ更新可能
	if lending.Payer().ID() != i.UserID {
		return nil, NewForbiddenError("支払い者のみ更新できます")
	}

	// 債務者がいない場合はエラー
	if len(i.Debts) == 0 {
		return nil, domain.NewValidationError("debts", "債務者は1人以上必要です")
	}

	// 入力の債務者IDセットを作成
	inputDebtorIDs := make(map[string]handler.DebtParam)
	for _, d := range i.Debts {
		inputDebtorIDs[d.UserID] = d
	}

	// 既存の債務者を処理（更新または削除）
	for debtorID, existingDebtor := range lending.Debtors() {
		if param, exists := inputDebtorIDs[debtorID]; exists {
			// 更新
			updatedDebtor, err := existingDebtor.Update(param.Amount)
			if err != nil {
				return nil, err
			}
			if err := lending.UpdateDebtor(updatedDebtor); err != nil {
				return nil, err
			}
		} else {
			// 削除
			if err := lending.RemoveDebtor(debtorID); err != nil {
				return nil, err
			}
		}
	}

	// 新規の債務者を追加
	for _, d := range i.Debts {
		if _, exists := lending.Debtors()[d.UserID]; !exists {
			// 自分自身に立て替えを作成することはできない
			if d.UserID == i.UserID {
				return nil, domain.NewValidationError("debts", "自分自身に立て替えを作成することはできません")
			}

			user, err := u.ur.FindByID(ctx, d.UserID)
			if err != nil {
				return nil, err
			}

			debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), d.Amount)
			if err != nil {
				return nil, err
			}

			if err := lending.AddDebtor(debtor); err != nil {
				return nil, err
			}
		}
	}

	// 基本情報を更新
	updatedLending, err := lending.Update(ctx, i.Name, i.Amount, i.EventDate)
	if err != nil {
		return nil, err
	}

	// リポジトリに保存
	if err := u.lr.Update(ctx, updatedLending); err != nil {
		return nil, err
	}

	// ハンドラー互換のため配列に変換
	debtorList := make([]*domain.Debtor, 0, len(updatedLending.Debtors()))
	for _, d := range updatedLending.Debtors() {
		debtorList = append(debtorList, d)
	}

	return &handler.UpdateOutput{
		Lending: updatedLending,
		Debtors: debtorList,
	}, nil
}

// Delete 立て替えを削除する
func (u LendingUseCaseImpl) Delete(ctx context.Context, i handler.DeleteInput) (err error) {
	ctx, span := tracer.Start(ctx, "usecase.Lending.Delete")
	defer func() {
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
		}
		span.End()
	}()

	// メンバーシップ確認
	members, err := u.gr.FindMembersByID(ctx, i.GroupID)
	if err != nil {
		return err
	}
	if !slices.ContainsFunc(members, func(m *domain.User) bool {
		return m.ID() == i.UserID
	}) {
		return NewForbiddenError("グループのメンバーではありません")
	}

	// Lending取得
	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		return err
	}

	// 支払い者のみ削除可能
	if lending.Payer().ID() != i.UserID {
		return NewForbiddenError("支払い者のみ削除できます")
	}

	// リポジトリから削除
	return u.lr.Delete(ctx, i.EventID)
}
