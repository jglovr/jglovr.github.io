@echo off
cls
echo =======================================================================
echo   ApexCAD 3D Workstation - 3.5" High-Density Floppy Disk (Drive A:\)
echo =======================================================================
echo   Launching ApexCAD 3D Solid Modeling Engine...
echo.
start msedge --kiosk --edge-kiosk-type=fullscreen "%~dp0APEXCAD.HTML" || start chrome --kiosk "%~dp0APEXCAD.HTML" || start "" "%~dp0APEXCAD.HTML"
