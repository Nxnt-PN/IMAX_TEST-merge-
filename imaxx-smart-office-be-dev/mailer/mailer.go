package mailer

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log"
	"os"
	"strconv"
	"strings"

	"gopkg.in/gomail.v2"
)

// ใช้ directive นี้เพื่อฝังไฟล์เข้าไปในตัวแปร
//
//go:embed email_template.html
var templateFS embed.FS

type EmailData struct {
	Recipient string
	Message   string
	Link      string
}

func getEmailHTML(data EmailData) (string, error) {
	// read template from embed variable (no need for path ของ OS)
	tmpl, err := template.ParseFS(templateFS, "email_template.html")
	if err != nil {
		return "", err
	}

	var body bytes.Buffer
	if err := tmpl.Execute(&body, data); err != nil {
		return "", err
	}

	return body.String(), nil
}

func SendNotification(toEmail, title, recipient, message, link string) error {

	baseURL := os.Getenv("APP_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:3000" // for testing
	}

	fullLink := fmt.Sprintf("%s/%s", baseURL, strings.TrimPrefix(link, "/"))

	m := gomail.NewMessage()
	m.SetHeader("From", os.Getenv("APP_EMAIL_FROM"))
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", title)

	htmlContent, err := getEmailHTML(EmailData{Recipient: recipient, Message: message, Link: fullLink})
	if err != nil {
		log.Printf("Failed to create email to %s: %v", recipient, err)
		return err
	}

	m.SetBody("text/html", htmlContent)

	port, err := strconv.Atoi(os.Getenv("APP_EMAIL_PORT"))
	if err != nil {
		log.Fatalf("Invalid port: %v", err)
	}

	// Mailtrap SMTP
	d := gomail.NewDialer(os.Getenv("APP_EMAIL_HOST"), port, os.Getenv("APP_EMAIL_USERNAME"), os.Getenv("APP_EMAIL_PASSWORD"))

	// send email
	if err := d.DialAndSend(m); err != nil {
		log.Printf("Failed to send to %s: %v", recipient, err)
		return err
	}
	return nil
}
