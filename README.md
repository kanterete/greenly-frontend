# 🌿 Greenly Frontend

Interfejs użytkownika (SPA) dla platformy **Greenly** – wirtualnego ogrodu i inteligentnego asystenta pielęgnacji roślin domowych i ogrodowych.

---

## 📋 Spis treści
- [Technologie](#-technologie)
- [Struktura widoków i funkcjonalności](#-struktura-widoków-i-funkcjonalności)
- [Architektura projektu](#-architektura-projektu)
- [Klient API i obsługa komunikacji](#-klient-api-i-obsługa-komunikacji)
- [Zmienne środowiskowe](#-zmienne-środowiskowe)
- [Instalacja i uruchomienie lokalne](#-instalacja-i-uruchomienie-lokalne)
- [Wdrożenie na Railway](#-wdrożenie-na-railway)

---

## 🛠 Technologie

- **Framework:** React 19
- **Bundler:** Vite
- **Routing:** React Router DOM v7
- **Ikony:** Lucide React
- **Zarządzanie stanem:** React Context API (`AuthContext`)
- **Styling:** Czysty, modularny CSS (zmienne CSS, flexbox, grid, responsywność RWD)

---

## 🌟 Struktura widoków i funkcjonalności

1. **Uwierzytelnianie (`/login`, `/register`):**
   - Rejestracja i logowanie użytkownika.
   - Zapis tokenu JWT w `localStorage` (`greenly_token`).
   - Automatyczna weryfikacja sesji w tle (`api.me()`).
   - Ochrona tras prywatnych przez komponent [`ProtectedRoute`](src/components/ProtectedRoute.jsx).

2. **Pulpit główny (`/dashboard`):**
   - Podsumowanie stanu ogrodu (liczba roślin, stref i oczekujących zadań).
   - Lista zadań pielęgnacyjnych przypadających na dzisiejszy dzień.
   - Widget prognozy pogody dla wybranej strefy.
   - Szybkie akcje (dodanie rośliny, utworzenie mikroklimatu).

3. **Wirtualny Ogród (`/garden`):**
   - Galeria wszystkich posiadanych roślin.
   - Filtrowanie po przypisanej strefie mikroklimatycznej i wyszukiwanie po nazwie.
   - Wizualne wskaźniki terminu kolejnego podlewania.

4. **Szczegóły i profil rośliny (`/plants/:id`):**
   - Karta rośliny ze zdjęciem, nazwą, opisem i przypisanym mikroklimatem.
   - Odznaczanie zrealizowanych zadań (np. podlano, nawożono, przycięto) z opcjonalną notatką.
   - Dynamiczny podgląd historii wykonanych zabiegów.
   - Opcja edycji oraz usuwania/archiwizowania rośliny.

5. **Kreator dodawania rośliny (`/plants/new`):**
   - Wyszukiwarka gatunków w zintegrowanym katalogu roślin (Perenual API).
   - Automatyczne podpowiadanie zalecanej częstotliwości podlewania na podstawie gatunku.
   - Przypisanie do pokoju lub ogrodu (mikroklimatu).
   - Wgrywanie własnego zdjęcia rośliny.

6. **Zarządzanie strefami mikroklimatów (`/microclimates`):**
   - Tworzenie stref wewnętrznych (**Indoor**) i zewnętrznych (**Outdoor**).
   - Definiowanie parametrów otoczenia: lokalizacja (dla pogody zewnętrznej), temperatura, wilgotność, nasłonecznienie.
   - Edycja parametrów i usuwanie stref.

7. **Harmonogram zadań (`/schedules`):**
   - Kalendarzowa lista nadchodzących prac ogrodniczych.
   - Moduł **Watering Recalculation** – przycisk do ręcznego uruchomienia zadania pogodowego przeliczającego terminy podlewania w zależności od deszczu i temperatury.

8. **Katalog roślin (`/catalog` oraz `/catalog/:id`):**
   - Przeglądanie bazy gatunków roślin z filtrami zapotrzebowania na wodę (*frequent, average, minimum*).
   - Szczegółowe wymagania hodowlane wybranego gatunku.

---

## 📁 Architektura projektu

```text
greenly-frontend/
├── index.html                # Główny szablon HTML
├── package.json              # Zależności i skrypty npm
├── src/
│   ├── main.jsx              # Punkt wejścia aplikacji React
│   ├── App.jsx               # Definicja tras React Router
│   ├── styles.css            # Style globalne, motyw kolorystyczny i RWD
│   ├── api/
│   │   └── client.js         # Centralny klient HTTP (apiFetch, normalizacja URL, obsługa błędów)
│   ├── components/           # Komponenty współdzielone
│   │   ├── AppLayout.jsx     # Główny layout z nawigacją i paskiem bocznym
│   │   ├── ProtectedRoute.jsx# Strażnik tras wymagających logowania
│   │   ├── PlantCard.jsx     # Karta prezentacji rośliny
│   │   ├── ImageUpload.jsx   # Komponent wgrywania zdjęć z podglądem
│   │   ├── WeatherSummary.jsx# Podgląd aktualnej pogody
│   │   ├── WateringRecalculation.jsx # Przeliczanie harmonogramów pogodowych
│   │   ├── CatalogPicker.jsx # Wybór gatunku z podpowiedziami
│   │   ├── Loading.jsx       # Wskaźnik ładowania danych
│   │   └── EmptyState.jsx    # Prezentacja pustych stanów
│   ├── context/
│   │   └── AuthContext.jsx   # Kontekst stanu autoryzacji i profilu użytkownika
│   ├── hooks/
│   │   └── useCatalog.js     # Hook do pobierania katalogu z anulowaniem zapytań (AbortController)
│   ├── pages/                # Widoki stron aplikacji
│   │   ├── Dashboard.jsx
│   │   ├── Garden.jsx
│   │   ├── PlantDetails.jsx
│   │   ├── AddPlant.jsx
│   │   ├── EditPlant.jsx
│   │   ├── Microclimates.jsx
│   │   ├── AddMicroclimate.jsx
│   │   ├── Schedules.jsx
│   │   ├── Catalog.jsx
│   │   ├── CatalogDetails.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── utils/
│       ├── format.js         # Formatowanie dat i tekstów
│       └── plantDraft.js     # Zarządzanie szkicami formularza rośliny
```

---

## 🔌 Klient API i obsługa komunikacji

Komunikacja z backendem odbywa się za pośrednictwem pliku [`src/api/client.js`](src/api/client.js):

- **Normalizacja adresu (`resolveApiUrl`):**
  Zapewnia prawidłowy format adresu backendu:
  - Automatycznie dopisuje protokół `https://`, jeśli w zmiennych środowiskowych pominięto protokół.
  - Automatycznie usuwa nadmiarowe slashe (`/`).
  - Gwarantuje prefiks ścieżki `/api`.
- **Autoryzacja nagłówków:**
  Automatycznie dołącza nagłówek `Authorization: Bearer <token>` dla każdego zapytania, jeśli token jest obecny w pamięci.
- **Szczegółowa diagnostyka błędów:**
  Zamiast ukrywać problem pod jednym hasłem, klient rozpoznaje:
  - Błędy sieciowe i CORS (wypisuje dokładny target URL w konsoli).
  - Kody odpowiedzi HTTP (np. `502 Bad Gateway`, `404 Not Found`).
  - Komunikaty błędów walidacji zwracane bezpośrednio przez backend w formacie JSON.

---

## ⚙️ Zmienne środowiskowe

W środowisku lokalnym utwórz plik `.env` w katalogu `greenly-frontend/`:

```env
# Adres działającego API Greenly Backend
VITE_API_URL=http://localhost:3000/api
```

Na produkcji (np. Railway):
```env
VITE_API_URL=https://twoj-backend.up.railway.app/api
```

> **Ważne:** W bibliotece Vite zmienne z prefiksem `VITE_` są wbudowywane do kodu produkcyjnego **w trakcie budowania (`vite build`)**. Każda zmiana zmiennej wymaga ponownego przebudowania aplikacji (Redeploy).

---

## 💻 Instalacja i uruchomienie lokalne

1. **Instalacja zależności:**
   ```bash
   npm install
   ```

2. **Uruchomienie serwera deweloperskiego Vite:**
   ```bash
   npm run dev
   ```
   Aplikacja będzie dostępna pod adresem: `http://localhost:5173`.

3. **Budowanie wersji produkcyjnej:**
   ```bash
   npm run build
   ```

4. **Podgląd wersji produkcyjnej lokalnie:**
   ```bash
   npm run preview
   ```

---

## ☁️ Wdrożenie na Railway

1. Połącz repozytorium `greenly-frontend` w usłudze Railway.
2. W zakładce **Variables** zdefiniuj:
   ```env
   VITE_API_URL=https://twoj-backend.up.railway.app/api
   ```
   *(Koniecznie z `https://` na początku)*.
3. Skrypt startowy w `package.json` uruchomi `vite preview --host 0.0.0.0 --port ${PORT:-4173}`, co pozwala Railway skierować ruch publiczny na odpowiedni port kontenera.
4. Po dodaniu lub zmianie `VITE_API_URL` kliknij **Redeploy**, aby Vite skompilował pliki statyczne z nowym adresem.
