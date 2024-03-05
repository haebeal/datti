package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
)

type friendRepositoryImpl struct {
	DBEngine database.DBClient
}

// DeleteFriend implements repository.FriendRepository.
func (f *friendRepositoryImpl) DeleteFriend(c context.Context, uid string, fuid string) error {
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
func (f *friendRepositoryImpl) GetApplieds(c context.Context, uid string) ([]*model.Friend, error) {
	applieds := new([]*model.Friend)
	subq := f.DBEngine.Client.NewSelect().
		Column("f2.*").
		Table("friends").
		TableExpr("friends AS f2").
		Where("f1.uid = f2.friend_uid").
		Where("f1.friend_uid = f2.uid")

	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Where("NOT EXISTS (?)", subq).
		Where("f1.friend_uid = ?", uid).
		Scan(c, applieds)

	if err != nil {
		return nil, err
	}

	return *applieds, nil
}

// GetApplyings implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetApplyings(c context.Context, uid string) ([]*model.Friend, error) {
	applyings := new([]*model.Friend)
	subq := f.DBEngine.Client.NewSelect().
		Column("f2.*").
		Table("friends").
		TableExpr("friends AS f2").
		Where("f1.uid = f2.friend_uid").
		Where("f1.friend_uid = f2.uid")

	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Where("NOT EXISTS (?)", subq).
		Where("f1.uid = ?", uid).
		Scan(c, applyings)

	if err != nil {
		return nil, err
	}

	return *applyings, nil
}

// GetFriends implements repository.FriendRepository.
func (f *friendRepositoryImpl) GetFriends(c context.Context, uid string) ([]*model.Friend, error) {
	friends := new([]*model.Friend)
	err := f.DBEngine.Client.NewSelect().
		Distinct().
		Column("f1.*").
		Table("friends").
		TableExpr("friends AS f1").
		Join("JOIN friends AS f2 ON f1.uid = f2.friend_uid AND f1.friend_uid = f2.uid").
		Where("f1.uid = ?", uid).
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
