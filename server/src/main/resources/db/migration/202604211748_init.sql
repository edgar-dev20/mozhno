CREATE TABLE projects(
    name            varchar(255) not null,
    created_at      timestamp default now(),
    description     text
);

CREATE TABLE toggles(
  created_at        timestamp default now(),
  name              varchar(255) primary key not null,
  enabled           boolean default false,
  projectId         int unique
  strategy_name     varchar(255),
  parameters        json
);

CREATE TABLE events (
  id                serial primary key,
  created_at        timestamp default now(),
  type              varchar(255) not null,
  created_by        varchar(255) not null,
  data              json
);

CREATE TABLE strategies (
  created_at        timestamp default now(),
  name varchar(255) primary key not null,
  description       text
);