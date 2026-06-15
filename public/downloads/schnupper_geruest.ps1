# =====================================================================
#  Schnuppertag IDS Stadt St. Gallen - Aufgabe 3: PowerShell-Skript
#  Grundgeruest - fuelle die mit  # TODO  markierten Stellen aus.
#  Bearbeiten im PowerShell-ISE-Editor.
# =====================================================================

Write-Host "=== PC-Informationen ===" -ForegroundColor Cyan

# 1) Computername anzeigen
$computername = $env:COMPUTERNAME
Write-Host "Computername : $computername"

# 2) Benutzername anzeigen
$benutzer = $env:USERNAME
Write-Host "Benutzer     : $benutzer"

# 3) Anzahl Prozessoren anzeigen
# TODO: Hole die Anzahl der logischen Prozessoren.
#       Tipp: (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
$prozessoren = "???"   # <-- ersetzen
Write-Host "Prozessoren  : $prozessoren"

Write-Host ""
Write-Host "=== Kleiner Rechner ===" -ForegroundColor Cyan

# 4) Zwei Zahlen vom Benutzer abfragen
$zahl1 = [double](Read-Host "Erste Zahl")
$zahl2 = [double](Read-Host "Zweite Zahl")

# 5) Rechenart abfragen (+, -, *, /)
$rechenart = Read-Host "Rechenart (+, -, *, /)"

# 6) Resultat berechnen und ausgeben
# TODO: Berechne das Resultat je nach Rechenart (switch oder if/else)
#       und gib es schoen formatiert aus.
switch ($rechenart) {
    "+" { $resultat = $zahl1 + $zahl2 }
    # TODO: -, *, /  ergaenzen (bei / durch 0 abfangen!)
    default { $resultat = "Unbekannte Rechenart" }
}

Write-Host ""
Write-Host "Resultat: $zahl1 $rechenart $zahl2 = $resultat" -ForegroundColor Green
