# Run in PowerShell as Administrator to allow LAN access to Circuit Bazaar ports.
netsh advfirewall firewall add rule name="Circuit-Bazaar-3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Circuit-Bazaar-3001" dir=in action=allow protocol=TCP localport=3001
netsh advfirewall firewall add rule name="Circuit-Bazaar-3002" dir=in action=allow protocol=TCP localport=3002
netsh advfirewall firewall add rule name="Circuit-Bazaar-8000" dir=in action=allow protocol=TCP localport=8000