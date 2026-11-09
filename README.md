# Projekt: Przepisy i lista zakupów

## Cel projektu

Aplikacja ma na celu ułatwić zarządzanie zakupami i przygotowywanie posiłków. Pozwoli na trzymanie wszystkich ulubionych i sprawdzonych przepisów w jednym miejscu. Po wybraniu (lub wylosowaniu) przepisu potrawy, automatycznie doda na listę zakupów potrzebne składniki. Przy okazji podrzuci brakujące produkty codziennej potrzeby. W ten sposób oszczędzi nam zamrtwiania się, co zrobić na obiad i czego brakuje w lodówce.

## Uruchomienie

```bash
docker compose up
```

## Dokumentacja

### Budowa

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

### Format wymiany danych
1. Sprawdzenie stanu serwera i bazy
- Endpoint: `GET /health`
- Opis: sprawdzenie czy serwer odpowiada i czy ma poprawne połączenie z bazą danych
- Odpowiedź `200 OK`:
```json 
{
  "status": "ok",
  "message": "Backend łączy się z bazą"
}
```
- Odpowiedź `503 Service Unavailable`:
```json
{
  "status": "error",
  "message": "Brak połączenia z bazą"
}
```

2. Pobieranie wszystkich przepisów 
- Endpoint: `GET /api/recipes` 
- Opis: Zwraca listę wszystkich przepisów z bazy danych
- Odpowiedź `200 OK`:
```json 
[
  {
    "RecipeID": 1,
    "Title": "Naleśniki",
    "FileName": "nalesniki.md"
  },
  {
    "RecipeID": 2,
    "Title": "Spaghetti Bolognese",
    "FileName": "spaghetti.md"
  }
]
```
- Odpowiedź `500 Internal Server Error`:
```json
{
  "error": "Błąd bazy danych"
}
```

3. Pobieranie konkretnego przepisu
- Endpoint: `GET /api/recipes/:id`
- Opis: Zwraca przepis o podanym id 
- Odpowiedź `200 OK`:
```json 
{
  "RecipeID": 1,
  "Title": "Naleśniki",
  "FileName": "nalesniki.md"
}
```
- Odpowiedź `404 Not Found`:
```json 
{
  "error": "Nie znaleziono przepisu"
}
```

4. Dodawanie nowego przepisu 
- Endpoint: `POST /api/recipes`
- Nagłówki: `Content-Type: application/json`
- Request Body:
```json
{
  "Title": "Pizza Margharitta",
  "FileName": "pizza_margharitta.md"
}
```
- Odpowiedź `201 Created`:
```json 
{
  "message": "Utworzono przepis",
  "id": 3
}
```
- Odpowiedź `400 Bad Request`:
```json
{
  "error": "Pola 'Title' i 'FileName' muszą być niepustymi tekstami (max 255 znaków)"
}
```
```json
{
  "error": "Nieprawidłowy format JSON"
}
```

5. Usuwanie przepisu
- Endpoint: `DELETE /api/recipes/:id`
- Opis: Usunięcie przepisu o wskazanym id z bazy danych 
- Odpowiedź `200 OK`:
```json
{
  "message": "Przepis został usunięty"
}
```
- Odpowiedź `404 Not Found`:
```json
{
  "error": "Nie znaleziono przepisu do usunięcia"
}
```
