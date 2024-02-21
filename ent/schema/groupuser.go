package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// GroupUser holds the schema definition for the GroupUser entity.
type GroupUser struct {
	ent.Schema
}

// Fields of the GroupUser.
func (GroupUser) Fields() []ent.Field {
	return []ent.Field{
		field.String("uid").MinLen(28).MaxLen(28).NotEmpty().Unique(),
		field.String("group_id").NotEmpty().Unique(),
		field.Bool("owner"),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("deleted_at").Nillable().Optional(),
	}
}

// Edges of the GroupUser.
func (GroupUser) Edges() []ent.Edge {
	return nil
}
