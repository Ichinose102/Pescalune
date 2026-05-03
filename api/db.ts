 import { sql } from '@vercel/postgres';
   
    export const query = (text: string, params?: any[]) => sql.query(text,
    params);
   
    export default sql;