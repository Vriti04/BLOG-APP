// const fs = require('fs');

// const readAdmin=()=>{
//     if(!fs.existsSync("./admin.json")){
//         fs.writeFileSync("./admin.json".JSON.stringify([]));
//     }

//     const data = fs.readFileSync("./admin.json", 'utf-8');
//     if(data.trim()===""){
//         return [];
//     }
//     return JSON.parse(data,'utf-8');
// }

// const writeAdmin=(data)=>{
   
//     fs.writeFileSync("./admin.json", JSON.stringify(data, null, 2),'utf-8');
// }

// module.exports = { readAdmin, writeAdmin };