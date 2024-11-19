def account_completion_email(names):
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AfriTon - Account Setup Complete</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossorigin="anonymous" referrerpolicy="no-referrer">
</head>
<body style="background-color: #f4f8fb; font-family: Arial, sans-serif; padding: 10px;">
<div style="width: 640px; margin: 40px auto; background-color: #ffffff; padding: 24px; color: #4a5568; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);">
    <div style='width:100px;height:100px;overflow:hidden;margin:10px auto;border-radius:100px'>
        <img src="https://example.com/logo.png" alt="AfriTon Logo" style='height:100%; object-fit: cover;' />
    </div>
    <p style="font-size: 1.125rem; margin-bottom: 16px;">Hi {names},</p>
    <p style="margin-bottom: 16px;">🎉 Congratulations on completing your AfriTon account setup!</p>
    <p style="margin-bottom: 16px;">
        You're now ready to send and receive money across borders with ease. To ensure your account remains secure, please verify your email address as soon as possible. 
    </p>
    <p style="margin-bottom: 16px;">
        Start enjoying features like real-time conversion to Afritons, secure transactions, and seamless withdrawals in your preferred currency.
    </p>
    <p style="margin-bottom: 16px;">
        If you have any questions or need assistance, our support team is available 24/7 to help you.
    </p>
    <p style="margin-bottom: 16px;">Best regards,<br />The AfriTon Team</p>
    <hr style="margin-bottom: 16px;" />
    <p style="font-size: 0.75rem; margin-top: 12px; text-align: center;">
        Visit our website: 
        <a href="https://www.afriton.com/" style="color: #3182ce;">https://www.afriton.com/</a>
    </p>
</div>
</body>
</html>
"""
