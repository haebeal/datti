package domain

// 債務者
type Debtor struct {
	*User
	amount *Amount
}

func NewDebtor(u *User, a *Amount) (*Debtor, error) {
	return &Debtor{User: u, amount: a}, nil
}

func (d *Debtor) Amount() *Amount {
	return d.amount
}
