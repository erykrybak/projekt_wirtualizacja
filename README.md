# Projekt: Przepisy i lista zakupów

## Cel projektu

Aplikacja ma na celu ułatwić zarządzanie zakupami i przygotowywanie posiłków. Pozwoli na trzymanie wszystkich ulubionych i sprawdzonych przepisów w jednym miejscu. Po wybraniu (lub wylosowaniu) przepisu potrawy, automatycznie doda na listę zakupów potrzebne składniki. Przy okazji podrzuci brakujące produkty codziennej potrzeby. W ten sposób oszczędzi nam zamrtwiania się, co zrobić na obiad i czego brakuje w lodówce.

## Uruchomienie

```bash
docker compose up
```

## Dokumentacja

Frontend:
- obraz kontenera: nginx
- port: 8080:80
- wolumeny: 
    - pliki strony: `./frontend` montowany do `/usr/share/nginx/html` (read-only)
    - pliki konfiguracyjne: `./nginx.conf` montowany do `/etc/nginx/conf.d/default.conf` (read-only)
- uruchamia się po backendzie

Backend:
- obraz kontenera: node 26 
- katalog roboczy: /app 
- wolumeny: 
    - `./backend` montowany do `/app`
    - `/app/node_modules`
- instalacja automatyczna 
- konfiguracja dostępu do bazy pobierana z `.env`
- adres hosta bazy: `database`
- uruchamia się po pozytywnym `healtcheck` od bazy danych

Database:
- mysql 9.7
- tworzy bazę danych i użytkownika na podstawie `.env`
- używa losowego hasła dla roota 
- wolumeny: `mysql-data` montowany do `/var/lib/mysql`
- stan monitorowany co 5 sekund poleceniem `mysqladmin ping`

Sieci:
- `frontend-network` służąca do porozumiewania się frontendu z backendem 
- `backend-network` odizoloana sieć służąca do porozumiewania się backendu z bazą danych
 