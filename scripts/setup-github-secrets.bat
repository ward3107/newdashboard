@echo off
setlocal enabledelayedexpansion

REM GitHub Secrets Setup Script for Windows
REM This script helps you set up all required GitHub secrets for CI/CD

echo.
echo ================================
echo GitHub Secrets Setup for CI/CD
echo ================================
echo.

REM Check if gh CLI is installed
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: GitHub CLI is not installed.
    echo Please install it from: https://cli.github.com/
    exit /b 1
)

REM Check if user is authenticated
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: You're not authenticated with GitHub CLI
    echo Running: gh auth login
    gh auth login
)

echo GitHub CLI authenticated successfully
echo.

REM VERCEL_TOKEN (Required)
echo ========================================
echo Setting up VERCEL_TOKEN (Required)
echo Get your token from: https://vercel.com/account/tokens
echo.
gh secret set VERCEL_TOKEN
if %errorlevel% equ 0 (
    echo VERCEL_TOKEN set successfully
) else (
    echo Failed to set VERCEL_TOKEN
    exit /b 1
)
echo.

REM VERCEL_ORG_ID (Required)
echo ========================================
echo Setting up VERCEL_ORG_ID (Required)
echo.
echo To get your Vercel Org ID:
echo   1. Run: vercel link
echo   2. Check .vercel\project.json for orgId
echo.
gh secret set VERCEL_ORG_ID
if %errorlevel% equ 0 (
    echo VERCEL_ORG_ID set successfully
) else (
    echo Failed to set VERCEL_ORG_ID
    exit /b 1
)
echo.

REM VERCEL_PROJECT_ID (Required)
echo ========================================
echo Setting up VERCEL_PROJECT_ID (Required)
echo.
echo To get your Vercel Project ID:
echo   1. Run: vercel link
echo   2. Check .vercel\project.json for projectId
echo.
gh secret set VERCEL_PROJECT_ID
if %errorlevel% equ 0 (
    echo VERCEL_PROJECT_ID set successfully
) else (
    echo Failed to set VERCEL_PROJECT_ID
    exit /b 1
)
echo.

REM SLACK_WEBHOOK (Optional)
echo ========================================
set /p setup_slack="Do you want to set up Slack notifications? (y/n): "
if /i "%setup_slack%"=="y" (
    echo Get your webhook from: https://api.slack.com/apps
    gh secret set SLACK_WEBHOOK
    if %errorlevel% equ 0 (
        echo SLACK_WEBHOOK set successfully
    )
) else (
    echo Skipping Slack setup - notifications will be disabled
)
echo.

REM SNYK_TOKEN (Optional)
echo ========================================
set /p setup_snyk="Do you want to set up Snyk security scanning? (y/n): "
if /i "%setup_snyk%"=="y" (
    echo Get your token from: https://snyk.io/account
    gh secret set SNYK_TOKEN
    if %errorlevel% equ 0 (
        echo SNYK_TOKEN set successfully
    )
) else (
    echo Skipping Snyk setup - security scanning will be skipped
)
echo.

REM CODECOV_TOKEN (Optional)
echo ========================================
set /p setup_codecov="Do you want to set up Codecov? (y/n): "
if /i "%setup_codecov%"=="y" (
    echo Get your token from: https://codecov.io/
    gh secret set CODECOV_TOKEN
    if %errorlevel% equ 0 (
        echo CODECOV_TOKEN set successfully
    )
) else (
    echo Skipping Codecov setup - coverage upload will be skipped
)
echo.

echo ========================================
echo GitHub Secrets setup complete!
echo.
echo Summary of configured secrets:
gh secret list
echo.
echo Your CI/CD pipeline is now ready to use!
echo.
echo Next steps:
echo   1. Push your code to trigger the workflow
echo   2. Check the Actions tab on GitHub
echo   3. Monitor deployments on Vercel dashboard
echo.

pause
