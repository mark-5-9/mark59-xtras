REM   --------------------------------------------------------------------------------------------------------------
REM   |  Mark59 Execute a JMeter test in Jenkins
REM   --------------------------------------------------------------------------------------------------------------

if %RunCI% equ false (
   call C:\work\Admin\JenkinsConfig\reportUnstable.bat
   Exit /B 0
)

echo "execting test plan.........................."

if %ScriptVerificationPassed% equ false (
   Exit /B 1
)

if %ScriptVerificationPassed% equ true (

    C:
    if exist C:\Mark59_Runs\Jmeter_Results\%Application%\ RD /Q /S C:\Mark59_Runs\Jmeter_Results\%Application%
    mkdir C:\Mark59_Runs\Jmeter_Results\%Application%

    REM https://www.howtogeek.com/forum/topic/wmic-not-recognized-as-an-internal-or-external-command (wmic, similar issue for ssh)

    set path=%SetPath%

    cd %JmeterHome%\bin

    break>C:\Mark59_Runs\Jmeter_Results\%Application%\%TestResultsFileName%

    jmeter -n -X -f -t %JmeterTestPlan% -Dlog4j2.formatMsgNoLookups=true -Dserver.rmi.ssl.disable=true -Dlog4j2.formatMsgNoLookups=true %DistributedIPsList% -l C:\Mark59_Runs\Jmeter_Results\%Application%\%TestResultsFileName%  %Duration% %ExtraParam1% %ExtraParam2% %ExtraParam3% %ExtraParam4% %ExtraParam5% %ExtraParam6% %ExtraParam7% %ExtraParam8% %ExtraParam9% %ExtraParam10%
	
    EXIT /B 0
)