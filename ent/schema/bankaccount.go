package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// BankAccount holds the schema definition for the BankAccount entity.
type BankAccount struct {
	ent.Schema
}

// Fields of the BankAccount.
func (BankAccount) Fields() []ent.Field {
	return []ent.Field{
		field.String("id").MinLen(28).MaxLen(28).NotEmpty(),
		field.String("account_code").MinLen(7).MaxLen(7),
		field.String("bank_code").MinLen(3).MaxLen(3),
		field.String("branch_code").MinLen(4).MaxLen(4),
		field.Time("create_at").Default(time.Now).Immutable(),
		field.Time("update_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("delete_at").Nillable().Optional(),
	}
}

// Edges of the BankAccount.
func (BankAccount) Edges() []ent.Edge {
	return nil
}
