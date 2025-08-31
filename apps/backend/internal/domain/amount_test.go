package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
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

			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.value, got.Value())
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
			assert.Equal(t, tt.expected, got)
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

			require.NotNil(t, got)
			assert.Equal(t, tt.expected, got.Value())

			// 元のAmountが変更されていないことを確認
			assert.Equal(t, tt.expected*-1, tt.amount.Value())
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

			require.NotNil(t, got)
			assert.Equal(t, tt.expected, got.Value())

			// 元のAmountが変更されていないことを確認
			originalValue1 := tt.amount1.Value()
			originalValue2 := tt.amount2.Value()
			assert.Equal(t, tt.expected, originalValue1+originalValue2)
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

			require.NotNil(t, got)
			assert.Equal(t, tt.expected, got.Value())

			// 元のAmountが変更されていないことを確認
			originalValue1 := tt.amount1.Value()
			originalValue2 := tt.amount2.Value()
			assert.Equal(t, tt.expected, originalValue1-originalValue2)
		})
	}
}