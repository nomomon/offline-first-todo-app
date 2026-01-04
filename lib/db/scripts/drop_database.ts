import db from "../_index";

function dropDatabase() {
	db.execute(`DROP TABLE IF EXISTS "users";`);
}

dropDatabase();
