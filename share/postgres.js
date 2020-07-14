const crypto = require('crypto');
const pg = require('pg');
const fs = require('fs');
const path = require('path');
const db = JSON.parse(fs.readFileSync('./environment/dbconnection.json'));
const env = JSON.parse(fs.readFileSync('./environment/env.json'));

const loadDbConnection = function() {
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
            --delete old records was left.
            DELETE FROM api_onetime_pass
            WHERE current_timestamp > create_at + INTERVAL '${env.WATING_TIME_FOR_NEXT_CHECK_IMAGE}'
        `);               
        
        const duplicatedIpCount = await client.query(`
            SELECT COUNT(*)
            FROM api_onetime_pass
            WHERE create_ip = '${req.headers['x-forwarded-for'] || req.connection.remoteAddress}'
            ;
        `);        
        if (duplicatedIpCount.rows[0].count >= 1) {
            throw ({status: 429});
        }          
        
        await client.query(`
            INSERT INTO api_onetime_pass (
                pass
                , referer
                , create_ip
                , update_ip
            )
            VALUES (
                '${pass}'
                , '${req.header('Referrer')}'
                , '${req.headers['x-forwarded-for'] || req.connection.remoteAddress}'
                , '${req.headers['x-forwarded-for'] || req.connection.remoteAddress}'
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
            	AND current_timestamp <= create_at + INTERVAL '${env.WATING_TIME_FOR_NEXT_CHECK_IMAGE}'
            ;
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