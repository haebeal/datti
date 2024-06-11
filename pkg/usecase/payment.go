package usecase

import (
	"context"
	"time"

	"github.com/datti-api/pkg/domain/model"
	"github.com/datti-api/pkg/domain/repository"
	"github.com/datti-api/pkg/usecase/dto"
)

type PaymentUseCase interface {
	CreatePayment(c context.Context, paymentCreate *dto.PaymentCreate) (*model.Payment, *model.User, *model.User, error)
	UpdatePayment(c context.Context, id string, paidBy string, paidTo string, paidAt time.Time, amount int) (*model.Payment, *model.User, *model.User, error)
	GetPayments(c context.Context, uid string) (*dto.Payments, error)
	GetPayment(c context.Context, id string) (*model.Payment, *model.User, *model.User, error)
	DeletePayment(c context.Context, id string) error
}

type paymentUseCase struct {
	paymentRepository repository.PaymentRepository
	userRepository    repository.UserRepository
	transacton        repository.Transaction
}

// CreatePayment implements PaymentUseCase.
func (p *paymentUseCase) CreatePayment(c context.Context, paymentUseCaseDTO *dto.PaymentCreate) (*model.Payment, *model.User, *model.User, error) {
	v, err := p.transacton.DoInTx(c, func(ctx context.Context) (interface{}, error) {

		payment, err := p.paymentRepository.CreatePayment(c, paymentUseCaseDTO.PaidTo, "", paymentUseCaseDTO.PaidBy, paymentUseCaseDTO.PaidAt, paymentUseCaseDTO.Amount)
		if err != nil {
			return nil, err
		}
		return payment, nil
	})
	if err != nil {
		return nil, nil, nil, err
	}
	payment := v.(*model.Payment)
	paidToUser, err := p.userRepository.GetUserByUid(c, paymentUseCaseDTO.PaidTo)
	if err != nil {
		return nil, nil, nil, err
	}
	paidByUser, err := p.userRepository.GetUserByUid(c, paymentUseCaseDTO.PaidBy)
	if err != nil {
		return nil, nil, nil, err
	}
	return payment, paidToUser, paidByUser, nil
}

// DeletePayment implements PaymentUseCase.
func (p *paymentUseCase) DeletePayment(c context.Context, id string) error {
	_, err := p.transacton.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		err := p.paymentRepository.DeletePayment(c, id)
		if err != nil {
			return nil, err
		}
		return nil, nil
	})
	if err != nil {
		return err
	}

	return nil
}

// GetPayment implements PaymentUseCase.
func (p *paymentUseCase) GetPayment(c context.Context, id string) (*model.Payment, *model.User, *model.User, error) {
	payment, err := p.paymentRepository.GetPayment(c, id)
	if err != nil {
		return nil, nil, nil, err
	}

	paidToUser, err := p.userRepository.GetUserByUid(c, payment.PaidTo)
	if err != nil {
		return nil, nil, nil, err
	}

	paidByUser, err := p.userRepository.GetUserByUid(c, payment.PaidBy)
	if err != nil {
		return nil, nil, nil, err
	}

	return payment, paidToUser, paidByUser, nil
}

// GetPayments implements PaymentUseCase.
func (p *paymentUseCase) GetPayments(c context.Context, uid string) (*dto.Payments, error) {
	payments, err := p.paymentRepository.GetPayments(c, uid)
	if err != nil {
		return nil, err
	}

	result := &dto.Payments{}
	for _, payment := range payments {
		user, err := p.userRepository.GetUserByUid(c, payment.CounterpartyID)
		if err != nil {
			return nil, err
		}
		result.Payments = append(result.Payments, struct {
			User struct {
				ID       string
				Name     string
				Email    string
				PhotoUrl string
			}
			Balance int
		}{
			User: struct {
				ID       string
				Name     string
				Email    string
				PhotoUrl string
			}{
				ID:       user.ID,
				Name:     user.Name,
				Email:    user.Email,
				PhotoUrl: user.PhotoUrl,
			},
			Balance: payment.Balance,
		})
	}

	return result, nil
}

// UpdatePayment implements PaymentUseCase.
func (p *paymentUseCase) UpdatePayment(c context.Context, id string, paidBy string, paidTo string, paidAt time.Time, amount int) (*model.Payment, *model.User, *model.User, error) {
	v, err := p.transacton.DoInTx(c, func(ctx context.Context) (interface{}, error) {
		payment, err := p.paymentRepository.UpdatePayment(c, id, "eventId", paidBy, paidTo, paidAt, amount)
		if err != nil {
			return nil, err
		}
		return payment, nil
	})
	if err != nil {
		return nil, nil, nil, err
	}
	payment := v.(*model.Payment)
	paidToUser, err := p.userRepository.GetUserByUid(c, paidTo)
	if err != nil {
		return nil, nil, nil, err
	}
	paidByUser, err := p.userRepository.GetUserByUid(c, paidBy)
	if err != nil {
		return nil, nil, nil, err
	}
	return payment, paidToUser, paidByUser, nil
}

func NewPaymentUseCase(paymentRepo repository.PaymentRepository, userRepo repository.UserRepository, tx repository.Transaction) PaymentUseCase {
	return &paymentUseCase{
		paymentRepository: paymentRepo,
		userRepository:    userRepo,
		transacton:        tx,
	}
}
