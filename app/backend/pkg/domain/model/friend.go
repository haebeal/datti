package model

type Friend struct {
	UID  string `bun:"uid,pk"`
	FUID string `bun:"friend_uid,pk"`
}
