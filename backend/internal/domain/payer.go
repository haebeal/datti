package domain


// 支払い者
type Payer struct {
	id     string
	name   string
	avatar string
	email  string
}

func NewPayer(id string, name string, avatar string, email string) (*Payer, error) {
	return &Payer{
		id:     id,
		name:   name,
		avatar: avatar,
		email:  email,
	}, nil
}

func (p *Payer) Equal(c *Payer) bool {
	return p.id == c.id
}

func (p *Payer) ID() string {
	return p.id
}

func (p *Payer) Name() string {
	return p.name
}

func (p *Payer) Avatar() string {
	return p.avatar
}

func (p *Payer) Email() string {
	return p.email
}
