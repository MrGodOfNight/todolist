CREATE TABLE users (
	id serial4 NOT NULL,
	login varchar(100) NOT NULL,
	"password" varchar NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id),
	CONSTRAINT users_unique UNIQUE (login)
);

CREATE TABLE todos (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	description text NULL,
	iscompleted bool DEFAULT false NOT NULL,
	userid int4 NOT NULL,
	CONSTRAINT todos_pk PRIMARY KEY (id),
	CONSTRAINT todos_users_fk FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);