package helper

import (
	"context"
	"errors"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword generates a bcrypt hash for the given password.
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// VerifyPassword verifies if the given password matches the stored hash.
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// IsAllowed เช็คว่าค่า value อยู่ในรายการที่อนุญาต (allowed) หรือไม่
// T comparable หมายถึงรองรับทุก type ที่ใช้ == หรือ != ได้ เช่น string, int, float, bool
func IsAllowed[T comparable](value T, allowed []T) bool {
	for _, a := range allowed {
		if value == a {
			return true
		}
	}
	return false
}

func GetUserIDFromCtx(ctx context.Context) (*uuid.UUID, error) {
	val := ctx.Value("current_user_id")
	if val == nil {
		return nil, errors.New("user id not found in context (middleware missing?)")
	}

	userID, ok := val.(uuid.UUID)
	if !ok {
		return nil, errors.New("internal error: invalid user id type")
	}

	return &userID, nil
}

// upload file size
const MaxFileSize = 5 * 1024 * 1024

func FileValidation(file *multipart.FileHeader) error {
	// file size
	if file.Size > MaxFileSize {
		return NewValidationError("ไฟล์ใหญ่เกินไป (ห้ามเกิน 5MB)")
	}

	// file ext
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".pdf":  true,
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		return NewValidationError("นามสกุลไฟล์ไม่ได้รับอนุญาต (รับเฉพาะ JPG, PNG และ PDF เท่านั้น)")
	}

	// file mime type
	f, err := file.Open()
	if err != nil {
		return err
	}
	defer f.Close()

	// read first 512 byte
	buffer := make([]byte, 512)
	f.Read(buffer)
	contentType := http.DetectContentType(buffer)

	allowedTypes := map[string]bool{
		"image/jpeg":      true,
		"image/png":       true,
		"application/pdf": true,
	}

	if !allowedTypes[contentType] {
		return NewValidationError("ข้อมูลในไฟล์ไม่ตรงกับประเภทไฟล์ (File Mismatch)")
	}

	return nil
}

func ImageValidation(file *multipart.FileHeader) error {
	// file size
	if file.Size > MaxFileSize {
		return NewValidationError("ไฟล์ใหญ่เกินไป (ห้ามเกิน 5MB)")
	}

	// file ext
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		return NewValidationError("นามสกุลไฟล์ไม่ได้รับอนุญาต (รับเฉพาะ JPG, PNG และ WEBP เท่านั้น)")
	}

	// file mime type
	f, err := file.Open()
	if err != nil {
		return err
	}
	defer f.Close()

	// read first 512 byte
	buffer := make([]byte, 512)
	f.Read(buffer)
	contentType := http.DetectContentType(buffer)

	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
		"image/gif":  true,
	}

	if !allowedTypes[contentType] {
		return NewValidationError("ข้อมูลในไฟล์ไม่ตรงกับประเภทไฟล์ (File Mismatch)")
	}

	return nil
}

// uuid slice
func ParseUUIDs(input string) ([]uuid.UUID, error) {
	items := strings.Split(input, ",")
	uuids := make([]uuid.UUID, 0, len(items))

	for _, item := range items {
		u, err := uuid.Parse(strings.TrimSpace(item))
		if err != nil {
			return nil, err // uuid ผิดพลาด
		}
		uuids = append(uuids, u)
	}
	return uuids, nil
}

func Contains(arr []uuid.UUID, target uuid.UUID) bool {
	for _, v := range arr {
		if v == target {
			return true
		}
	}
	return false
}
