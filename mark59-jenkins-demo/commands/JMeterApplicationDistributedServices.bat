 /@echo off
if %RunCI% equ false (
   call C:\work\Admin\JenkinsConfig\reportUnstable.bat
   Exit /B 0
)

if %ScriptVerificationPassed% equ false (
   Exit /B 1
)

set path=%SetPath%

echo; 
set slaveServers=%DistributedServersList%
echo slaveServers: %slaveServers%
echo; 
	
for %%s in ("%slaveServers:,=" "%") do (

	echo starting jmeter-server on slave name:ip %%s ..  
	
	for /f "tokens=1,2 delims=:" %%a in (%%s) do (
		echo   RUNNING COMMAND: /node:%%a process call create "%JmeterHome%\bin\jmeter-server.bat -Djava.rmi.server.hostname=%%b -Dlog4j2.formatMsgNoLookups=true"
		wmic /node:%%a process call create "%JmeterHome%\bin\jmeter-server.bat -Djava.rmi.server.hostname=%%b -Dlog4j2.formatMsgNoLookups=true -Dserver.rmi.ssl.disable=true"
		
		echo   For informational purposes only, displaying IP list for %%a ..  
		wmic /NODE:%%a nicconfig get IPAddress	
		
	)
)	

echo starting jmeter-server on master  .. 
echo    RUNNING COMMAND:  wmic process call create "%JmeterHome%\bin\jmeter-server.bat -Djava.rmi.server.hostname=%MasterIP% -Dlog4j2.formatMsgNoLookups=true"
wmic process call create "%JmeterHome%\bin\jmeter-server.bat -Djava.rmi.server.hostname=%MasterIP% -Dlog4j2.formatMsgNoLookups=true -Dserver.rmi.ssl.disable=true"

echo    For informational purposes only, displaying IP of master ..
wmic nicconfig get IPAddress 

Exit /B 0
