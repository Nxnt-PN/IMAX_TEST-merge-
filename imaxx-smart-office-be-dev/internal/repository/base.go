package repository

import (
	"context"

	"gorm.io/gorm"
)

type contextKey string

// const txKey contextKey = "db_tx"
type txKey struct{}

// getDB ดึง gorm DB จาก context หรือคืนค่า default DB
func GetDB(ctx context.Context, defaultDb *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx.WithContext(ctx)
	}
	return defaultDb.WithContext(ctx)
}

type TransactionManager interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}

type txManagerImpl struct {
	Db *gorm.DB
}

func NewTxManager(Db *gorm.DB) TransactionManager {
	return &txManagerImpl{Db: Db}
}

func (m *txManagerImpl) WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	return m.Db.Transaction(func(tx *gorm.DB) error {
		// ฝาก transaction ไว้ใน context
		txCtx := context.WithValue(ctx, txKey{}, tx)
		return fn(txCtx)
	})
}
