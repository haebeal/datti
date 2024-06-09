package dto

type Payments struct {
	Payments []struct {
		User struct {
			ID       string
			Name     string
			Email    string
			PhotoUrl string
		}
		Balance int
	}
}
