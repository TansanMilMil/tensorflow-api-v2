const crypto = require('crypto');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

const loadDbConnection = function() {
    const db = JSON.parse(fs.readFileSync('./environment/dbconnection.json'));
    const pool = new pg.Pool({
        database: db.DATABASE,
        user: db.USER,
        password: db.PASSWORD,
        host: db.HOST,
        port: db.PORT,
        ssl: {
            rejectUnauthorized: false,
        },
        sslfactory: "org.postgresql.ssl.NonValidatingFactory",
    });
    return pool;
};

exports.createOnetimePassAsync = async function(req) {
    const N = 16;
    const pass = crypto.randomBytes(N).toString('base64').substring(0, N);

    const pool = loadDbConnection();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            INSERT INTO api_onetime_pass (
                pass
                , referer
            )
            VALUES (
                '${pass}'
                , '${req.header('Referrer')}'
            );
        `);
        await client.query("COMMIT");
        return pass;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

exports.getPassAsync = async function(req) {
    const pool = loadDbConnection();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(`
            SELECT COUNT(*)
            FROM api_onetime_pass
            WHERE pass = '${req.body.pass}'
            	AND current_timestamp <= create_at + INTERVAL '1 minutes'
        `);
        await client.query("COMMIT");
        return result.rows[0].count;
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};