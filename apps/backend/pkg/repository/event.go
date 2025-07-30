package repository

import "github.com/haebeal/datti/pkg/core"

type IEventRepository interface {
	Create(e *core.Event) error
}
