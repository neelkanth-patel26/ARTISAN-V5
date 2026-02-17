@echo off
echo ========================================
echo   Local Network Testing Setup
echo ========================================
echo.

echo Finding your IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo Your IP Address: !IP!
    echo.
    echo Access from your phone:
    echo http://!IP!:3000
    echo.
)

echo ========================================
echo   Instructions:
echo ========================================
echo.
echo 1. Make sure your phone is on the SAME WiFi
echo 2. Run: npm run dev
echo 3. Open the URL above on your phone
echo 4. Scroll to Section 06 to see QR code
echo.
echo The QR code will automatically show this URL!
echo.
echo ========================================

pause
