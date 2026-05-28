package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	_ "imaxx-smart-office-be/internal/pettycash/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadController interface {
	UploadFile(c *gin.Context)
}

type uploadControllerImpl struct{}

func NewUploadController() UploadController {
	return &uploadControllerImpl{}
}

// UploadFile godoc
// @Summary      Upload file
// @Description  Upload a file using multipart form-data with field name "file".
// @Tags         Upload
// @Accept       multipart/form-data
// @Produce      json
// @Security     BearerAuth
// @Param        file formData file true "File to upload"
// @Success      200  {object}  response.UploadResponse
// @Failure      400  {object}  response.ErrorResponse
// @Failure      500  {object}  response.ErrorResponse
// @Router       /api/upload [post]
func (u *uploadControllerImpl) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded or invalid file key (use 'file')"})
		return
	}
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must not exceed 10 MB"})
		return
	}

	purpose := strings.ToLower(strings.TrimSpace(c.PostForm("purpose")))
	if purpose == "profile" || purpose == "receipt" {
		contentType := file.Header.Get("Content-Type")
		ext := strings.ToLower(filepath.Ext(file.Filename))
		isImage := strings.HasPrefix(contentType, "image/") || ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp"
		isPDF := contentType == "application/pdf" || ext == ".pdf"
		if purpose == "profile" && !isImage {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Profile image must be an image file"})
			return
		}
		if purpose == "receipt" && !isImage && !isPDF {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Receipt file must be an image or PDF"})
			return
		}
	}

	userID, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userFolder := fmt.Sprint(userID)
	if _, err := uuid.Parse(userFolder); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	uploadDir := filepath.Join(".", "uploads", "pettycash", userFolder)
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload folder"})
		return
	}

	newFileName := filepath.Base(file.Filename)
	savePath := filepath.Join(uploadDir, newFileName)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	fileURL := fmt.Sprintf("/uploads/pettycash/%s/%s", userFolder, newFileName)
	c.JSON(http.StatusOK, gin.H{"url": fileURL, "fileName": file.Filename, "fileSize": file.Size})
}
