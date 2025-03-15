import mysql from "mysql";

export const db = mysql.createConnection({
    host: "localhost",
    user: "turboOrder",
    password: "turboOrder",
    database: "turboOrder"
});

// CREATE USER 'turboOrder'@'localhost' IDENTIFIED WITH mysql_native_password BY 'turboOrder';
// GRANT ALL PRIVILEGES ON turboOrder TO 'turboOrder'@'localhost' WITH GRANT OPTION;
