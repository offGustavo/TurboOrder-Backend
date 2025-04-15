import mysql from "mysql";

export const db = mysql.createConnection({
    host: "localhost",
    user: "turboOrder",
    password: "turboOrder",
    database: "turboOrder"
});

// CREATE USER 'turboOrder'@'localhost' IDENTIFIED BY 'turboOrder';
// GRANT ALL PRIVILEGES ON turboOrder.* TO 'turboOrder'@'localhost';
// CREATE TABLE turboOrder;
// USE turboOrder;
