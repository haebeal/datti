package repositoryimpl

import (
	"context"
	"database/sql"
	"errors"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/google/uuid"
)

type friendRepositoryImpl struct {
	DBEngine database.DBClient
}

// SetFriends implements repository.FriendRepository.
func (f *friendRepositoryImpl) SetFriends(c context.Context, uid uuid.UUID, fuid uuid.UUID) error {
	friend := &model.Friend{
		UserID:       uid,
		FriendUserID: fuid,
	}
	_, err := f.DBEngine.Client.NewInsert().Model(friend).Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// DeleteFriend implements repository.FriendRepository.
func (f *friendRepositoryImpl) DeleteFriend(c context.Context, uid uuid.UUID, fuid uuid.UUID) error {
	friend := new(model.Friend)
	_, err := f.DBEngine.Client.NewDelete().
		Model(friend).
		Where("uid = ? AND friend_uid = ?", uid, fuid).
		WhereOr("uid = ? AND friend_uid = ?", fuid, uid).
		Exec(c)
	if err != nil {
		return err
	}

	return nil
}

// GetApplied implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetApplieds(c context.Context, uid uuid.UUID) ([]*model.Friend, error) {
	applieds := new([]*model.Friend)
	subq := f.DBEngine.Client.NewSelect().
		Column("f2.*").
		Table("friends").
		TableExpr("friends AS f2").
		Where("f1.user_id = f2.friend_user_id").
		Where("f1.friend_user_id = f2.user_id")

	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Where("NOT EXISTS (?)", subq).
		Where("f1.friend_user_id = ?", uid).
		Scan(c, applieds)

	if err != nil {
		return nil, err
	}

	return *applieds, nil
}

// GetApplyings implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetApplyings(c context.Context, uid uuid.UUID) ([]*model.Friend, error) {
	applyings := new([]*model.Friend)
	subq := f.DBEngine.Client.NewSelect().
		Column("f2.*").
		Table("friends").
		TableExpr("friends AS f2").
		Where("f1.user_id = f2.friend_user_id").
		Where("f1.friend_user_id = f2.user_id")

	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Where("NOT EXISTS (?)", subq).
		Where("f1.user_id = ?", uid).
		Scan(c, applyings)

	if err != nil {
		return nil, err
	}

	return *applyings, nil
}

// Getstatus implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetStatus(c context.Context, uid uuid.UUID, fuid uuid.UUID) (string, error) {
	var status string

	if uid == fuid {
		return "me", nil
	}

	subquery1 := f.DBEngine.Client.NewSelect().
		Table("friends").
		Where("uid = ? AND friend_uid = ?", uid, fuid)

	subquery2 := f.DBEngine.Client.NewSelect().
		Table("friends").
		Where("uid = ? AND friend_uid = ?", fuid, uid)

	query := f.DBEngine.Client.NewSelect().
		ColumnExpr(`CASE
			WHEN f1.user_id IS NOT NULL AND f2.user_id IS NOT NULL THEN 'friend'
			WHEN f2.user_id IS NOT NULL THEN 'applying'
			WHEN f1.user_id IS NOT NULL AND f2.user_id IS NULL THEN 'requesting'
		END AS status`).
		With("f1", subquery1).
		With("f2", subquery2).
		TableExpr("f1").
		Join("FULL JOIN f2 ON f1.user_id = f2.friend_user_id AND f1.friend_user_id = f2.user_id")

	err := query.Scan(c, &status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			status = "none"
			return status, nil
		}
		return "", err
	}

	return status, nil
}

// GetFriends implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetFriends(c context.Context, uid uuid.UUID) ([]*model.Friend, error) {
	friends := new([]*model.Friend)
	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Join("JOIN friends AS f2 ON f1.user_id = f2.friend_user_id AND f1.friend_user_id = f2.user_id").
		Where("f1.friend_user_id = ?", uid).
		Scan(c, friends)
	if err != nil {
		return nil, err
	}

	return *friends, nil
}

func NewFriendRepository(engine *database.DBClient) repository.FriendRepository {
	return &friendRepositoryImpl{
		DBEngine: *engine,
	}
}
