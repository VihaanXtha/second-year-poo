<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Circuit Bazaar - Vendor Portal Credentials</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f6f3f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #c6c6cd; border-radius: 8px; overflow: hidden; }
        .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .body { padding: 32px; text-align: center; }
        .credential-box { display: inline-block; background: #f6f3f5; border: 2px dashed #000000; border-radius: 8px; padding: 16px 32px; margin: 24px 0; text-align: left; }
        .credential-label { font-size: 12px; color: #45464d; text-transform: uppercase; letter-spacing: 1px; }
        .credential-value { font-size: 18px; font-weight: bold; color: #000000; margin-top: 4px; }
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
            <p>Your vendor account has been created. Use the following credentials to access the vendor portal:</p>
            <div class="credential-box">
                <div>
                    <div class="credential-label">Email</div>
                    <div class="credential-value">{{ $email }}</div>
                </div>
                <div style="margin-top: 16px;">
                    <div class="credential-label">Password</div>
                    <div class="credential-value">{{ $password }}</div>
                </div>
            </div>
            <p class="note">Please change your password after logging in. If you did not request this, please contact support.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Circuit Bazaar. All rights reserved.
        </div>
    </div>
</body>
</html>
