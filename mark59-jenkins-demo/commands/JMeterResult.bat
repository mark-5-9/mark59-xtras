REM   --------------------------------------------------------------------------------------------------------------
REM   |  Mark59 Load Trends Database, report SLA breaches, create JMeter Reports
REM   --------------------------------------------------------------------------------------------------------------

C:
echo parmExecuteScriptVerificationPassed=%parmExecuteScriptVerificationPassed%
echo parmExecuteResult=%parmExecuteResult%

set PATH=%SetPath%

echo PATH is %PATH%

java -version

if "%parmExecuteResult%" equ "Execution_OK" (

    echo "load results into graphical comparative analysis tooling" 

    cd C:\mark59\mark59-trends-load\target
    java -jar mark59-trends-load.jar -a %Application% -i C:\Mark59_Runs\Jmeter_Results\%Application% -d h2 %eXcludestart% %captureperiod% -r "<a href='%BUILD_URL%HTML_Report'>run %BUILD_NUMBER%</a>"

    echo "convert xml file to csv" 

    if exist C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\ RD /S /Q C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED	
    mkdir C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\ 

    cd C:\mark59\mark59-results-splitter\target
    java -jar mark59-results-splitter.jar -iC:\Mark59_Runs\Jmeter_Results\%Application% -f%Application%TestResults_converted.csv -m%MetricsReportSplit% -e%ErrorTransactionNaming% -x%eXcludeResultsWithSub% -c%cdpfilter%

    echo "run jmeter report(s) generation"     


    rmdir /s /q C:\Mark59_Runs\JenkinsJmeterReports\%Application%
    md C:\Mark59_Runs\JenkinsJmeterReports\%Application%
    
    rmdir /s /q C:\Mark59_Runs\JenkinsJmeterReports\%Application%_CPU_UTIL
    md C:\Mark59_Runs\JenkinsJmeterReports\%Application%_CPU_UTIL
    
    rmdir /s /q C:\Mark59_Runs\JenkinsJmeterReports\%Application%_DATAPOINT
    md C:\Mark59_Runs\JenkinsJmeterReports\%Application%_DATAPOINT
    
    rmdir /s /q C:\Mark59_Runs\JenkinsJmeterReports\%Application%_MEMORY
    md C:\Mark59_Runs\JenkinsJmeterReports\%Application%_MEMORY

    rmdir /s /q C:\Mark59_Runs\JenkinsJmeterReports\%Application%_METRICS
    md C:\Mark59_Runs\JenkinsJmeterReports\%Application%_METRICS


    cd %JmeterHomeReportGeneration%\bin

    jmeter -Dlog4j2.formatMsgNoLookups=true -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted.csv -o C:\Mark59_Runs\JenkinsJmeterReports\%Application%

    jmeter -Dlog4j2.formatMsgNoLookups=true -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_CPU_UTIL.csv -o C:\Mark59_Runs\JenkinsJmeterReports\%Application%_CPU_UTIL	

    jmeter -Dlog4j2.formatMsgNoLookups=true -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_DATAPOINT.csv -o C:\Mark59_Runs\JenkinsJmeterReports\%Application%_DATAPOINT	

    jmeter -Dlog4j2.formatMsgNoLookups=true -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_MEMORY.csv -o C:\Mark59_Runs\JenkinsJmeterReports\%Application%_MEMORY	

    jmeter -Dlog4j2.formatMsgNoLookups=true -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Mark59_Runs\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_METRICS.csv -o C:\Mark59_Runs\JenkinsJmeterReports\%Application%_METRICS

    TIME /T
)


SET mailmessage=nothing

if "%parmExecuteResult%" equ "Execution_OK" (
   SET mailmessage=Scenario_Run_ok
)
if "%parmExecuteResult%" equ "Execution_failure" (
   SET mailmessage=Scenario_Run_Fail
)
if %parmExecuteScriptVerificationPassed% equ false (
   SET mailmessage=Script_verify_failure
) 


echo BEGINMAIL%mailmessage%ENDMAIL


if "%parmExecuteResult%" equ "Execution_OK" (
   exit 0
)
if "%parmExecuteResult%" equ "Execution_failure" (
   exit 1
)
if %parmExecuteScriptVerificationPassed% equ false (
   exit 1
) 
