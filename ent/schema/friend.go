package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// Friend holds the schema definition for the Friend entity.
type Friend struct {
	ent.Schema
}

// Fields of the Friend.
func (Friend) Fields() []ent.Field {
	return []ent.Field{
		field.String("uid").MaxLen(28).MinLen(28).NotEmpty(),
		field.String("friend_uid").MaxLen(28).MinLen(28).NotEmpty(),
		field.Time("create_at").Default(time.Now).Immutable(),
		field.Time("update_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("delete_at").Nillable().Optional(),
	}
}

// Edges of the Friend.
func (Friend) Edges() []ent.Edge {
	return nil
}
