package domain

import (
	"fmt"
)

// 金額
type Amount struct {
	value int64
}

func NewAmount(value int64) (*Amount, error) {

	if value < 0 {
		return nil, fmt.Errorf("金額は正の値である必要があります: value %v", value)
	}

	return &Amount{value: value}, nil
}

func (a *Amount) Value() int64 {
	return a.value
}

func (a *Amount) Add(b *Amount) (*Amount, error) {
	v := a.value + b.value
	return NewAmount(v)
}

func (a *Amount) Minus(b *Amount) (*Amount, error) {
	v := a.value - b.value
	return NewAmount(v)
}
