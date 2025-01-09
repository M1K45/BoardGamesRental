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
    status VARCHAR(100)
);

--Stworzono osobną tabelę dla zdjęć gier
-- powód: https://softwareengineering.stackexchange.com/questions/264779/creating-a-separate-table-for-images-or-adding-image-fields-to-many-tables
CREATE TABLE images (
    imageid SERIAL PRIMARY KEY,
    gameid INTEGER NOT NULL REFERENCES games(gameid) ON DELETE CASCADE,
    priority BOOLEAN DEFAULT FALSE, -- priorytet określa, ktore zdjecie bedzie wyswietlane jako pierwsze w rozpisce oferty
    image_url TEXT NOT NULL
);


CREATE TABLE rentals (
    rentalid SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES users(id),
    gameid INTEGER NOT NULL REFERENCES games(gameid),
    enddate TIMESTAMP NOT NULL,
    returnstatus VARCHAR(100) NOT NULL
);

-- dla admina zahashowane hasło to "admin", dla Johna "password123"
-- (podano hasła na potrzeby logowania się do przykładowych kont)
INSERT INTO users (name, email, password, status) VALUES ('John Doe', 'john.doe@example.com', '$2a$10$we4.NLY4CXr2iQqd4Bf3meHSvouowSsSXBPlgP6KFPcunFfPzZGqm', 0),
('Admin', 'admin@example.com', '$2a$10$oV0SXk/e3I.iInSTiCaxFOcd/821DC6MFNcsxf0AoGT.sgdgw6k26', 1);

-- Dodanie przykładowych gier
-- (bez zdjęć, przy normalnym dodawaniu gier, dodanie przynajmniej jednego zdjęcia będzie wymagane): 
INSERT INTO games (title, theme, players, difficulty, description, status) VALUES 
('Catan', 'Strategy', 4, 'Medium', 'A game about trading and building settlements.', 'Available'),
('Monopoly', 'Economic', 6, 'Easy', 'A classic game of buying, trading, and developing properties.', 'Available'),
('Dungeons & Dragons', 'RPG', 6, 'Medium', 'Dungeons & Dragons is a tabletop role-playing game where players create characters and embark on adventures in a fantasy world. It combines storytelling, strategy, and dice rolls to resolve actions and shape the outcome of quests.', 'Available'),
('Jungle Speed', 'Dexterity', 10, 'Easy', 'Jungle Speed is a fast-paced card game where players must quickly match symbols on their cards and grab a totem in the center when a match occurs.', 'Available'),
('Pandemic', 'Cooperative', 4, 'Medium', 'Pandemic is a cooperative board game where players work together to stop global disease outbreaks. The goal is to discover cures before time runs out.', 'Available'),
('UNO', 'Card Games', 10, 'Easy', 'Uno is a fast-paced card game where players try to be the first to play all their cards by matching them with the top card on the discard pile by color or number.', 'Available'),
('Jenga', 'Dexterity', 5, 'Medium', 'Jenga is a game where players take turns removing one block at a time from a tower of wooden blocks, aiming to avoid toppling the structure.', 'Pending');

--Dodanie zdjęć do gier ( z priotytetem): 
INSERT INTO images (gameid, image_url, priority) VALUES 
(1, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/catan.png', TRUE),
(2, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/monopoly.jpg', TRUE),
(3, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/dad.jpg', TRUE ),
(4, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/jungle-speed.jpg', TRUE),
(5, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/Pandemic.jpg' , TRUE),
(6, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/uno.jpg', TRUE),
(7, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/jenga.jpg', TRUE);

-- dodanie kilku zdjęć do tych gier bez priorytetu: 
INSERT INTO images (gameid, image_url) VALUES
(1, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/catan-unpacked.jpg'),
(2, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/monopoly+-+unpacked.jpg'),
(4, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/jungle-speed-gameplay.jpg'),
(4, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/jungle-speed-unpacked.jpg'),
(5, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/pandemic-cards.jpg'),
(6, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/uno-gameplay.jpg'),
(7, 'https://boardgamesrentalphotos.s3.eu-north-1.amazonaws.com/photos/jenga-gameplay.jpg');

-- Dodanie instancji wypożyczenia jednej z gier
--ze sztucznym terminem zwrotu, w celu przetestowania odpowiedniego powiadomienia
INSERT INTO rentals (userid, gameid, enddate, returnstatus) VALUES
(1, 7, CURRENT_DATE + INTERVAL '1 day', 'Pending');


