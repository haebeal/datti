package domain

// 支払い者
type Payer struct {
	*User
	amount *Amount
}

func NewPayer(u *User, a *Amount) (*Payer, error) {
	return &Payer{User: u, amount: a}, nil
}

func (p *Payer) Amount() *Amount {
	return p.amount
}
