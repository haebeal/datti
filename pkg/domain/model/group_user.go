package model

type GroupUser struct {
	UserID  uint `gorm:"uniqueIndex:idx_user_group"`
	GroupID uint `gorm:"uniqueIndex:idx_user_group"`
	// EventsUserID  []Event `gorm:"foreignKey:CreatedBy;references:UserID"` // CreatedBy列の外部キー
	// EventsGroupID []Event `gorm:"foreignKey:GroupID;references:GroupID"`  // GroupID列の外部キー
	User  User
	Group Group
}
