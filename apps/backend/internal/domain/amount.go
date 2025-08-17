package domain

// 金額
type Amount struct {
	value int64
}

func NewAmount(value int64) (*Amount, error) {
	return &Amount{value: value}, nil
}

func (a *Amount) Value() int64 {
	return a.value
}

func (a *Amount) Negative() *Amount {
	v := -a.value
	return &Amount{value: v}
}

func (a *Amount) Add(b *Amount) *Amount {
	v := a.value + b.value
	return &Amount{value: v}
}

func (a *Amount) Minus(b *Amount) *Amount {
	v := a.value - b.value
	return &Amount{value: v}
}
