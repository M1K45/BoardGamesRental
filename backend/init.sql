-- Przełączenie na domyślną bazę "postgres"
\c postgres

-- Zatrzymanie istniejących połączeń z bazą "my_database"
DO
$$
BEGIN
   PERFORM pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE datname = 'my_database' AND pid <> pg_backend_pid();
END
$$;

-- Usunięcie istniejącej bazy danych
DROP DATABASE IF EXISTS my_database;

-- Tworzenie nowej bazy danych
CREATE DATABASE my_database;

-- Przełączenie na nowo utworzoną bazę danych
\c my_database;

-- Tworzenie tabeli "users"
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    status INTEGER DEFAULT 0
    -- admin BOOLEAN DEFAULT FALSE
);
CREATE TABLE games (
    gameid SERIAL PRIMARY KEY,
    title VARCHAR(100),
    theme VARCHAR(100),
    players INTEGER,
    difficulty VARCHAR(100),
    description TEXT,
    status VARCHAR(100),
    image_url TEXT
);
CREATE TABLE rentals (
    rentalid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(id),
    gameid INTEGER NOT NULL REFERENCES games(gameid),
    enddate TIMESTAMP NOT NULL,
    returnstatus VARCHAR(100) NOT NULL
);

-- Dodanie przykładowych danych
--(komentarz na potrzeby projektu)
-- dla admina zahashowane hasło to "admin", dla Johna "password123"
INSERT INTO users (name, email, password, status) VALUES ('John Doe', 'john.doe@example.com', '$2a$10$we4.NLY4CXr2iQqd4Bf3meHSvouowSsSXBPlgP6KFPcunFfPzZGqm', 0),
('Admin', 'admin@example.com', '$2a$10$oV0SXk/e3I.iInSTiCaxFOcd/821DC6MFNcsxf0AoGT.sgdgw6k26', 1);
INSERT INTO games (title, theme, players, difficulty, description, status, image_url) VALUES ('Catan', 'Strategy', 4, 'Medium', 'A game about trading and building settlements.', 'Available', 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/catan.png' ),
('Monopoly', 'Economic', 6, 'Easy', 'A classic game of buying, trading, and developing properties.', 'Available', 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/monopoly.jpg' );
