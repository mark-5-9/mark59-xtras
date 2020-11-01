C:
echo parmExecuteScriptVerificationPassed=%parmExecuteScriptVerificationPassed%
echo parmExecuteResult=%parmExecuteResult%

set PATH=%SetPath%

echo PATH       is %PATH%

java -version

if "%parmExecuteResult%" equ "Execution_OK" (
   

    echo "load results into graphical comparative analysis tooling" 

    cd C:\gitrepo\mark-5-9\mark59\metricsRuncheck\target
    java -jar metricsRuncheck.jar -a %Application% -i C:\Jmeter_Results\%Application% -h %mysqlserver%  -p %mysqlPort% -t JMETER %eXcludestart% %captureperiod% -r "<a href='%BUILD_URL%HTML_Report'>run %BUILD_NUMBER%</a>"

    echo "convert xml file to csv" 

    if exist C:\Jmeter_Results\%Application%\MERGED\ RD /S /Q C:\Jmeter_Results\%Application%\MERGED	
    mkdir C:\Jmeter_Results\%Application%\MERGED\ 

    cd C:\gitrepo\mark-5-9\mark59\resultFilesConverter\target
    java -jar resultFilesConverter.jar -iC:\Jmeter_Results\%Application% -f%Application%TestResults_converted.csv -m%MetricsReportSplit% -e%ErrorTransactionNaming% -x%eXcludeResultsWithSub%

    echo "run jmeter report(s) generation"     

    rmdir /s /q C:\htmlreport\%Application%
    md C:\htmlreport\%Application%
    
    rmdir /s /q C:\htmlreport\%Application%CpuUtil
    md C:\htmlreport\%Application%CpuUtil
    
    rmdir /s /q C:\htmlreport\%Application%Datapoint
    md C:\htmlreport\%Application%Datapoint
    
    rmdir /s /q C:\htmlreport\%Application%Memory
    md C:\htmlreport\%Application%Memory

    rmdir /s /q C:\htmlreport\%Application%Metrics
    md C:\htmlreport\%Application%Metrics


    cd %JmeterHomeReportGeneration%\bin

    jmeter -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted.csv -o C:\htmlreport\%Application%

    jmeter -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_CPU_UTIL.csv -o C:\htmlreport\%Application%CpuUtil	

    jmeter -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_DATAPOINT.csv -o C:\htmlreport\%Application%Datapoint	

    jmeter -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_MEMORY.csv -o C:\htmlreport\%Application%Memory	

    jmeter -Jjmeter.reportgenerator.overall_granularity=%Granularity% -g  C:\Jmeter_Results\%Application%\MERGED\%Application%TestResults_converted_METRICS.csv -o C:\htmlreport\%Application%Metrics

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