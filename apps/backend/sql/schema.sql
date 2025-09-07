CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payer_id UUID REFERENCES users(id) NOT NULL,
  amount INT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE payments (
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  debtor_id UUID REFERENCES users(id),
  amount INT NOT NULL,
  PRIMARY KEY(event_id, debtor_id)
);
