import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',   
  password: '', 
  database: 'matador',
});

connection.connect((err) => {
  if (err) {
    console.error('خطأ في الاتصال بقاعدة البيانات: ', err.stack);
    return;
  }
  console.log('متصل بقاعدة البيانات كـ id ' + connection.threadId);
});

export default connection;
