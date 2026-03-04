// hash-password.js
const bcrypt = require('bcryptjs');

const password = '55555..'; // เปลี่ยนเป็นรหัสผ่านที่ต้องการ
const hash = bcrypt.hashSync(password, 10);
console.log(hash);