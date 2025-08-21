package domain

import (
	"testing"
)

func TestNewAmount(t *testing.T) {
	tests := []struct {
		name  string
		value int64
	}{
		{
			name:  "positive amount",
			value: 1000,
		},
		{
			name:  "zero amount",
			value: 0,
		},
		{
			name:  "negative amount",
			value: -500,
		},
		{
			name:  "max int64",
			value: 9223372036854775807, // math.MaxInt64
		},
		{
			name:  "min int64",
			value: -9223372036854775808, // math.MinInt64
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewAmount(tt.value)

			if err != nil {
				t.Errorf("NewAmount() error = %v, wantErr false", err)
				return
			}

			if got == nil {
				t.Errorf("NewAmount() got = nil, want non-nil")
				return
			}

			if got.Value() != tt.value {
				t.Errorf("NewAmount() value = %v, want %v", got.Value(), tt.value)
			}
		})
	}
}

func TestAmount_Value(t *testing.T) {
	tests := []struct {
		name     string
		amount   *Amount
		expected int64
	}{
		{
			name:     "positive value",
			amount:   &Amount{value: 1000},
			expected: 1000,
		},
		{
			name:     "zero value",
			amount:   &Amount{value: 0},
			expected: 0,
		},
		{
			name:     "negative value",
			amount:   &Amount{value: -500},
			expected: -500,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.amount.Value()
			if got != tt.expected {
				t.Errorf("Amount.Value() = %v, want %v", got, tt.expected)
			}
		})
	}
}

func TestAmount_Negative(t *testing.T) {
	tests := []struct {
		name     string
		amount   *Amount
		expected int64
	}{
		{
			name:     "positive to negative",
			amount:   &Amount{value: 1000},
			expected: -1000,
		},
		{
			name:     "negative to positive",
			amount:   &Amount{value: -500},
			expected: 500,
		},
		{
			name:     "zero remains zero",
			amount:   &Amount{value: 0},
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.amount.Negative()

			if got == nil {
				t.Errorf("Amount.Negative() got = nil, want non-nil")
				return
			}

			if got.Value() != tt.expected {
				t.Errorf("Amount.Negative() value = %v, want %v", got.Value(), tt.expected)
			}

			// 元のAmountが変更されていないことを確認
			if tt.amount.Value() != (tt.expected * -1) {
				t.Errorf("Original amount should not be modified")
			}
		})
	}
}

func TestAmount_Add(t *testing.T) {
	tests := []struct {
		name     string
		amount1  *Amount
		amount2  *Amount
		expected int64
	}{
		{
			name:     "positive + positive",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: 500},
			expected: 1500,
		},
		{
			name:     "positive + negative",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: -300},
			expected: 700,
		},
		{
			name:     "negative + negative",
			amount1:  &Amount{value: -500},
			amount2:  &Amount{value: -300},
			expected: -800,
		},
		{
			name:     "add zero",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: 0},
			expected: 1000,
		},
		{
			name:     "zero + zero",
			amount1:  &Amount{value: 0},
			amount2:  &Amount{value: 0},
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.amount1.Add(tt.amount2)

			if got == nil {
				t.Errorf("Amount.Add() got = nil, want non-nil")
				return
			}

			if got.Value() != tt.expected {
				t.Errorf("Amount.Add() value = %v, want %v", got.Value(), tt.expected)
			}

			// 元のAmountが変更されていないことを確認
			originalValue1 := tt.amount1.Value()
			originalValue2 := tt.amount2.Value()
			if originalValue1+originalValue2 != tt.expected {
				t.Errorf("Original amounts should not be modified")
			}
		})
	}
}

func TestAmount_Minus(t *testing.T) {
	tests := []struct {
		name     string
		amount1  *Amount
		amount2  *Amount
		expected int64
	}{
		{
			name:     "positive - positive",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: 300},
			expected: 700,
		},
		{
			name:     "positive - negative",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: -300},
			expected: 1300,
		},
		{
			name:     "negative - positive",
			amount1:  &Amount{value: -500},
			amount2:  &Amount{value: 300},
			expected: -800,
		},
		{
			name:     "negative - negative",
			amount1:  &Amount{value: -500},
			amount2:  &Amount{value: -300},
			expected: -200,
		},
		{
			name:     "minus zero",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: 0},
			expected: 1000,
		},
		{
			name:     "zero minus positive",
			amount1:  &Amount{value: 0},
			amount2:  &Amount{value: 500},
			expected: -500,
		},
		{
			name:     "same values",
			amount1:  &Amount{value: 1000},
			amount2:  &Amount{value: 1000},
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.amount1.Minus(tt.amount2)

			if got == nil {
				t.Errorf("Amount.Minus() got = nil, want non-nil")
				return
			}

			if got.Value() != tt.expected {
				t.Errorf("Amount.Minus() value = %v, want %v", got.Value(), tt.expected)
			}

			// 元のAmountが変更されていないことを確認
			originalValue1 := tt.amount1.Value()
			originalValue2 := tt.amount2.Value()
			if originalValue1-originalValue2 != tt.expected {
				t.Errorf("Original amounts should not be modified")
			}
		})
	}
}