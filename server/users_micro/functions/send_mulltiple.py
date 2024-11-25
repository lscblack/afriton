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
ADROIT_PASSWORD = os.getenv("ADROIT_PASSWORD")
ADROIT_SENDER_EMAIL = os.getenv("ADROIT_SENDER_EMAIL")

def create_html_message(message_content: str) -> str:
    """Create a properly formatted HTML email message"""
    return f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="color: #666666; padding: 20px 0;">
                    {message_content}
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0; font-size: 12px; color: #999999; text-align: center;">
                    This is an automated message from Afriton. Please do not reply to this email.
                </div>
            </div>
        </body>
    </html>
    """

def send_new_multi_email(Email_to_list, Email_sub, Email_msg):
    """Send emails to multiple recipients with proper validation and error handling"""
    try:
        # Validate inputs
        if not Email_to_list or not isinstance(Email_to_list, list):
            raise ValueError("Email recipient list must be a non-empty list")
        if not Email_sub or not isinstance(Email_sub, str):
            raise ValueError("Email subject must be a non-empty string")
        if not Email_msg or not isinstance(Email_msg, str):
            raise ValueError("Email message must be a non-empty string")

        # Create formatted HTML message
        html_message = create_html_message(Email_msg)

        # Debug logs
        print(f"Preparing to send email to {len(Email_to_list)} recipients")
        print(f"Subject: {Email_sub}")
        print(f"Message length: {len(html_message)}")

        # Create message container
        msg = MIMEMultipart()
        msg['From'] = formataddr(("Afriton", ADROIT_SENDER_EMAIL))
        msg['To'] = ", ".join(Email_to_list)
        msg['Subject'] = Email_sub

        # Attach HTML part
        html_part = MIMEText(html_message, 'html', 'utf-8')
        msg.attach(html_part)

        # Send email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(ADROIT_USERNAME, ADROIT_PASSWORD)
            server.sendmail(
                ADROIT_SENDER_EMAIL,
                Email_to_list,
                msg.as_string()
            )

        print("Email sent successfully!")
        return True

    except ValueError as ve:
        print(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
