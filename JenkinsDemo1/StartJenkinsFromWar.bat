REM   --------------------------------------------------------------------------------------------------------
REM   |  This bat assumes - the jenkins.war file exists in the same directory as this bat .. Change as needed 
REM   --------------------------------------------------------------------------------------------------------
@echo off
MODE con:cols=180 lines=500

java -jar jenkins.war

PAUSE