param(
  [Parameter(Mandatory=$false)][string]$PythonPath = "C:\Python310\python.exe",
  [Parameter(Mandatory=$false)][string]$ProjectRoot = "$HOME\Trey_KB_Daemon_Starter"
)

$ErrorActionPreference = "Stop"

$kbDaemon = Join-Path $ProjectRoot "kb_daemon.py"
$action = New-ScheduledTaskAction -Execute $PythonPath -Argument $kbDaemon
$trigger1 = New-ScheduledTaskTrigger -AtLogOn
$trigger2 = New-ScheduledTaskTrigger -Once (Get-Date).AddMinutes(1)
$trigger2.Repetition = (New-ScheduledTaskTrigger -Once (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)).Repetition
$principal = New-ScheduledTaskPrincipal -UserId $env:UserName -LogonType Interactive -RunLevel Highest

$task = New-ScheduledTask -Action $action -Trigger @($trigger1, $trigger2) -Principal $principal -Settings (New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable)

Register-ScheduledTask -TaskName "TreyKBDaemon" -InputObject $task -Force | Out-Null

Write-Host "Registered Scheduled Task 'TreyKBDaemon' to run kb_daemon.py at logon and every 5 minutes."
