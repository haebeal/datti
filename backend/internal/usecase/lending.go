package usecase

import (
	"context"
	"fmt"
	"slices"

	"github.com/haebeal/datti/internal/domain"
	"github.com/haebeal/datti/internal/presentation/api/handler"
	"github.com/oklog/ulid/v2"
	"go.opentelemetry.io/otel/codes"
)

type LendingUseCaseImpl struct {
	ur domain.UserRepository
	pr domain.PayerRepository
	dr domain.DebtorRepository
	lr domain.LendingEventRepository
	gmr domain.GroupMemberRepository
}

func NewLendingUseCase(ur domain.UserRepository, pr domain.PayerRepository, dr domain.DebtorRepository, lr domain.LendingEventRepository, gmr domain.GroupMemberRepository) LendingUseCaseImpl {
	return LendingUseCaseImpl{
		ur: ur,
		pr: pr,
		dr: dr,
		lr: lr,
		gmr: gmr,
	}
}

func (u LendingUseCaseImpl) Create(ctx context.Context, i handler.CreateInput) (*handler.CreateOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Create")
	defer span.End()

	if err := u.ensureGroupMember(ctx, i.GroupID, i.UserID); err != nil {
		return nil, err
	}

	eventAmount, err := domain.NewAmount(i.Amount)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	event, err := domain.CreateLending(i.GroupID, i.Name, eventAmount, i.EventDate)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	err = u.lr.Create(ctx, event)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	paidUser, err := u.ur.FindByID(ctx, i.UserID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	payer, err := domain.NewPayer(paidUser.ID(), paidUser.Name(), paidUser.Avatar(), paidUser.Email())
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// 取引がないように更新しようとした時
	if len(i.Debts) == 0 {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("BadRequest Error")
		return nil, err
	}
	debtors := make([]*domain.Debtor, 0)
	for _, d := range i.Debts {
		// 自分自身に立て替えを作成することはできない
		if d.UserID == i.UserID {
			err := fmt.Errorf("自分自身に立て替えを作成することはできません")
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}

		user, err := u.ur.FindByID(ctx, d.UserID)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		amount, err := domain.NewAmount(d.Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		err = u.dr.Create(ctx, event, payer, debtor)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		debtors = append(debtors, debtor)
	}

	return &handler.CreateOutput{
		Event:   event,
		Debtors: debtors,
	}, nil
}

func (u LendingUseCaseImpl) Get(ctx context.Context, i handler.GetInput) (*handler.GetOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Get")
	defer span.End()

	if err := u.ensureGroupMember(ctx, i.GroupID, i.UserID); err != nil {
		return nil, err
	}

	event, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	if event.GroupID() != i.GroupID {
		return nil, fmt.Errorf("forbidden Error")
	}

	payer, err := u.pr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	// Check access: user must be payer or debtor
	isPayer := payer.ID() == i.UserID
	isDebtor := false
	for _, d := range debtors {
		if d.ID() == i.UserID {
			isDebtor = true
			break
		}
	}
	if !isPayer && !isDebtor {
		return nil, fmt.Errorf("lendingEventが存在しません")
	}

	// Set createdBy on the lending
	createdBy, err := domain.NewUID(payer.ID())
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	event.SetCreatedBy(createdBy)

	output := &handler.GetOutput{
		Lending: event,
		Debtors: debtors,
	}

	return output, nil
}

func (u LendingUseCaseImpl) GetByQuery(ctx context.Context, i handler.GetAllInput) (*handler.GetAllOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.GetByQuery")
	defer span.End()

	if err := u.ensureGroupMember(ctx, i.GroupID, i.UserID); err != nil {
		return nil, err
	}

	params := domain.LendingPaginationParams{
		Limit:  i.Limit,
		Cursor: i.Cursor,
	}

	paginatedLendings, err := u.lr.FindByGroupIDAndUserIDWithPagination(ctx, i.GroupID, i.UserID, params)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	lendings := paginatedLendings.Lendings

	output := handler.GetAllOutput{
		NextCursor: paginatedLendings.NextCursor,
		HasMore:    paginatedLendings.HasMore,
		Lendings: make([]struct {
			Lending *domain.Lending
			Debtors []*domain.Debtor
		}, 0),
	}

	// Return early if no lendings
	if len(lendings) == 0 {
		return &output, nil
	}

	// Collect all event IDs for batch fetching
	eventIDs := make([]ulid.ULID, len(lendings))
	for idx, l := range lendings {
		eventIDs[idx] = l.ID()
	}

	// Batch fetch all debtors at once
	debtorsMap, err := u.dr.FindByEventIDs(ctx, eventIDs)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	for _, l := range lendings {
		debtors := debtorsMap[l.ID()]
		if debtors == nil {
			debtors = []*domain.Debtor{}
		}

		lending := struct {
			Lending *domain.Lending
			Debtors []*domain.Debtor
		}{
			Lending: l,
			Debtors: debtors,
		}
		output.Lendings = append(output.Lendings, lending)
	}

	return &output, nil
}

func (u LendingUseCaseImpl) Update(ctx context.Context, i handler.UpdateInput) (*handler.UpdateOutput, error) {
	ctx, span := tracer.Start(ctx, "lending.Update")
	defer span.End()

	if err := u.ensureGroupMember(ctx, i.GroupID, i.UserID); err != nil {
		return nil, err
	}

	payer, err := u.pr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	if payer.ID() != i.UserID {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("forbidden Error")
		// NOTE: 正常系のためスパンステータスをエラーに設定しない
		return nil, err
	}

	// 取引がないように更新しようとした時
	if len(i.Debts) == 0 {
		// TODO: カスタムエラー構造体が必要?
		err = fmt.Errorf("BadRequest Error")
		return nil, err
	}

	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	if lending.GroupID() != i.GroupID {
		return nil, fmt.Errorf("forbidden Error")
	}

	var updatedDebtors []*domain.Debtor

	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	for _, d := range debtors {
		idx := slices.IndexFunc(i.Debts, func(debts handler.DebtParam) bool {
			return d.ID() == debts.UserID
		})

		// debtorの削除
		if idx == -1 {
			err = u.dr.Delete(ctx, lending, d)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			continue
		}

		// debtorの更新
		amount, err := domain.NewAmount(i.Debts[idx].Amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		updatedDebtor, err := d.Update(amount)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		err = u.dr.Update(ctx, lending, updatedDebtor)
		if err != nil {
			span.SetStatus(codes.Error, err.Error())
			span.RecordError(err)
			return nil, err
		}
		updatedDebtors = append(updatedDebtors, updatedDebtor)
	}

	// debtorの作成
	for _, d := range i.Debts {
		exist := slices.ContainsFunc(debtors, func(debtor *domain.Debtor) bool {
			return debtor.ID() == d.UserID
		})
		if !exist {
			// 自分自身に立て替えを作成することはできない
			if d.UserID == i.UserID {
				err := fmt.Errorf("自分自身に立て替えを作成することはできません")
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}

			user, err := u.ur.FindByID(ctx, d.UserID)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			amount, err := domain.NewAmount(d.Amount)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			debtor, err := domain.NewDebtor(user.ID(), user.Name(), user.Avatar(), user.Email(), amount)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			err = u.dr.Create(ctx, lending, payer, debtor)
			if err != nil {
				span.SetStatus(codes.Error, err.Error())
				span.RecordError(err)
				return nil, err
			}
			updatedDebtors = append(updatedDebtors, debtor)
			continue
		}
	}

	eventAmount, err := domain.NewAmount(i.Amount)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	updatedLending, err := lending.Update(i.Name, eventAmount, i.EventDate)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}
	err = u.lr.Update(ctx, updatedLending)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return nil, err
	}

	return &handler.UpdateOutput{
		Lending: updatedLending,
		Debtors: updatedDebtors,
	}, nil
}

func (u LendingUseCaseImpl) Delete(ctx context.Context, i handler.DeleteInput) error {
	ctx, span := tracer.Start(ctx, "lending.Delete")
	defer span.End()

	if err := u.ensureGroupMember(ctx, i.GroupID, i.UserID); err != nil {
		return err
	}

	payer, err := u.pr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	if payer.ID() != i.UserID {
		err = fmt.Errorf("forbidden Error")
		// NOTE: 正常系のためスパンステータスをエラーに設定しない
		return err
	}

	lending, err := u.lr.FindByID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}
	if lending.GroupID() != i.GroupID {
		return fmt.Errorf("forbidden Error")
	}


	debtors, err := u.dr.FindByEventID(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	for _, debtor := range debtors {
		err = u.dr.Delete(ctx, lending, debtor)
		if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
		}
	}


	err = u.lr.Delete(ctx, i.EventID)
	if err != nil {
		span.SetStatus(codes.Error, err.Error())
		span.RecordError(err)
		return err
	}

	return nil
}

func (u LendingUseCaseImpl) ensureGroupMember(ctx context.Context, groupID ulid.ULID, userID string) error {
	memberIDs, err := u.gmr.FindMembersByGroupID(ctx, groupID)
	if err != nil {
		return err
	}
	if !slices.Contains(memberIDs, userID) {
		return fmt.Errorf("forbidden Error")
	}
	return nil
}
