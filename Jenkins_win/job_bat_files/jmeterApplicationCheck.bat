
set path=%SetPath%

REM Jmeter results file location generally set to some temp location for verify, so as not to be confused with actual test

break>%OverrideTestResultsFile%

C: 
cd %JmeterHome%\bin

jmeter -n -f -t %JmeterTestPlan% -l %OverrideTestResultsFile% -JDuration=%Duration% -JUsers=%Users% %LoggingLevel% %ConfigFileLocation%  %ExtraParam1% %ExtraParam2% %ExtraParam3% %ExtraParam4% %ExtraParam5% %ExtraParam6%

pause
