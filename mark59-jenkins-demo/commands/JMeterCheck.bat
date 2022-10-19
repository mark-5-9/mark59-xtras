REM   --------------------------------------------------------------------------------------------------------------
REM   |  Mark59 Verification Job for a JMeter test in Jenkins
REM   --------------------------------------------------------------------------------------------------------------

ECHO JAVA_HOME : %JAVA_HOME%

set path=%SetPath%

ECHO Using path %path%

java -version

break>%OverrideTestResultsFile%

if "%KillDrivers%" equ "true" (
    ECHO Kill all selenium drivers etc lying around from previous runs 
    C:
    REM C:\Windows\System32\TASKKILL /IM chrome.exe /F    // Never killing this for the Demo :) 
    C:\Windows\System32\TASKKILL /IM firefox.exe /F
    C:\Windows\System32\TASKKILL /IM geckodriver.exe /F
    C:\Windows\System32\TASKKILL /IM chromedriver.exe /
)

cd %JmeterHome%\bin

jmeter -n -f -t %JmeterTestPlan% -l %OverrideTestResultsFile% -JDuration=%Duration% -JUsers=%Users% -JMonitoringUsers=%MonitoringUsers% %LoggingLevel% %ExtraParam1% %ExtraParam2% %ExtraParam3% %ExtraParam4% %ExtraParam5% %ExtraParam6% %ExtraParam7% %ExtraParam8% %ExtraParam9% %ExtraParam10%

pause
