import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('pescalune.db');

function exportToSql() {
    let sql = '-- Migration Pescalune SQL\n\n';

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

    for (const table of tables) {
        const tableName = table.name;
        const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
        
        if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            sql += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES\n`;
            
            const values = rows.map(row => {
                const rowValues = columns.map(col => {
                    const val = row[col];
                    if (val === null) return 'NULL';
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    return val;
                });
                return `(${rowValues.join(', ')})`;
            });
            
            sql += values.join(',\n') + ';\n\n';
        }
    }

    fs.writeFileSync('migration.sql', sql);
    console.log('Fichier migration.sql généré avec succès.');
}

exportToSql();
