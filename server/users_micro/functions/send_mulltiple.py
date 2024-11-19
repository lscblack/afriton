from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

ADROIT_USERNAME = os.getenv("ADROIT_USERNAME")
ADROIT_PASSWORD = os.getenv("ADROIT_PASSWORD")  # Replace with App Password
ADROIT_SENDER_EMAIL = os.getenv("ADROIT_SENDER_EMAIL")

def send_new_multi_email(Email_to_list, Email_sub, Email_msg):
    if not isinstance(Email_to_list, list):
        raise ValueError("Email_to_list must be a list of email addresses.")

    # Create a comma-separated string of all email addresses
    recipient_emails = ", ".join(Email_to_list)

    msg = MIMEMultipart("alternative")
    msg['From'] = formataddr(("Adroit Love", ADROIT_SENDER_EMAIL))
    msg['To'] = recipient_emails  # Set all recipients at once
    msg['Subject'] = Email_sub
    full_message = Email_msg
    msg.attach(MIMEText(full_message, 'html', 'utf-8'))  # Specify UTF-8 encoding

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(ADROIT_USERNAME, ADROIT_PASSWORD)
            # Send the email to all recipients at once
            server.sendmail(ADROIT_SENDER_EMAIL, Email_to_list, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return True
