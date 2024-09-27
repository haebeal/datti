package repositoryimpl

import (
	"context"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/infrastructure/database"
	"github.com/uptrace/bun"
)

type userRepoImpl struct {
	// TenantClient database.FireBaseTenantClient
	DBEngine database.DBClient
}

// GetProfile implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByUid(c context.Context, uid string) (*model.User, error) {
	user := new(model.User)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("id = ?", uid).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUsers implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUsers(c context.Context) ([]*model.User, error) {
	users := new([]*model.User)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Scan(c, users)
	if err != nil {
		return nil, err
	}

	return *users, nil
}

// GetProfileByEmail implements repository.ProfileRepository.
func (ur *userRepoImpl) GetUserByEmail(c context.Context, email string) (*model.User, error) {
	user := new(model.User)
	err := ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("email = ?", email).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (ur *userRepoImpl) GetUsersByEmail(c context.Context, uid string, email string, status string, cursor string, limit int, getNext bool) ([]*model.UserStatus, *model.Cursor, error) {
	var results []*model.UserStatus
	var query *bun.SelectQuery

	subQuery := ur.DBEngine.Client.NewSelect().
		ColumnExpr("u.id AS user_id, u.name AS user_name, u.email AS user_email, u.photo_url AS user_photo_url").
		ColumnExpr("f1.uid AS f1_uid, f1.friend_uid AS f1_friend_uid").
		ColumnExpr("f2.uid AS f2_uid, f2.friend_uid AS f2_friend_uid").
		TableExpr("users u").
		Join("LEFT JOIN friends f1 ON u.id = f1.friend_uid AND f1.uid = ?", uid).
		Join("LEFT JOIN friends f2 ON u.id = f2.uid AND f2.friend_uid = ?", uid).
		Where("u.email LIKE ?", "%"+email+"%").
		Where("u.deleted_at IS NULL")

	if getNext {
		query = ur.DBEngine.Client.NewSelect().
			With("friends_status", subQuery).
			ColumnExpr("user_id, user_name, user_email, user_photo_url, status").
			TableExpr("(SELECT user_id, user_name, user_email, user_photo_url, "+
				"CASE "+
				"WHEN user_id = ? THEN 'me' "+
				"WHEN f1_uid IS NOT NULL AND f2_uid IS NOT NULL THEN 'friend' "+
				"WHEN f1_uid IS NOT NULL AND f2_uid IS NULL THEN 'requesting' "+
				"WHEN f2_uid IS NOT NULL THEN 'applying' "+
				"ELSE 'none' END AS status "+
				"FROM friends_status) AS subquery", uid).
			Where("user_id > ?", cursor).
			OrderExpr("user_id ASC").
			Limit(limit)
	} else {
		query = ur.DBEngine.Client.NewSelect().
			With("friends_status", subQuery).
			ColumnExpr("user_id, user_name, user_email, user_photo_url, status").
			TableExpr("(SELECT user_id, user_name, user_email, user_photo_url, "+
				"CASE "+
				"WHEN user_id = ? THEN 'me' "+
				"WHEN f1_uid IS NOT NULL AND f2_uid IS NOT NULL THEN 'friend' "+
				"WHEN f1_uid IS NOT NULL AND f2_uid IS NULL THEN 'requesting' "+
				"WHEN f2_uid IS NOT NULL THEN 'applying' "+
				"ELSE 'none' END AS status "+
				"FROM friends_status) AS subquery", uid).
			Where("user_id < ?", cursor).
			OrderExpr("user_id DESC").
			Limit(limit)
	}

	// statusの値が空文字列のでない場合はstatusを検索条件に含める
	if status != "" {
		err := query.Where("status = ?", status).
			Scan(c, &results)
		if err != nil {
			return nil, nil, err
		}
	}
	err := query.Scan(c, &results)
	if err != nil {
		return nil, nil, err
	}

	return results, newUsersCursor(results), nil
}

// UpdateName implements repository.ProfileRepository.
func (ur *userRepoImpl) UpdateUser(c context.Context, uid string, name string, url string) (*model.User, error) {
	user := new(model.User)
	user.ID = uid
	user.Name = name
	user.PhotoUrl = url

	_, err := ur.DBEngine.Client.NewUpdate().
		Model(user).
		Column("name").
		Column("photo_url").
		Where("id = ?", uid).
		Exec(c)
	if err != nil {
		return nil, err
	}

	err = ur.DBEngine.Client.NewSelect().
		Table("users").
		Where("id = ?", uid).
		Scan(c, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func NewProfileRepoImpl(engine *database.DBClient) repository.UserRepository {
	return &userRepoImpl{
		DBEngine: *engine,
	}
}

func newUsersCursor(users []*model.UserStatus) *model.Cursor {
	if len(users) == 0 {
		return &model.Cursor{}
	}
	return &model.Cursor{
		Start: users[0].ID,
		End:   users[len(users)-1].ID,
	}
}
