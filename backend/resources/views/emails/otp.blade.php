<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Circuit Bazaar - OTP</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f6f3f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #c6c6cd; border-radius: 8px; overflow: hidden; }
        .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .body { padding: 32px; text-align: center; }
        .otp-box { display: inline-block; background: #f6f3f5; border: 2px dashed #000000; border-radius: 8px; padding: 16px 32px; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000000; }
        .footer { padding: 16px; text-align: center; font-size: 12px; color: #45464d; }
        .note { font-size: 13px; color: #45464d; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Circuit Bazaar</h1>
        </div>
        <div class="body">
            <p>Your one-time passcode is:</p>
            <div class="otp-box">
                <div class="otp-code">{{ $code }}</div>
            </div>
            <p class="note">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Circuit Bazaar. All rights reserved.
        </div>
    </div>
</body>
</html>