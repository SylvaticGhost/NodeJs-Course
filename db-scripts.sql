CREATE TABLE users (
    id uuid PRIMARY KEY,
    username varchar(20) NOT NULL UNIQUE,
    password_hash varchar(64) NOT NULL,
    password_salt varchar(128) NOT NULL
);

CREATE TABLE notes (
    id uuid PRIMARY KEY,
    owner_id uuid NOT NULL,
    title varchar(30) NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    CHECK ( created_at <= updated_at ),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
