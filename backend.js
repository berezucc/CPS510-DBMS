require('dotenv').config();

const oracledb = require('oracledb');
const express = require('express');
const cors = require('cors');

oracledb.initOracleClient({ libDir: 'instantclient_21_12' });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
    console.log("Hello");
})

//Creating tables endpoint
app.post('/create-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });

        const tableCreationStatements = [
            `CREATE TABLE Account (
                AccountID INT PRIMARY KEY,
                AccountName VARCHAR(255) NOT NULL,
                FirstName VARCHAR(255) NOT NULL,
                LastName VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                Rating INT CHECK (Rating >= 1 AND Rating <= 5)
            )`,
            `CREATE TABLE Passenger (
                PassengerID INT PRIMARY KEY,
                AccountID INT,
                SubscriptionType VARCHAR(255),
                DiscountPercent INT CHECK (DiscountPercent >= 0 AND DiscountPercent <= 100),
                NumOfReferrals VARCHAR(255),
                FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
            )`,
            `CREATE TABLE Driver (
                DriverID INT PRIMARY KEY,
                AccountID INT,
                LicenseNumber VARCHAR(255) NOT NULL,
                Experience INT,
                FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
            )`,
            `CREATE TABLE Registered_Car (
                CarID INT,
                DriverID INT,
                CarInsurance VARCHAR(255) CHECK (CarInsurance = 'Yes' OR CarInsurance = 'No'),
                FOREIGN KEY (DriverID) REFERENCES Driver(DriverID),
                PRIMARY KEY (CarID, DriverID)
            )`,
            `CREATE TABLE Car_Model (
                VINNumber INT CHECK (VINNumber >= 00000000000000001 and VINNumber <= 999999999999999999),
                CarModelName VARCHAR(255),
                CarYear INT CHECK (CarYear > 0 and CarYear <= 2024),
                PRIMARY KEY (VINNumber, CarModelName)
            )`,
            `CREATE TABLE Car_Make (
                CarID INT PRIMARY KEY,
                CarMakeName VARCHAR(255),
                CarModelName VARCHAR(255),
                VINNumber INT CHECK (VINNumber >= 00000000000000001 and VINNumber <= 999999999999999999),
                CarTier VARCHAR(255),
                FOREIGN KEY (VINNumber, CarModelName) REFERENCES Car_Model(VINNumber, CarModelName)
            )`,
            `CREATE TABLE Item (
                ItemID INT PRIMARY KEY,
                ItemName VARCHAR(255),
                ItemPrice DECIMAL(5, 2),
                ItemStore VARCHAR(255),
                ItemDescription VARCHAR(255)
            )`,
            `CREATE TABLE ORDERS(
                OrderID INT PRIMARY KEY,
                OrderDate DATE DEFAULT SYSDATE,
                OrderCost DECIMAL(5, 2),
                DriverID INT,
                FOREIGN KEY (DriverID) REFERENCES Driver(DriverID)
            )`,
            `CREATE TABLE PickupOrder (
                PickupOrderID INT PRIMARY KEY,
                OrderID INT,
                PassengerID INT,
                FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
                FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID)
            )`,
            `CREATE TABLE PackageOrder (
                PackageOrderID INT PRIMARY KEY,
                OrderID INT,
                ItemID INT,
                FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
                FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
            )`
        ];

        for (const statement of tableCreationStatements) {
            try {
                await connection.execute(statement, [], { autoCommit: true });
            } catch (err) {
                console.error('Error executing statement: ', statement, 'Error: ', err);
            }
        }

        res.status(200).send("Tables created successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});


//Inserting into table endpoint
app.post('/populate-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        console.log("Successfully connected to Oracle Database");

        const populateTableSql = ``;
        await connection.execute(populateTableSql);
        res.status(200).send("Tables Populated successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error Populating tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Dropping table endpoint
app.post('/drop-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        console.log("Successfully connected to Oracle Database");

        const dropTableSql = [
            `DROP TABLE ACCOUNT CASCADE CONSTRAINTS`,
            `DROP TABLE PASSENGER CASCADE CONSTRAINTS`,
            `DROP TABLE DRIVER CASCADE CONSTRAINTS`,
            `DROP TABLE ITEM CASCADE CONSTRAINTS`,
            `DROP TABLE ORDERS CASCADE CONSTRAINTS`,
            `DROP TABLE PACKAGEORDER CASCADE CONSTRAINTS`,
            `DROP TABLE PICKUPORDER CASCADE CONSTRAINTS`,
            `DROP TABLE Registered_Car CASCADE CONSTRAINTS`,
            `DROP TABLE Car_Model CASCADE CONSTRAINTS`,
            `DROP TABLE Car_Make CASCADE CONSTRAINTS`
        ];
        for (const statement of dropTableSql) {
            try {
                await connection.execute(statement, [], { autoCommit: true });
            } catch (err) {
                console.error('Error Dropping table statement: ', statement, 'Error: ', err);
            }
        }
        
        res.status(200).send("Tables dropped successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error dropping tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Viewing table endpoint
app.get('/select-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`select * from ${tableName}`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

const port = 4000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
