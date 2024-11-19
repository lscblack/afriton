from fastapi import HTTPException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

AFRITON_USERNAME = os.getenv("AFRITON_USERNAME")
AFRITON_PASSWORD = os.getenv("AFRITON_PASSWORD")  # Replace with App Password
AFRITON_SENDER_EMAIL = os.getenv("AFRITON_SENDER_EMAIL")

def send_new_email(Email_to, Email_sub, Email_msg):
    msg = MIMEMultipart("alternative")
    msg['From'] = formataddr(("Afriton CrossBorder", AFRITON_SENDER_EMAIL))
    msg['To'] = Email_to
    msg['Subject'] = Email_sub
    full_message = Email_msg
    msg.attach(MIMEText(full_message, 'html', 'utf-8'))  # Specify UTF-8 encoding

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(AFRITON_USERNAME, AFRITON_PASSWORD)
            server.sendmail(AFRITON_SENDER_EMAIL, Email_to, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return True
