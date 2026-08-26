@echo off
title Compilando Bom Sucesso Mailing Executavel...
echo ===================================================
echo   Compilando BomSucessoMailing.exe
echo ===================================================
echo.

set CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe

if not exist "%CSC%" (
    set CSC=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
)

if not exist "%CSC%" (
    echo Erro: Compilador C# nao encontrado em C:\Windows\Microsoft.NET\
    pause
    exit /b 1
)

"%CSC%" /target:winexe /out:"%~dp0BomSucessoMailing.exe" /r:System.Windows.Forms.dll,System.Drawing.dll,System.dll "%~dp0Program.cs"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo   SUCESSO! BomSucessoMailing.exe gerado com exito!
    echo ===================================================
) else (
    echo.
    echo Erro ao compilar. Codigo de saida: %ERRORLEVEL%
)

pause
