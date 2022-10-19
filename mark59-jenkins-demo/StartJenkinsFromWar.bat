REM   --------------------------------------------------------------------------------------------------------
REM   |  This bat assumes the jenkins.war file exists in current directory
REM   --------------------------------------------------------------------------------------------------------
@echo off
MODE con:cols=180 lines=500

java  -jar -DJENKINS_HOME="C:\jenkins\jenkins_home" -jar jenkins.war

PAUSE