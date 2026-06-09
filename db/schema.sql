

CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id       VARCHAR(20) UNIQUE NOT NULL,
  customer_name   VARCHAR(100) NOT NULL,
  customer_email  VARCHAR(150) NOT NULL,
  subject         VARCHAR(255) NOT NULL,
  description     TEXT,
  status          ENUM('Open', 'In Progress', 'Closed') DEFAULT 'Open',
  created_by      INT REFERENCES users(id),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id  VARCHAR(20) NOT NULL,
  note_text  TEXT NOT NULL,
  author     VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
);
