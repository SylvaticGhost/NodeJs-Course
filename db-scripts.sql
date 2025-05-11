CREATE TABLE users (
    username varchar(20) PRIMARY KEY,
    password_hash varchar(64) NOT NULL
);
CREATE TABLE notes (
    id uuid PRIMARY KEY,
    owner varchar(20) NOT NULL,
    title varchar(30) NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    CHECK (created_at <= updated_at),
    FOREIGN KEY (owner) REFERENCES users(username)
);
CREATE TABLE note_interactions (
    note_id uuid NOT NULL,
    username varchar(20) NOT NULL,
    interacted_at timestamp NOT NULL,
    PRIMARY KEY (note_id, username, interacted_at),
    FOREIGN KEY (note_id) REFERENCES notes(id),
    FOREIGN KEY (username) REFERENCES users(username)
);
CREATE INDEX idx_username ON note_interactions(username);
