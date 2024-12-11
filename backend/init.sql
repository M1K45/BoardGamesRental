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
    password VARCHAR(255) NOT NULL
);

-- Dodanie przykładowych danych
INSERT INTO users (name, email, password) VALUES ('John Doe', 'john.doe@example.com', 'password123');
