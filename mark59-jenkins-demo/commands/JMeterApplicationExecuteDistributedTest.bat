REM
REM  Run a Jmeter Test in non-GUI mode from Jenkins (standalone or distributed) 
REM  
REM  Note: to change a Jmeter property add -J{property}={value} to the jmeter command  (-G is required to pass to all instances in a distributed test).
REM        eg, to use xml as the default output file format:
REM        jmeter -n -X -f -t %JmeterTestPlan% %DistributedIPsList% -Jjmeter.save.saveservice.output_format=xml -l C:\Jmeter_Results.....
REM

if %RunCI% equ false (
   call C:\work\Admin\JenkinsConfig\reportUnstable.bat
   Exit /B 0
)

echo "execting test plan.........................."

if %ScriptVerificationPassed% equ false (
   Exit /B 1
)

if %ScriptVerificationPassed% equ true (

	if %CopyResults% equ true (
       RMDIR %CopyResutsDirectory% /s /q   
    )
	
    C:
    if exist C:\Jmeter\Jmeter_Results\%Application%\ RD /Q /S C:\Jmeter\Jmeter_Results\%Application%
    mkdir C:\Jmeter\Jmeter_Results\%Application%

    REM https://www.howtogeek.com/forum/topic/wmic-not-recognized-as-an-internal-or-external-command (wmic, similar issue for ssh)

    set path=%SetPath%

    cd %JmeterHome%\bin

    break>C:\Jmeter\Jmeter_Results\%Application%\%TestResultsFileName%

	jmeter -n -X -f -t %JmeterTestPlan% -Dserver.rmi.ssl.disable=true %DistributedIPsList% -Djava.rmi.server.hostname=%MasterIP% -Dlog4j2.formatMsgNoLookups=true -l C:\Jmeter\Jmeter_Results\%Application%\%TestResultsFileName%  %Duration% %ExtraParam1% %ExtraParam2% %ExtraParam3% %ExtraParam4% %ExtraParam5% %ExtraParam6% %ExtraParam7% %ExtraParam8% %ExtraParam9% %ExtraParam10%

	if %CopyResults% equ true (
        MKDIR %CopyResutsDirectory%
        COPY C:\Jmeter\Jmeter_Results\%Application% %CopyResutsDirectory%
    )	
	
    EXIT /B 0
)